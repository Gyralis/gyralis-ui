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
      {toasts.map(({ id, title, description, action, link, ...props }) => {
        const isExternalLink = link?.href.startsWith("http")

        return (
          <Toast key={id} {...(props as any)}>
            <div className="grid gap-1.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
              {link ? (
                <a
                  href={link.href}
                  target={isExternalLink ? "_blank" : undefined}
                  rel={isExternalLink ? "noreferrer" : undefined}
                  className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span>{link.label}</span>
                  {isExternalLink ? <FiExternalLink className="size-3.5" /> : null}
                </a>
              ) : null}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}

      <ToastViewport />
    </ToastProvider>
  )
}
