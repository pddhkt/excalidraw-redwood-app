import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Home } from '@/app/pages/Home'

// Create a proper RequestInfo mock
const createMockRequestInfo = (user: any = null) => ({
  request: new Request('http://localhost:3000'),
  params: {},
  headers: new Headers(),
  rw: {},
  response: new Response(),
  ctx: {
    user,
    session: null,
    headers: new Headers()
  }
})

describe('Home Component', () => {
  it('displays login message when user is not authenticated', () => {
    const mockRequestInfo = createMockRequestInfo(null)

    render(<Home {...mockRequestInfo} />)

    expect(screen.getByText('You are not logged in')).toBeInTheDocument()
  })

  it('displays welcome message when user is authenticated', () => {
    const mockRequestInfo = createMockRequestInfo({
      username: 'testuser'
    })

    render(<Home {...mockRequestInfo} />)

    expect(screen.getByText('You are logged in as user testuser')).toBeInTheDocument()
  })

  it('renders the main div container', () => {
    const mockRequestInfo = createMockRequestInfo(null)

    const { container } = render(<Home {...mockRequestInfo} />)
    const divElement = container.querySelector('div')

    expect(divElement).toBeInTheDocument()
  })
})