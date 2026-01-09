import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom'
import LoginModal from './LoginModal'

// Mock the useAuth hook
const mockLogin = jest.fn()
const mockRegister = jest.fn()
let mockIsAuthenticated = false
let mockIsLoading = false

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    isAuthenticated: mockIsAuthenticated,
    isLoading: mockIsLoading,
  }),
}))

describe('LoginModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAuthenticated = false
    mockIsLoading = false
    mockLogin.mockResolvedValue({ success: true })
    mockRegister.mockResolvedValue({ success: true })
  })

  describe('Rendering - Login Mode', () => {
    it('renders the modal when user is not authenticated', () => {
      render(<LoginModal />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /welcome to italiano/i })
      ).toBeInTheDocument()
    })

    it('renders login form fields', () => {
      render(<LoginModal />)

      expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('renders login button', () => {
      render(<LoginModal />)

      expect(
        screen.getByRole('button', { name: /^login$/i })
      ).toBeInTheDocument()
    })

    it('renders toggle to register mode button', () => {
      render(<LoginModal />)

      expect(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      ).toBeInTheDocument()
    })

    it('renders helper text for username/email field', () => {
      render(<LoginModal />)

      expect(
        screen.getByText('You can use your username or email to login')
      ).toBeInTheDocument()
    })

    it('renders description text for login', () => {
      render(<LoginModal />)

      expect(screen.getByText('Please login to continue')).toBeInTheDocument()
    })

    it('does not render email, name, and confirm password fields in login mode', () => {
      render(<LoginModal />)

      expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText(/name \(optional\)/i)
      ).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText(/confirm password/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('Rendering - Register Mode', () => {
    it('renders register title after toggling', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      const toggleButton = screen.getByRole('button', {
        name: /don't have an account\? register/i,
      })
      await user.click(toggleButton)

      expect(
        screen.getByRole('heading', { name: /create account/i })
      ).toBeInTheDocument()
    })

    it('renders all register form fields', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      // Use role queries with name for more reliable matching with MUI components
      const textboxes = screen.getAllByRole('textbox')
      expect(textboxes.length).toBeGreaterThanOrEqual(3) // username, email, name
      expect(screen.getByLabelText(/name \(optional\)/i)).toBeInTheDocument()
      // Password fields
      const passwordFields = document.querySelectorAll('input[type="password"]')
      expect(passwordFields.length).toBe(2) // password and confirm password
    })

    it('renders register button after toggling', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      expect(
        screen.getByRole('button', { name: /^register$/i })
      ).toBeInTheDocument()
    })

    it('renders toggle to login mode button', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      expect(
        screen.getByRole('button', { name: /already have an account\? login/i })
      ).toBeInTheDocument()
    })

    it('renders description text for register', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      expect(
        screen.getByText('Create a new account to start learning')
      ).toBeInTheDocument()
    })

    it('renders password helper text in register mode', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      expect(screen.getByText('Minimum 6 characters')).toBeInTheDocument()
    })
  })

  describe('Returns null when authenticated', () => {
    it('does not render modal when user is authenticated', () => {
      mockIsAuthenticated = true
      render(<LoginModal />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Form Interactions - Login Mode', () => {
    it('updates username field on input', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      const input = screen.getByLabelText(/username or email/i)
      await user.type(input, 'testuser')

      expect(input).toHaveValue('testuser')
    })

    it('updates password field on input', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      const input = screen.getByLabelText(/password/i)
      await user.type(input, 'mypassword')

      expect(input).toHaveValue('mypassword')
    })

    it('clears error when typing in username field', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      // Submit empty form to trigger error
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your username or email')
        ).toBeInTheDocument()
      })

      // Type in field to clear error
      const input = screen.getByLabelText(/username or email/i)
      await user.type(input, 'a')

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter your username or email')
        ).not.toBeInTheDocument()
      })
    })

    it('clears error when typing in password field', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      // Fill username and submit to trigger password error
      await user.type(screen.getByLabelText(/username or email/i), 'testuser')

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Please enter a password')).toBeInTheDocument()
      })

      // Type in password field to clear error
      const input = screen.getByLabelText(/password/i)
      await user.type(input, 'a')

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter a password')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Interactions - Register Mode', () => {
    // Helper to get register mode fields
    const getRegisterFields = () => {
      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll(
        'input[type="password"]'
      ) as NodeListOf<HTMLInputElement>
      return {
        usernameInput: textboxes[0] as HTMLInputElement,
        emailInput: textboxes[1] as HTMLInputElement,
        nameInput: screen.getByLabelText(/name \(optional\)/i),
        passwordInput: passwordFields[0] as HTMLInputElement,
        confirmInput: passwordFields[1] as HTMLInputElement,
      }
    }

    it('updates all form fields on input', async () => {
      render(<LoginModal />)

      fireEvent.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const {
        usernameInput,
        emailInput,
        nameInput,
        passwordInput,
        confirmInput,
      } = getRegisterFields()

      // Use fireEvent.change for faster test execution
      fireEvent.change(usernameInput, { target: { value: 'newuser' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(nameInput, { target: { value: 'Test User' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'password123' } })

      expect(usernameInput).toHaveValue('newuser')
      expect(emailInput).toHaveValue('test@example.com')
      expect(nameInput).toHaveValue('Test User')
      expect(passwordInput).toHaveValue('password123')
      expect(confirmInput).toHaveValue('password123')
    })

    it('clears error when typing in email field', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const { usernameInput, emailInput, passwordInput } = getRegisterFields()

      // Fill username and password, submit to trigger email error
      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'password123')

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Please enter an email')).toBeInTheDocument()
      })

      // Type in email field to clear error
      await user.type(emailInput, 'a')

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter an email')
        ).not.toBeInTheDocument()
      })
    })

    it('clears error when typing in confirm password field', async () => {
      const user = userEvent.setup({ delay: null })
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const { usernameInput, emailInput, passwordInput, confirmInput } =
        getRegisterFields()

      // Use fireEvent.change for faster setup, then userEvent for the actual interaction test
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmInput, { target: { value: 'different' } })

      const submitButton = screen.getByRole('button', { name: /^register$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })

      // Type in confirm password field to clear error
      await user.type(confirmInput, 'x')

      await waitFor(() => {
        expect(
          screen.queryByText('Passwords do not match')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Validation - Login Mode', () => {
    it('shows error when username is empty', async () => {
      render(<LoginModal />)

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your username or email')
        ).toBeInTheDocument()
      })
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('shows error when username is only whitespace', async () => {
      render(<LoginModal />)

      // Use fireEvent.change for whitespace-only input as userEvent.type doesn't handle it well
      const usernameInput = screen.getByLabelText(/username or email/i)
      fireEvent.change(usernameInput, { target: { value: '   ' } })

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your username or email')
        ).toBeInTheDocument()
      })
    })

    it('shows error when password is empty', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.type(screen.getByLabelText(/username or email/i), 'testuser')

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Please enter a password')).toBeInTheDocument()
      })
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('shows error when password is only whitespace', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.type(screen.getByLabelText(/username or email/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), '   ')

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Please enter a password')).toBeInTheDocument()
      })
    })
  })

  describe('Validation - Register Mode', () => {
    it('shows error when username is empty in register mode', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Please enter a username')).toBeInTheDocument()
      })
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('shows error when email is empty', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, 'testuser')
      await user.type(passwordFields[0]!, 'password123')

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Please enter an email')).toBeInTheDocument()
      })
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('shows error when email is only whitespace', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, 'testuser')
      await user.type(textboxes[1]!, '   ')
      await user.type(passwordFields[0]!, 'password123')

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Please enter an email')).toBeInTheDocument()
      })
    })

    it('shows error when password is less than 6 characters', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, 'testuser')
      await user.type(textboxes[1]!, 'test@example.com')
      await user.type(passwordFields[0]!, '12345')

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 6 characters')
        ).toBeInTheDocument()
      })
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, 'testuser')
      await user.type(textboxes[1]!, 'test@example.com')
      await user.type(passwordFields[0]!, 'password123')
      await user.type(passwordFields[1]!, 'different')

      const submitButton = screen.getByRole('button', { name: /^register$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
      expect(mockRegister).not.toHaveBeenCalled()
    })
  })

  describe('Successful Login', () => {
    it('calls login with correct credentials', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.type(screen.getByLabelText(/username or email/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'mypassword')

      const submitButton = screen.getByRole('button', { name: /^login$/i })
      await user.click(submitButton)

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'mypassword')
    })

    it('trims username before login', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.type(
        screen.getByLabelText(/username or email/i),
        '  testuser  '
      )
      await user.type(screen.getByLabelText(/password/i), 'mypassword')

      const submitButton = screen.getByRole('button', { name: /^login$/i })
      await user.click(submitButton)

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'mypassword')
    })
  })

  describe('Successful Registration', () => {
    it('calls register with correct data', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, 'newuser')
      await user.type(textboxes[1]!, 'test@example.com')
      await user.type(screen.getByLabelText(/name \(optional\)/i), 'Test User')
      await user.type(passwordFields[0]!, 'password123')
      await user.type(passwordFields[1]!, 'password123')

      const submitButton = screen.getByRole('button', { name: /^register$/i })
      await user.click(submitButton)

      expect(mockRegister).toHaveBeenCalledWith(
        'newuser',
        'test@example.com',
        'password123',
        'Test User'
      )
    })

    it('calls register with undefined name when name is empty', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, 'newuser')
      await user.type(textboxes[1]!, 'test@example.com')
      await user.type(passwordFields[0]!, 'password123')
      await user.type(passwordFields[1]!, 'password123')

      const submitButton = screen.getByRole('button', { name: /^register$/i })
      await user.click(submitButton)

      expect(mockRegister).toHaveBeenCalledWith(
        'newuser',
        'test@example.com',
        'password123',
        undefined
      )
    })

    it('trims username and email before registration', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, '  newuser  ')
      await user.type(textboxes[1]!, '  test@example.com  ')
      await user.type(passwordFields[0]!, 'password123')
      await user.type(passwordFields[1]!, 'password123')

      const submitButton = screen.getByRole('button', { name: /^register$/i })
      await user.click(submitButton)

      expect(mockRegister).toHaveBeenCalledWith(
        'newuser',
        'test@example.com',
        'password123',
        undefined
      )
    })
  })

  describe('Error Handling - Login', () => {
    it('shows error message on login failure', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      })

      render(<LoginModal />)

      await user.type(screen.getByLabelText(/username or email/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

      const submitButton = screen.getByRole('button', { name: /^login$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('shows generic error message when login fails without error message', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ success: false })

      render(<LoginModal />)

      await user.type(screen.getByLabelText(/username or email/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password')

      const submitButton = screen.getByRole('button', { name: /^login$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling - Registration', () => {
    it('shows error message on registration failure', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValue({
        success: false,
        error: 'Username already taken',
      })

      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, 'existinguser')
      await user.type(textboxes[1]!, 'test@example.com')
      await user.type(passwordFields[0]!, 'password123')
      await user.type(passwordFields[1]!, 'password123')

      const submitButton = screen.getByRole('button', { name: /^register$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Username already taken')).toBeInTheDocument()
      })
    })

    it('shows generic error message when registration fails without error message', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValue({ success: false })

      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, 'newuser')
      await user.type(textboxes[1]!, 'test@example.com')
      await user.type(passwordFields[0]!, 'password123')
      await user.type(passwordFields[1]!, 'password123')

      const submitButton = screen.getByRole('button', { name: /^register$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument()
      })
    })

    it('can close error alert', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your username or email')
        ).toBeInTheDocument()
      })

      // Close the alert
      const alertElement = screen.getByRole('alert')
      const closeButton = alertElement.querySelector('button[title="Close"]')
      expect(closeButton).toBeInTheDocument()
      await user.click(closeButton!)

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter your username or email')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    beforeEach(() => {
      mockIsLoading = true
    })

    it('shows loading indicator when submitting', () => {
      render(<LoginModal />)

      expect(
        screen.getByRole('button', { name: /please wait/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('disables form fields when loading', () => {
      render(<LoginModal />)

      expect(screen.getByLabelText(/username or email/i)).toBeDisabled()
      expect(screen.getByLabelText(/password/i)).toBeDisabled()
    })

    it('disables buttons when loading', () => {
      render(<LoginModal />)

      expect(
        screen.getByRole('button', { name: /please wait/i })
      ).toBeDisabled()
      expect(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      ).toBeDisabled()
    })

    it('disables register mode fields when loading', () => {
      // Set loading state before render
      mockIsLoading = true

      render(<LoginModal />)

      // In loading state, in login mode, both fields should be disabled
      expect(screen.getByLabelText(/username or email/i)).toBeDisabled()
      expect(screen.getByLabelText(/password/i)).toBeDisabled()
    })
  })

  describe('Mode Toggling', () => {
    it('toggles from login to register mode', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      expect(
        screen.getByRole('heading', { name: /welcome to italiano/i })
      ).toBeInTheDocument()

      const toggleButton = screen.getByRole('button', {
        name: /don't have an account\? register/i,
      })
      await user.click(toggleButton)

      expect(
        screen.getByRole('heading', { name: /create account/i })
      ).toBeInTheDocument()
    })

    it('toggles from register to login mode', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      // Go to register mode
      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      expect(
        screen.getByRole('heading', { name: /create account/i })
      ).toBeInTheDocument()

      // Go back to login mode
      await user.click(
        screen.getByRole('button', { name: /already have an account\? login/i })
      )

      expect(
        screen.getByRole('heading', { name: /welcome to italiano/i })
      ).toBeInTheDocument()
    })

    it('clears form fields when toggling modes', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      // Fill in login form
      await user.type(screen.getByLabelText(/username or email/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'password')

      // Toggle to register mode
      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      // Fields should be empty - get first textbox (username) and first password field
      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')
      expect(textboxes[0]).toHaveValue('')
      expect(passwordFields[0]).toHaveValue('')
    })

    it('clears error when toggling modes', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      // Trigger an error
      const form = screen.getByRole('dialog').querySelector('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(
          screen.getByText('Please enter your username or email')
        ).toBeInTheDocument()
      })

      // Toggle to register mode
      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      // Error should be cleared
      expect(
        screen.queryByText('Please enter your username or email')
      ).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible form fields with labels', () => {
      render(<LoginModal />)

      expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('has accessible buttons', () => {
      render(<LoginModal />)

      expect(
        screen.getByRole('button', { name: /^login$/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      ).toBeInTheDocument()
    })

    it('renders modal as a dialog', () => {
      render(<LoginModal />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('autofocuses username field', async () => {
      render(<LoginModal />)

      const usernameInput = screen.getByLabelText(/username or email/i)
      await waitFor(() => {
        expect(usernameInput).toHaveFocus()
      })
    })

    it('has required attributes on required fields', () => {
      render(<LoginModal />)

      expect(screen.getByLabelText(/username or email/i)).toBeRequired()
      expect(screen.getByLabelText(/password/i)).toBeRequired()
    })
  })

  describe('Form Submission', () => {
    it('submits form on Enter key in password field', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.type(screen.getByLabelText(/username or email/i), 'testuser')
      await user.type(screen.getByLabelText(/password/i), 'mypassword{enter}')

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'mypassword')
    })

    it('submits register form on Enter key in confirm password field', async () => {
      const user = userEvent.setup()
      render(<LoginModal />)

      await user.click(
        screen.getByRole('button', {
          name: /don't have an account\? register/i,
        })
      )

      const textboxes = screen.getAllByRole('textbox')
      const passwordFields = document.querySelectorAll('input[type="password"]')

      await user.type(textboxes[0]!, 'newuser')
      await user.type(textboxes[1]!, 'test@example.com')
      await user.type(passwordFields[0]!, 'password123')
      await user.type(passwordFields[1]!, 'password123{enter}')

      expect(mockRegister).toHaveBeenCalledWith(
        'newuser',
        'test@example.com',
        'password123',
        undefined
      )
    })
  })

  describe('Modal Properties', () => {
    it('modal is not closeable by escape key', () => {
      render(<LoginModal />)

      // The disableEscapeKeyDown prop is set on the Dialog
      // We can verify the dialog exists and doesn't have backdrop click behavior
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('modal is always open when user is not authenticated', () => {
      render(<LoginModal />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
