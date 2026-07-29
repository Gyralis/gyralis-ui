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
import { LuArrowRight } from "react-icons/lu"

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
                <ToastDescription>
                  {description}
                  {link ? (
                    <>
                      {" "}
                      <a
                        href={link.href}
                        target={isExternalLink ? "_blank" : undefined}
                        rel={isExternalLink ? "noreferrer" : undefined}
                        className="inline-flex items-center gap-1 font-semibold no-underline underline-offset-4 transition-opacity hover:underline hover:opacity-70 focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-[.destructive]:text-destructive-foreground group-[.destructive]:focus-visible:ring-red-400 group-[.destructive]:focus-visible:ring-offset-red-600"
                      >
                        {link.label}
                        {isExternalLink ? (
                          <FiExternalLink className="size-3.5 shrink-0" />
                        ) : (
                          <LuArrowRight className="size-3.5 shrink-0" />
                        )}
                      </a>
                    </>
                  ) : null}
                </ToastDescription>
              )}
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
