import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DrawingCard } from '@/app/components/drawing/DrawingCard'

// Mock date for consistent testing
const mockDate = new Date('2024-01-15T10:30:00Z')

const mockDrawing = {
  id: 'drawing-1',
  title: 'My Test Drawing',
  description: 'A beautiful test drawing',
  thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  isPublic: false,
  createdAt: mockDate,
  updatedAt: mockDate,
  lastOpenedAt: mockDate,
  userId: 'user-1'
}

const mockPublicDrawing = {
  ...mockDrawing,
  id: 'drawing-2',
  title: 'Public Drawing',
  isPublic: true
}

describe('DrawingCard Component', () => {
  it('should render drawing title', () => {
    render(<DrawingCard drawing={mockDrawing} />)
    expect(screen.getByText('My Test Drawing')).toBeInTheDocument()
  })

  it('should render drawing description when provided', () => {
    render(<DrawingCard drawing={mockDrawing} />)
    expect(screen.getByText('A beautiful test drawing')).toBeInTheDocument()
  })

  it('should not render description when not provided', () => {
    const drawingWithoutDescription = { ...mockDrawing, description: undefined }
    render(<DrawingCard drawing={drawingWithoutDescription} />)
    expect(screen.queryByText('A beautiful test drawing')).not.toBeInTheDocument()
  })

  it('should display thumbnail image', () => {
    render(<DrawingCard drawing={mockDrawing} />)
    const thumbnail = screen.getByRole('img', { name: /my test drawing thumbnail/i })
    expect(thumbnail).toBeInTheDocument()
    expect(thumbnail).toHaveAttribute('src', mockDrawing.thumbnail)
  })

  it('should show private badge for private drawings', () => {
    render(<DrawingCard drawing={mockDrawing} />)
    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('should show public badge for public drawings', () => {
    render(<DrawingCard drawing={mockPublicDrawing} />)
    expect(screen.getByText('Public')).toBeInTheDocument()
  })

  it('should display formatted last modified date', () => {
    render(<DrawingCard drawing={mockDrawing} />)
    // Should show relative time like "Jan 15, 2024"
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument()
  })

  it('should call onClick when drawing card is clicked', () => {
    const handleClick = vi.fn()
    render(<DrawingCard drawing={mockDrawing} onClick={handleClick} />)

    const card = screen.getByRole('button', { name: /my test drawing/i })
    fireEvent.click(card)

    expect(handleClick).toHaveBeenCalledWith(mockDrawing)
  })

  it('should apply hover styles when clickable', () => {
    const handleClick = vi.fn()
    render(<DrawingCard drawing={mockDrawing} onClick={handleClick} />)

    const card = screen.getByRole('button')
    expect(card).toHaveClass('cursor-pointer')
    expect(card).toHaveClass('hover:shadow-md')
    expect(card).toHaveClass('transition-shadow')
  })

  it('should not be clickable when no onClick provided', () => {
    render(<DrawingCard drawing={mockDrawing} />)

    // Should not render as button when not clickable
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<DrawingCard drawing={mockDrawing} className="custom-class" />)
    const card = screen.getByTestId('drawing-card')
    expect(card).toHaveClass('custom-class')
  })

  it('should handle missing thumbnail gracefully', () => {
    const drawingWithoutThumbnail = { ...mockDrawing, thumbnail: null }
    render(<DrawingCard drawing={drawingWithoutThumbnail} />)

    // Should show placeholder or default image
    const placeholder = screen.getByTestId('thumbnail-placeholder')
    expect(placeholder).toBeInTheDocument()
  })

  it('should show truncated title for very long titles', () => {
    const drawingWithLongTitle = {
      ...mockDrawing,
      title: 'This is a very long drawing title that should be truncated when displayed'
    }
    render(<DrawingCard drawing={drawingWithLongTitle} />)

    const titleElement = screen.getByText(/This is a very long drawing title/)
    expect(titleElement).toHaveClass('truncate')
  })

  it('should show last opened date when available', () => {
    render(<DrawingCard drawing={mockDrawing} showLastOpened />)
    expect(screen.getByText(/Last opened:/)).toBeInTheDocument()
  })

  it('should support compact variant', () => {
    render(<DrawingCard drawing={mockDrawing} variant="compact" />)
    const card = screen.getByTestId('drawing-card')
    expect(card).toHaveClass('compact')
  })

  it('should display loading state', () => {
    render(<DrawingCard drawing={mockDrawing} loading />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('should be accessible with proper ARIA labels', () => {
    const handleClick = vi.fn()
    render(<DrawingCard drawing={mockDrawing} onClick={handleClick} />)

    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('My Test Drawing'))
  })
})