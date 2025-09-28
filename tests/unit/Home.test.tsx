import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Home } from '@/app/pages/Home'

describe('Home Component', () => {
  it('displays login message when user is not authenticated', () => {
    const mockRequestInfo = {
      ctx: {
        user: null
      }
    }

    render(<Home {...mockRequestInfo} />)

    expect(screen.getByText('You are not logged in')).toBeInTheDocument()
  })

  it('displays welcome message when user is authenticated', () => {
    const mockRequestInfo = {
      ctx: {
        user: {
          username: 'testuser'
        }
      }
    }

    render(<Home {...mockRequestInfo} />)

    expect(screen.getByText('You are logged in as user testuser')).toBeInTheDocument()
  })

  it('renders the main div container', () => {
    const mockRequestInfo = {
      ctx: {
        user: null
      }
    }

    const { container } = render(<Home {...mockRequestInfo} />)
    const divElement = container.querySelector('div')

    expect(divElement).toBeInTheDocument()
  })
})