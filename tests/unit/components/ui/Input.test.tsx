import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/app/components/ui/Input'

describe('Input Component', () => {
  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter username" />)
    const input = screen.getByPlaceholderText('Enter username')
    expect(input).toBeInTheDocument()
  })

  it('should apply input styling classes', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('flex')
    expect(input).toHaveClass('h-10')
    expect(input).toHaveClass('w-full')
    expect(input).toHaveClass('rounded-md')
    expect(input).toHaveClass('border')
    expect(input).toHaveClass('border-input')
    expect(input).toHaveClass('bg-background')
    expect(input).toHaveClass('px-3')
    expect(input).toHaveClass('py-2')
    expect(input).toHaveClass('text-sm')
  })

  it('should handle value changes', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement

    await user.type(input, 'test value')
    expect(input.value).toBe('test value')
  })

  it('should call onChange when value changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} data-testid="input" />)
    const input = screen.getByTestId('input')

    await user.type(input, 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('should apply focus styles', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')

    await user.click(input)
    expect(input).toHaveClass('focus-visible:outline-none')
    expect(input).toHaveClass('focus-visible:ring-2')
    expect(input).toHaveClass('focus-visible:ring-ring')
    expect(input).toHaveClass('focus-visible:ring-offset-2')
  })

  it('should support different input types', () => {
    render(<Input type="email" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('should accept custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-class')
  })

  it('should support controlled value', () => {
    render(<Input value="controlled value" onChange={() => {}} data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.value).toBe('controlled value')
  })

  it('should support uncontrolled usage with defaultValue', () => {
    render(<Input defaultValue="default value" data-testid="input" />)
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.value).toBe('default value')
  })

  it('should support readonly state', () => {
    render(<Input readOnly data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('readonly')
  })

  it('should support required attribute', () => {
    render(<Input required data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('required')
  })

  it('should handle onFocus and onBlur events', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    render(<Input onFocus={handleFocus} onBlur={handleBlur} data-testid="input" />)
    const input = screen.getByTestId('input')

    await user.click(input)
    expect(handleFocus).toHaveBeenCalled()

    await user.tab()
    expect(handleBlur).toHaveBeenCalled()
  })

  it('should support maxLength attribute', () => {
    render(<Input maxLength={10} data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('should support autoComplete attribute', () => {
    render(<Input autoComplete="username" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('autoComplete', 'username')
  })

  it('should support autoFocus attribute', () => {
    render(<Input autoFocus data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('autoFocus')
  })

  it('should be accessible with proper attributes', () => {
    render(
      <Input
        aria-label="Username input"
        aria-describedby="username-help"
        data-testid="input"
      />
    )
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('aria-label', 'Username input')
    expect(input).toHaveAttribute('aria-describedby', 'username-help')
  })

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')

    await user.tab()
    expect(input).toHaveFocus()
  })

  it('should handle file input type', () => {
    render(<Input type="file" accept="image/*" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAttribute('accept', 'image/*')
  })
})