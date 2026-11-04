import type { HTMLAttributes } from "react"
import { LuInfo } from "react-icons/lu"

export function InfoNotice({
  children,
  className = "",
  role = "note",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`gyralis-info ${className}`} role={role} {...props}>
      <LuInfo aria-hidden="true" />
      <div className="gyralis-info-content">{children}</div>
    </div>
  )
}
