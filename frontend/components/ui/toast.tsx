'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

const ToastViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
                className
            )}
            {...props}
        />
    )
)
ToastViewport.displayName = 'ToastViewport'

const toastVariants = cva(
    'group pointer-events-auto relative w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-slate-200 bg-white p-6 pr-8 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full dark:border-slate-800 dark:bg-slate-950',
    {
        variants: {
            variant: {
                default: 'border bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50',
                destructive:
                    'destructive group border-red-500 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-950 dark:text-red-50',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof toastVariants> & {
        open?: boolean
        onOpenChange?: (open: boolean) => void
    }

export type ToastActionElement = React.ReactElement<any>

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({ className, variant, open, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(toastVariants({ variant }), className)}
            data-state={open ? 'open' : 'closed'}
            {...props}
        />
    )
)
Toast.displayName = 'Toast'

const ToastAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-600/20 group-[.destructive]:text-red-600 group-[.destructive]:hover:border-red-600/30 group-[.destructive]:hover:bg-red-600/10 group-[.destructive]:focus:ring-red-600 dark:border-slate-800 dark:ring-offset-slate-950 dark:hover:bg-slate-800 dark:focus:ring-slate-300 dark:group-[.destructive]:border-red-600/20 dark:group-[.destructive]:text-red-600 dark:group-[.destructive]:hover:border-red-600/30 dark:group-[.destructive]:hover:bg-red-600/10 dark:group-[.destructive]:focus:ring-red-600',
                className
            )}
            {...props}
        />
    )
)
ToastAction.displayName = 'ToastAction'

const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                'absolute right-2 top-2 rounded-md p-1 text-slate-950/50 opacity-0 transition-opacity hover:text-slate-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-600 dark:text-slate-50/50 dark:hover:text-slate-50 dark:group-[.destructive]:text-red-300 dark:group-[.destructive]:hover:text-red-50',
                className
            )}
            {...props}
        >
            <X className='h-4 w-4' />
        </button>
    )
)
ToastClose.displayName = 'ToastClose'

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
    )
)
ToastTitle.displayName = 'ToastTitle'

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
    )
)
ToastDescription.displayName = 'ToastDescription'

export {
    ToastProvider,
    ToastViewport,
    Toast,
    ToastAction,
    ToastClose,
    ToastTitle,
    ToastDescription,
}