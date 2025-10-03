import * as React from "react"
import { cn } from "@/lib/utils"

export interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'centered' | 'full' | 'compact' | 'narrow'
  children: React.ReactNode
}

const LayoutContainer = React.forwardRef<HTMLDivElement, LayoutContainerProps>(
  ({ variant = 'centered', className, children, ...props }, ref) => {
    const isCentered = variant === 'centered' || variant === 'compact' || variant === 'narrow'

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          isCentered ? "min-h-screen flex items-center justify-center p-4" : "container mx-auto px-4 py-8",
          className
        )}
        {...props}
      >
        <div
          className={cn({
            "w-full max-w-2xl": variant === 'centered',
            "w-full": variant === 'full',
            "w-full max-w-md": variant === 'compact',
            "w-full max-w-lg": variant === 'narrow',
          })}
        >
          {children}
        </div>
      </div>
    )
  }
)

LayoutContainer.displayName = "LayoutContainer"

export { LayoutContainer }
