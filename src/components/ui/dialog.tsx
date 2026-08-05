'use client'

import { cn } from '@/utilities/ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

const Dialog: React.FC<React.ComponentProps<typeof DialogPrimitive.Root>> = (props) => {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

const DialogTrigger: React.FC<React.ComponentProps<typeof DialogPrimitive.Trigger>> = (props) => {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

const DialogPortal: React.FC<React.ComponentProps<typeof DialogPrimitive.Portal>> = (props) => {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

const DialogClose: React.FC<React.ComponentProps<typeof DialogPrimitive.Close>> = (props) => {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const DialogOverlay: React.FC<React.ComponentProps<typeof DialogPrimitive.Overlay>> = ({
  className,
  ...props
}) => {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-pixy-ink/70 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

const DialogContent: React.FC<React.ComponentProps<typeof DialogPrimitive.Content>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:rounded-2xl',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

const DialogTitle: React.FC<React.ComponentProps<typeof DialogPrimitive.Title>> = ({
  className,
  ...props
}) => {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-base font-medium text-pixy-ink', className)}
      {...props}
    />
  )
}

const DialogDescription: React.FC<React.ComponentProps<typeof DialogPrimitive.Description>> = ({
  className,
  ...props
}) => {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-pixy-muted', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
