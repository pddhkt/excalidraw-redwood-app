import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from '@/app/pages/user/Login'

// Mock the WebAuthn functions
vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: vi.fn(),
  startRegistration: vi.fn(),
}))

vi.mock('@/app/pages/user/functions', () => ({
  startPasskeyLogin: vi.fn(),
  finishPasskeyLogin: vi.fn(),
  startPasskeyRegistration: vi.fn(),
  finishPasskeyRegistration: vi.fn(),
}))

// Mock the UI components
vi.mock('@/app/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, className, size, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}))

vi.mock('@/app/components/ui/Input', () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input
      onChange={onChange}
      value={value}
      {...props}
    />
  ),
}))

vi.mock('@/app/components/ui/Label', () => ({
  Label: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
}))

vi.mock('@/app/components/ui/Alert', () => ({
  Alert: ({ children, variant, ...props }: any) => (
    <div data-testid="alert" data-variant={variant} {...props}>{children}</div>
  ),
  AlertDescription: ({ children, ...props }: any) => (
    <div data-testid="alert-description" {...props}>{children}</div>
  ),
}))

vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h2 className={className} {...props}>{children}</h2>
  ),
  CardDescription: ({ children, className, ...props }: any) => (
    <p className={className} {...props}>{children}</p>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
}))

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form with all elements', () => {
    render(<Login />)

    expect(screen.getByText('Welcome to Excalidraw')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account or create a new one using passkeys')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument()
    expect(screen.getByText('🔑 Sign in with Passkey')).toBeInTheDocument()
    expect(screen.getByText('➕ Create New Account')).toBeInTheDocument()
  })

  it('should handle username input', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')

    expect(usernameInput).toHaveValue('testuser')
  })

  it('should disable register button when username is empty', () => {
    render(<Login />)

    const registerButton = screen.getByRole('button', { name: /create new account/i })
    expect(registerButton).toBeDisabled()
  })

  it('should enable register button when username is provided', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const usernameInput = screen.getByLabelText('Username')
    const registerButton = screen.getByRole('button', { name: /create new account/i })

    await user.type(usernameInput, 'testuser')

    expect(registerButton).not.toBeDisabled()
  })

  it('should show loading state during authentication', async () => {
    const { startPasskeyLogin } = await import('@/app/pages/user/functions')
    const mockStartPasskeyLogin = vi.mocked(startPasskeyLogin)

    mockStartPasskeyLogin.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<Login />)

    const loginButton = screen.getByRole('button', { name: /sign in with passkey/i })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/authenticating/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should show error message when login fails', async () => {
    const { startPasskeyLogin, finishPasskeyLogin } = await import('@/app/pages/user/functions')
    const { startAuthentication } = await import('@simplewebauthn/browser')

    const mockStartPasskeyLogin = vi.mocked(startPasskeyLogin)
    const mockFinishPasskeyLogin = vi.mocked(finishPasskeyLogin)
    const mockStartAuthentication = vi.mocked(startAuthentication)

    mockStartPasskeyLogin.mockResolvedValue({ challenge: 'test-challenge' })
    mockStartAuthentication.mockResolvedValue({
      id: 'test-id',
      rawId: 'test-raw-id',
      response: {
        clientDataJSON: 'test-client-data',
        authenticatorData: 'test-auth-data',
        signature: 'test-signature',
        userHandle: undefined,
      },
      clientExtensionResults: {},
      type: 'public-key',
    })
    mockFinishPasskeyLogin.mockResolvedValue(false)

    render(<Login />)

    const loginButton = screen.getByRole('button', { name: /sign in with passkey/i })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('should show success message when login succeeds', async () => {
    const { startPasskeyLogin, finishPasskeyLogin } = await import('@/app/pages/user/functions')
    const { startAuthentication } = await import('@simplewebauthn/browser')

    const mockStartPasskeyLogin = vi.mocked(startPasskeyLogin)
    const mockFinishPasskeyLogin = vi.mocked(finishPasskeyLogin)
    const mockStartAuthentication = vi.mocked(startAuthentication)

    mockStartPasskeyLogin.mockResolvedValue({ challenge: 'test-challenge' })
    mockStartAuthentication.mockResolvedValue({
      id: 'test-id',
      rawId: 'test-raw-id',
      response: {
        clientDataJSON: 'test-client-data',
        authenticatorData: 'test-auth-data',
        signature: 'test-signature',
        userHandle: undefined,
      },
      clientExtensionResults: {},
      type: 'public-key',
    })
    mockFinishPasskeyLogin.mockResolvedValue(true)

    render(<Login />)

    const loginButton = screen.getByRole('button', { name: /sign in with passkey/i })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Login successful! Redirecting...')).toBeInTheDocument()
    })
  })

  it('should handle registration validation error', async () => {
    render(<Login />)

    const registerButton = screen.getByRole('button', { name: /create new account/i })

    // Try to register without username
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a username')).toBeInTheDocument()
    })
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    const { startPasskeyLogin } = await import('@/app/pages/user/functions')
    const mockStartPasskeyLogin = vi.mocked(startPasskeyLogin)

    mockStartPasskeyLogin.mockResolvedValue({ challenge: 'test-challenge' })

    render(<Login />)

    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser{enter}')

    await waitFor(() => {
      expect(mockStartPasskeyLogin).toHaveBeenCalled()
    })
  })

  it('should show helpful text about passkeys', () => {
    render(<Login />)

    expect(screen.getByText('Use this username for both login and registration')).toBeInTheDocument()
    expect(screen.getByText('🔒 Passkeys use your device\'s biometrics or PIN for secure authentication')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<Login />)

    const usernameInput = screen.getByLabelText('Username')
    expect(usernameInput).toHaveAttribute('id', 'username')
    expect(usernameInput).toHaveAttribute('required')
    expect(usernameInput).toHaveAttribute('autoComplete', 'username')
  })

  it('should handle WebAuthn errors gracefully', async () => {
    const { startPasskeyLogin } = await import('@/app/pages/user/functions')
    const mockStartPasskeyLogin = vi.mocked(startPasskeyLogin)

    mockStartPasskeyLogin.mockRejectedValue(new Error('WebAuthn not supported'))

    render(<Login />)

    const loginButton = screen.getByRole('button', { name: /sign in with passkey/i })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('WebAuthn not supported')).toBeInTheDocument()
    })
  })
})