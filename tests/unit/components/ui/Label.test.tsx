import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from '@/app/components/ui/Label'

describe('Label Component', () => {
  it('should render label with text', () => {
    render(<Label>Username</Label>)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('should apply label styling classes', () => {
    render(<Label data-testid="label">Test Label</Label>)
    const label = screen.getByTestId('label')
    expect(label).toHaveClass('text-sm')
    expect(label).toHaveClass('font-medium')
    expect(label).toHaveClass('leading-none')
  })

  it('should associate with input using htmlFor', () => {
    render(<Label htmlFor="username-input">Username</Label>)
    const label = screen.getByText('Username')
    expect(label).toHaveAttribute('for', 'username-input')
  })

  it('should apply custom className', () => {
    render(<Label className="custom-class" data-testid="label">Label</Label>)
    const label = screen.getByTestId('label')
    expect(label).toHaveClass('custom-class')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<Label ref={ref}>Label</Label>)
    expect(ref).toHaveBeenCalled()
  })

  it('should apply disabled styling when disabled', () => {
    render(<Label disabled data-testid="label">Disabled Label</Label>)
    const label = screen.getByTestId('label')
    expect(label).toHaveClass('opacity-70')
    expect(label).toHaveClass('cursor-not-allowed')
  })

  it('should render as label element', () => {
    render(<Label>Test</Label>)
    const label = screen.getByText('Test')
    expect(label.tagName.toLowerCase()).toBe('label')
  })

  it('should support required indicator', () => {
    render(<Label required>Username</Label>)
    const label = screen.getByText(/Username/)
    // Should have asterisk or required indicator
    expect(label.parentElement?.textContent).toContain('*')
  })

  it('should be accessible with proper attributes', () => {
    render(
      <Label
        htmlFor="input-id"
        aria-describedby="help-text"
        data-testid="label"
      >
        Accessible Label
      </Label>
    )
    const label = screen.getByTestId('label')
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Label onClick={handleClick}>Clickable Label</Label>)
    const label = screen.getByText('Clickable Label')
    label.click()
    expect(handleClick).toHaveBeenCalled()
  })
})