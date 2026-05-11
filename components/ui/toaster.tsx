"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { FiExternalLink } from "react-icons/fi"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, link, ...props }) => (
        <Toast key={id} {...(props as any)}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
            {link ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                <span>{link.label}</span>
                <FiExternalLink className="size-3.5" />
              </a>
            ) : null}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}

      <ToastViewport />
    </ToastProvider>
  )
}
