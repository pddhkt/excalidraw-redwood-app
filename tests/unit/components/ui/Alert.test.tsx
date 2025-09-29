import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/Alert'

describe('Alert Component', () => {
  it('should render alert with description', () => {
    render(
      <Alert>
        <AlertDescription>This is an alert message</AlertDescription>
      </Alert>
    )
    expect(screen.getByText('This is an alert message')).toBeInTheDocument()
  })

  it('should render alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert description text</AlertDescription>
      </Alert>
    )
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert description text')).toBeInTheDocument()
  })

  it('should apply default variant styling', () => {
    render(<Alert data-testid="alert">Default alert</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('bg-background')
    expect(alert).toHaveClass('text-foreground')
  })

  it('should apply destructive variant styling', () => {
    render(<Alert variant="destructive" data-testid="alert">Error alert</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('border-destructive')
    expect(alert).toHaveClass('text-destructive')
  })

  it('should apply custom className', () => {
    render(<Alert className="custom-class" data-testid="alert">Custom alert</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('custom-class')
  })

  it('should have proper role for accessibility', () => {
    render(<Alert data-testid="alert">Accessible alert</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveAttribute('role', 'alert')
  })

  it('should render AlertTitle with proper styling', () => {
    render(<AlertTitle data-testid="title">Title Text</AlertTitle>)
    const title = screen.getByTestId('title')
    expect(title).toHaveClass('mb-1')
    expect(title).toHaveClass('font-medium')
    expect(title).toHaveClass('leading-none')
  })

  it('should render AlertDescription with proper styling', () => {
    render(<AlertDescription data-testid="desc">Description Text</AlertDescription>)
    const description = screen.getByTestId('desc')
    expect(description).toHaveClass('text-sm')
  })

  it('should support success variant', () => {
    render(<Alert variant="success" data-testid="alert">Success message</Alert>)
    const alert = screen.getByTestId('alert')
    expect(alert).toHaveClass('border-green-500')
    expect(alert).toHaveClass('text-green-600')
  })

  it('should render with icon slot', () => {
    render(
      <Alert>
        <span data-testid="icon">🚨</span>
        <AlertDescription>Alert with icon</AlertDescription>
      </Alert>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Alert with icon')).toBeInTheDocument()
  })
})