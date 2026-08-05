'use client'

import {
  FaceLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { Product } from '@/payload-types'

/**
 * Real-time lip colour rendering over a webcam feed.
 *
 * The landmark rings, spline smoothing, even-odd fill and the two-pass
 * blur/overlay composite are ported from the PIXY lip-filter campaign app
 * (github.com/babono/lip-filter). Those values are hand-tuned — the 1.05 lip
 * scale, the 6px/4px blurs and the EMA smoothing all shipped and held up on
 * real devices, so they are kept verbatim.
 *
 * What changed for this codebase:
 *  - the model and WASM load from our own origin, not a relative path or a CDN
 *  - teardown stops the MediaStream, so the camera light goes out on close
 *  - pigment strength comes from the product's finish rather than being baked
 *    into an 8-digit hex per shade
 */

type Finish = NonNullable<NonNullable<Product['virtualTryOn']>['finish']>

/**
 * Catalogue swatches are opaque product colours. The campaign encoded coverage
 * in the alpha channel of each hex (#d3735a**bd**); here the finish supplies it,
 * so an editor can add a shade with nothing but a 6-digit colour.
 *
 *   alpha  — pigment opacity over the lips
 *   gloss  — strength of the specular highlight and wet-look sheen
 *   edge   — how strongly the outer lip line is drawn
 */
const FINISHES: Record<Finish, { alpha: number; edge: number; gloss: number }> = {
  sheer: { alpha: 0.4, edge: 0.25, gloss: 0.5 },
  tint: { alpha: 0.55, edge: 0.3, gloss: 0.35 },
  cream: { alpha: 0.72, edge: 0.35, gloss: 0.6 },
  matte: { alpha: 0.88, edge: 0.4, gloss: 0.08 },
  vinyl: { alpha: 0.68, edge: 0.35, gloss: 1 },
}

// MediaPipe FaceMesh mouth rings, in path order.
// Outer includes the upper-lip arc 291 -> 61 so the cupid's bow isn't flat.
const MOUTH_OUTER = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
]
const MOUTH_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82]

/** Outward scale from the mouth centroid — landmarks sit just inside the lip line. */
const LIP_SCALE = 1.05
/** Exponential moving average on landmarks; higher is steadier but laggier. */
const SMOOTH_ALPHA = 0.6
/** Detection cap in ms (~30fps). Rendering still runs at display rate. */
const DETECT_INTERVAL = 33

type FrameHandle = { id: number; isVideoFrame: boolean }

export type TryOnStatus = 'idle' | 'loading' | 'ready' | 'error'

type Options = {
  active: boolean
  color: string | null
  finish: Finish
}

const withAlpha = (hex: string, alpha: number): string => {
  const clamped = Math.max(0, Math.min(255, Math.round(alpha * 255)))
  return `${hex}${clamped.toString(16).padStart(2, '0')}`
}

/** Cardinal/Catmull-Rom through every point, closed — keeps the bow round. */
const smoothClosedPath = (points: [number, number][], tension = 0.55): Path2D => {
  const n = points.length
  const path = new Path2D()

  if (n < 3) {
    path.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < n; i++) path.lineTo(points[i][0], points[i][1])
    path.closePath()
    return path
  }

  const wrap = (i: number) => (i + n) % n
  path.moveTo(points[0][0], points[0][1])

  for (let i = 0; i < n; i++) {
    const p0 = points[wrap(i - 1)]
    const p1 = points[wrap(i)]
    const p2 = points[wrap(i + 1)]
    const p3 = points[wrap(i + 2)]

    path.bezierCurveTo(
      p1[0] + ((p2[0] - p0[0]) * tension) / 6,
      p1[1] + ((p2[1] - p0[1]) * tension) / 6,
      p2[0] - ((p3[0] - p1[0]) * tension) / 6,
      p2[1] - ((p3[1] - p1[1]) * tension) / 6,
      p2[0],
      p2[1],
    )
  }

  path.closePath()
  return path
}

export const useLipRenderer = ({ active, color, finish }: Options) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [status, setStatus] = useState<TryOnStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [hasFace, setHasFace] = useState(false)

  const landmarkerRef = useRef<FaceLandmarker | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectFrame = useRef<FrameHandle>({ id: 0, isVideoFrame: false })
  const renderFrame = useRef<FrameHandle>({ id: 0, isVideoFrame: false })
  const resultRef = useRef<FaceLandmarkerResult | null>(null)
  const smoothedRef = useRef<NormalizedLandmark[] | null>(null)
  const lastDetectRef = useRef(0)
  const runningRef = useRef(false)
  const supportsVideoFrame = useRef(false)
  const dprRef = useRef(1)
  const drawAreaRef = useRef({ height: 0, width: 0, x: 0, y: 0 })

  // Read inside the animation loop, so they must not go through state.
  const colorRef = useRef(color)
  const finishRef = useRef(FINISHES[finish])
  useEffect(() => {
    colorRef.current = color
  }, [color])
  useEffect(() => {
    finishRef.current = FINISHES[finish] ?? FINISHES.cream
  }, [finish])

  const cancelFrame = useCallback((handle: FrameHandle) => {
    if (!handle.id) return
    if (handle.isVideoFrame) videoRef.current?.cancelVideoFrameCallback(handle.id)
    else cancelAnimationFrame(handle.id)
    handle.id = 0
  }, [])

  const scheduleFrame = useCallback((handle: FrameHandle, callback: () => void) => {
    if (supportsVideoFrame.current && videoRef.current) {
      handle.isVideoFrame = true
      handle.id = videoRef.current.requestVideoFrameCallback(callback)
    } else {
      handle.isVideoFrame = false
      handle.id = requestAnimationFrame(callback)
    }
  }, [])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const layer = layerRef.current
    const container = containerRef.current
    if (!canvas || !layer || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    dprRef.current = dpr

    for (const target of [canvas, layer]) {
      target.width = Math.round(rect.width * dpr)
      target.height = Math.round(rect.height * dpr)
      target.style.width = `${rect.width}px`
      target.style.height = `${rect.height}px`
      target.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }, [])

  /** Paints one frame of colour onto the offscreen layer. */
  const paintLips = useCallback(
    (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], w: number, h: number) => {
      const hex = colorRef.current
      if (!hex) return

      const { alpha, edge, gloss } = finishRef.current
      const { x: dx, y: dy } = drawAreaRef.current

      // Clear in device pixels — the context carries a DPR transform, and the
      // cover-fit crop puts part of the draw area outside the CSS box.
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.restore()

      ctx.save()

      // Scale the outer ring away from the mouth centre so colour reaches the
      // true lip edge rather than stopping short of it.
      let cx = 0
      let cy = 0
      for (const index of MOUTH_OUTER) {
        cx += landmarks[index].x
        cy += landmarks[index].y
      }
      cx = (cx / MOUTH_OUTER.length) * w + dx
      cy = (cy / MOUTH_OUTER.length) * h + dy

      const outer: [number, number][] = MOUTH_OUTER.map((index) => {
        const px = landmarks[index].x * w + dx
        const py = landmarks[index].y * h + dy
        return [cx + (px - cx) * LIP_SCALE, cy + (py - cy) * LIP_SCALE]
      })
      const inner: [number, number][] = MOUTH_INNER.map((index) => [
        landmarks[index].x * w + dx,
        landmarks[index].y * h + dy,
      ])

      const outerPath = smoothClosedPath(outer)
      const innerPath = smoothClosedPath(inner)

      // Even-odd against both rings leaves the mouth opening clear, so an open
      // mouth doesn't fill in with colour.
      const combined = new Path2D()
      combined.addPath(outerPath)
      combined.addPath(innerPath)

      ctx.fillStyle = withAlpha(hex, alpha)
      ctx.fill(combined, 'evenodd')

      ctx.lineWidth = 1.25
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.strokeStyle = withAlpha(hex, alpha * edge)
      ctx.stroke(outerPath)

      if (gloss > 0) {
        const ys = outer.map((point) => point[1])
        const sheen = ctx.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys))
        sheen.addColorStop(0.3, `rgba(255,255,255,${0.35 * gloss})`)
        sheen.addColorStop(0.5, `rgba(255,255,255,${0.15 * gloss})`)
        sheen.addColorStop(0.7, 'rgba(255,255,255,0)')
        ctx.fillStyle = sheen
        ctx.globalCompositeOperation = 'screen'
        ctx.fill(combined, 'evenodd')

        // Wet highlight pooled on the lower lip.
        const lowerOuter = outer.slice(10)
        const lowerInner = inner.slice(8)
        if (lowerOuter.length && lowerInner.length) {
          const hx = (lowerOuter[0][0] + lowerInner[0][0]) / 2
          const hy = (lowerOuter[0][1] + lowerInner[0][1]) / 2
          const pool = ctx.createRadialGradient(hx, hy - 5, 0, hx, hy, 30)
          pool.addColorStop(0, `rgba(255,255,255,${0.5 * gloss})`)
          pool.addColorStop(0.3, `rgba(255,255,255,${0.2 * gloss})`)
          pool.addColorStop(0.7, `rgba(255,255,255,${0.1 * gloss})`)
          pool.addColorStop(1, 'rgba(255,255,255,0)')

          const glossPath = new Path2D()
          glossPath.moveTo(lowerOuter[0][0], lowerOuter[0][1])
          for (let i = 1; i < lowerOuter.length; i++) {
            const [px, py] = lowerOuter[i]
            const [qx, qy] = lowerOuter[i - 1]
            glossPath.quadraticCurveTo((qx + px) / 2, (qy + py) / 2, px, py)
          }
          glossPath.lineTo(lowerInner[0][0], lowerInner[0][1])
          for (let i = lowerInner.length - 2; i >= 0; i--) {
            const [px, py] = lowerInner[i]
            const [qx, qy] = lowerInner[i + 1]
            glossPath.quadraticCurveTo((qx + px) / 2, (qy + py) / 2, px, py)
          }
          glossPath.closePath()

          ctx.globalCompositeOperation = 'overlay'
          ctx.fillStyle = pool
          ctx.fill(glossPath)
        }
      }

      ctx.restore()
      ctx.globalCompositeOperation = 'source-over'
    },
    [],
  )

  const renderLoop = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const layer = layerRef.current
    const ctx = canvas?.getContext('2d')
    const layerCtx = layer?.getContext('2d', { alpha: true })

    if (!video || !canvas || !layer || !ctx || !layerCtx || !runningRef.current) return

    const w = canvas.width / dprRef.current
    const h = canvas.height / dprRef.current

    ctx.globalCompositeOperation = 'source-over'
    ctx.filter = 'none'
    ctx.clearRect(0, 0, w, h)

    // Cover-fit the feed: fill the frame and centre-crop, never letterbox.
    const vw = video.videoWidth
    const vh = video.videoHeight
    if (vw > 0 && vh > 0) {
      const scale = Math.max(w / vw, h / vh)
      const dw = vw * scale
      const dh = vh * scale
      const dx = (w - dw) / 2
      const dy = (h - dh) / 2
      drawAreaRef.current = { height: dh, width: dw, x: dx, y: dy }
      ctx.drawImage(video, dx, dy, dw, dh)
    }

    const raw = resultRef.current?.faceLandmarks?.[0]

    // EMA over landmarks: raw output jitters enough to make the lip edge crawl.
    let landmarks: NormalizedLandmark[] | undefined
    if (raw) {
      if (!smoothedRef.current || smoothedRef.current.length !== raw.length) {
        smoothedRef.current = raw.map((point) => ({ ...point }))
      } else {
        for (let i = 0; i < raw.length; i++) {
          const prev = smoothedRef.current[i]
          const next = raw[i]
          prev.x = SMOOTH_ALPHA * prev.x + (1 - SMOOTH_ALPHA) * next.x
          prev.y = SMOOTH_ALPHA * prev.y + (1 - SMOOTH_ALPHA) * next.y
          if (typeof next.z === 'number') {
            prev.z = SMOOTH_ALPHA * (prev.z ?? next.z) + (1 - SMOOTH_ALPHA) * next.z
          }
        }
      }
      landmarks = smoothedRef.current
    }

    if (landmarks && colorRef.current) {
      const { height: dh, width: dw } = drawAreaRef.current
      // Blur the colour layer before compositing so the edge reads as pigment
      // bleeding into skin rather than a hard vector shape.
      layerCtx.filter = 'blur(6px)'
      paintLips(layerCtx, landmarks, dw, dh)
      ctx.globalCompositeOperation = 'overlay'
      ctx.drawImage(layer, 0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
      ctx.filter = 'none'
    }

    scheduleFrame(renderFrame.current, renderLoop)
  }, [paintLips, scheduleFrame])

  const detectLoop = useCallback(() => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current

    if (!video || !landmarker || !runningRef.current) return

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const now = Math.floor(performance.now())
      if (now - lastDetectRef.current >= DETECT_INTERVAL) {
        try {
          const result = landmarker.detectForVideo(video, now)
          resultRef.current = result
          lastDetectRef.current = now
          setHasFace(Boolean(result?.faceLandmarks?.length))
        } catch (err) {
          // Frames occasionally arrive out of order; only real faults matter.
          if (err instanceof Error && !err.message.includes('timestamp mismatch')) {
            console.error('[try-on] detection failed', err)
          }
        }
      }
    }

    scheduleFrame(detectFrame.current, detectLoop)
  }, [scheduleFrame])

  /**
   * Releases every resource the filter holds. The campaign app never unmounted
   * mid-session so it only ever cancelled animation frames — in a modal that
   * leaves the webcam light on after close, which is not acceptable here.
   */
  const teardown = useCallback(() => {
    runningRef.current = false

    cancelFrame(detectFrame.current)
    cancelFrame(renderFrame.current)

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) videoRef.current.srcObject = null

    landmarkerRef.current?.close()
    landmarkerRef.current = null

    resultRef.current = null
    smoothedRef.current = null
    setHasFace(false)
  }, [cancelFrame])

  const capture = useCallback((): string | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    // The preview is CSS-mirrored, which a canvas export doesn't inherit.
    // Flip on the way out so the photo matches what the user was looking at.
    const output = document.createElement('canvas')
    output.width = canvas.width
    output.height = canvas.height

    const ctx = output.getContext('2d')
    if (!ctx) return null

    ctx.translate(output.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(canvas, 0, 0)

    return output.toDataURL('image/png')
  }, [])

  useEffect(() => {
    if (!active) return

    let cancelled = false

    const start = async () => {
      setStatus('loading')
      setError(null)

      try {
        // Both served from our own origin — see scripts/sync-mediapipe.ts.
        const fileset = await FilesetResolver.forVisionTasks('/mediapipe-wasm')
        if (cancelled) return

        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: '/model/face_landmarker.task' },
          numFaces: 1,
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
        })
        if (cancelled) {
          landmarker.close()
          return
        }
        landmarkerRef.current = landmarker

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user' },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream

        const video = videoRef.current
        if (!video) return
        video.srcObject = stream

        await new Promise<void>((resolve, reject) => {
          const onReady = async () => {
            video.removeEventListener('loadeddata', onReady)
            resize()
            try {
              await video.play()
              resolve()
            } catch (err) {
              // WebKit aborts the first play() when the stream attaches while
              // the element is still laying out; one retry clears it.
              if ((err as Error)?.name === 'AbortError') {
                setTimeout(() => {
                  video.play().then(resolve).catch(reject)
                }, 100)
              } else {
                reject(err)
              }
            }
          }
          video.addEventListener('loadeddata', onReady)
        })
        if (cancelled) return

        supportsVideoFrame.current = 'requestVideoFrameCallback' in HTMLVideoElement.prototype
        runningRef.current = true
        lastDetectRef.current = 0

        resize()
        window.addEventListener('resize', resize)

        scheduleFrame(detectFrame.current, detectLoop)
        scheduleFrame(renderFrame.current, renderLoop)

        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        const name = (err as Error)?.name

        setError(
          name === 'NotAllowedError'
            ? 'Camera access was blocked. Allow it in your browser settings to try shades on.'
            : name === 'NotFoundError'
              ? 'No camera found on this device.'
              : 'Could not start the camera. Please try again.',
        )
        setStatus('error')
      }
    }

    void start()

    return () => {
      cancelled = true
      window.removeEventListener('resize', resize)
      teardown()
      setStatus('idle')
    }
  }, [active, detectLoop, renderLoop, resize, scheduleFrame, teardown])

  return { canvasRef, capture, containerRef, error, hasFace, layerRef, status, videoRef }
}
