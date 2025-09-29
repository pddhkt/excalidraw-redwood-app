import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card"
import { Badge } from "@/app/components/ui/Badge"
import type { Drawing, DrawingCardProps } from "@/types/drawing"

const DrawingCard = React.forwardRef<
  HTMLDivElement,
  DrawingCardProps
>(({ drawing, onClick, className, variant = "default", showLastOpened = false, loading = false, ...props }, ref) => {

  if (loading) {
    return (
      <Card
        ref={ref}
        className={cn("animate-pulse", className)}
        data-testid="drawing-card"
        {...props}
      >
        <div data-testid="loading-skeleton" className="p-4">
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    )
  }

  const isClickable = !!onClick
  const cardClasses = cn(
    variant === "compact" && "compact",
    isClickable && "cursor-pointer hover:shadow-md transition-shadow",
    className
  )

  const handleClick = () => {
    if (onClick) {
      onClick(drawing)
    }
  }

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy')
  }

  const CardComponent = isClickable ? 'button' : 'div'
  const cardProps = isClickable
    ? {
        role: 'button',
        onClick: handleClick,
        'aria-label': `Open drawing: ${drawing.title}`,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }
      }
    : {}

  return (
    <Card
      ref={ref}
      className={cardClasses}
      data-testid="drawing-card"
      {...cardProps}
      {...props}
    >
      {/* Thumbnail */}
      <div className="relative">
        {drawing.thumbnail ? (
          <img
            src={drawing.thumbnail}
            alt={`${drawing.title} thumbnail`}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        ) : (
          <div
            className="w-full h-32 bg-muted rounded-t-lg flex items-center justify-center text-muted-foreground"
            data-testid="thumbnail-placeholder"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Privacy Badge */}
        <div className="absolute top-2 right-2">
          <Badge variant={drawing.isPublic ? "default" : "secondary"}>
            {drawing.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg truncate">
          {drawing.title}
        </CardTitle>
        {drawing.description && (
          <CardDescription className="line-clamp-2">
            {drawing.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            {formatDate(drawing.updatedAt)}
          </span>
          {showLastOpened && drawing.lastOpenedAt && (
            <span>
              Last opened: {formatDate(drawing.lastOpenedAt)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

DrawingCard.displayName = "DrawingCard"

export { DrawingCard }