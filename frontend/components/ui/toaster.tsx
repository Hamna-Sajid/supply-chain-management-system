'use client'

import { useToast } from '@/hooks/use-toast'
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/components/ui/toast'

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <ToastProvider>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    open={toast.open}
                    onOpenChange={toast.onOpenChange}
                    variant={toast.variant}
                >
                    <div className='grid gap-1'>
                        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
                        {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
                    </div>
                    {toast.action}
                    <ToastClose onClick={() => dismiss(toast.id)} />
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    )
}