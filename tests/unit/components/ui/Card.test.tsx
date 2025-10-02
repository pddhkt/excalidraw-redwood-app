import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/Card'

describe('Card Component', () => {
  it('should render card with content', () => {
    render(
      <Card>
        <CardContent>Test content</CardContent>
      </Card>
    )
    const card = screen.getByText('Test content')
    expect(card).toBeInTheDocument()
  })

  it('should apply card styling classes', () => {
    render(
      <Card data-testid="card">
        <CardContent>Content</CardContent>
      </Card>
    )
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('rounded-lg')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('bg-card')
    expect(card).toHaveClass('text-card-foreground')
    expect(card).toHaveClass('shadow-sm')
  })

  it('should render card header with title', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    )
    const title = screen.getByText('Test Title')
    expect(title).toBeInTheDocument()
  })

  it('should render card header with description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Test description</CardDescription>
        </CardHeader>
      </Card>
    )
    const description = screen.getByText('Test description')
    expect(description).toBeInTheDocument()
  })

  it('should apply header styling classes', () => {
    render(
      <Card>
        <CardHeader data-testid="header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    )
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('flex')
    expect(header).toHaveClass('flex-col')
    expect(header).toHaveClass('space-y-1.5')
    expect(header).toHaveClass('p-6')
  })

  it('should apply title styling classes', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle data-testid="title">Test Title</CardTitle>
        </CardHeader>
      </Card>
    )
    const title = screen.getByTestId('title')
    expect(title).toHaveClass('text-2xl')
    expect(title).toHaveClass('font-semibold')
    expect(title).toHaveClass('leading-none')
    expect(title).toHaveClass('tracking-tight')
  })

  it('should apply description styling classes', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription data-testid="description">Test description</CardDescription>
        </CardHeader>
      </Card>
    )
    const description = screen.getByTestId('description')
    expect(description).toHaveClass('text-sm')
    expect(description).toHaveClass('text-muted-foreground')
  })

  it('should apply content styling classes', () => {
    render(
      <Card>
        <CardContent data-testid="content">Content</CardContent>
      </Card>
    )
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('p-6')
    expect(content).toHaveClass('pt-0')
  })

  it('should apply footer styling classes', () => {
    render(
      <Card>
        <CardFooter data-testid="footer">Footer content</CardFooter>
      </Card>
    )
    const footer = screen.getByTestId('footer')
    expect(footer).toHaveClass('flex')
    expect(footer).toHaveClass('items-center')
    expect(footer).toHaveClass('p-6')
    expect(footer).toHaveClass('pt-0')
  })

  it('should accept custom className', () => {
    render(
      <Card className="custom-class" data-testid="card">
        <CardContent>Content</CardContent>
      </Card>
    )
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('custom-class')
  })

  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(screen.getByText('Card content goes here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})