import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Home } from '@/app/pages/Home'
import type { RequestInfo } from 'rwsdk/worker'

// Create a proper RequestInfo mock using type assertion
const createMockRequestInfo = (user: any = null): RequestInfo => ({
  request: new Request('http://localhost:3000'),
  params: {},
  headers: new Headers(),
  rw: {} as any,
  response: new Response(),
  cf: {},
  isAction: false,
  ctx: {
    user,
    session: null,
    headers: new Headers()
  }
} as RequestInfo)

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