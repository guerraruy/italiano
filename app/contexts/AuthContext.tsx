'use client'
import {
  createContext,
  useContext,
  useSyncExternalStore,
  ReactNode,
} from 'react'
import { useLoginMutation, useRegisterMutation } from '../store/api'

interface User {
  id: string
  username: string
  email: string
  name?: string | null
  admin?: boolean
}

interface AuthContextType {
  user: User | null
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  register: (
    username: string,
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache for localStorage user to avoid infinite loops in useSyncExternalStore
let cachedUser: User | null = null
let cachedUserString: string | null = null
let listeners: Array<() => void> = []

// Helper to get initial user from localStorage (client-side only)
function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null

  const savedUser = localStorage.getItem('italiano_user')

  // Return cached value if localStorage hasn't changed
  if (savedUser === cachedUserString) {
    return cachedUser
  }

  // Update cache
  cachedUserString = savedUser

  if (savedUser) {
    try {
      cachedUser = JSON.parse(savedUser)
      return cachedUser
    } catch {
      localStorage.removeItem('italiano_user')
      cachedUser = null
      return null
    }
  }

  cachedUser = null
  return null
}

// Subscribe to localStorage changes
function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

// Notify all listeners when localStorage changes
function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore to safely access localStorage without hydration mismatch
  const user = useSyncExternalStore(
    subscribe, // subscribe to changes
    getStoredUser, // getSnapshot (client-side)
    () => null // getServerSnapshot (server-side: always null)
  )

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation()
  const [registerMutation, { isLoading: isRegisterLoading }] =
    useRegisterMutation()

  const isLoading = isLoginLoading || isRegisterLoading

  const login = async (username: string, password: string) => {
    try {
      const result = await loginMutation({ username, password }).unwrap()

      const userString = JSON.stringify(result.user)
      localStorage.setItem('italiano_user', userString)
      localStorage.setItem('italiano_token', result.token)
      // Update cache and notify listeners
      cachedUser = result.user
      cachedUserString = userString
      emitChange()
      return { success: true }
    } catch (error: unknown) {
      console.error('Login error:', error)
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'error' in error.data &&
        typeof error.data.error === 'string'
          ? error.data.error
          : 'Login failed. Please try again.'
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  const register = async (
    username: string,
    email: string,
    password: string,
    name?: string
  ) => {
    try {
      const result = await registerMutation({
        username,
        email,
        password,
        name,
      }).unwrap()

      const userString = JSON.stringify(result.user)
      localStorage.setItem('italiano_user', userString)
      localStorage.setItem('italiano_token', result.token)
      // Update cache and notify listeners
      cachedUser = result.user
      cachedUserString = userString
      emitChange()
      return { success: true }
    } catch (error: unknown) {
      console.error('Registration error:', error)
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'error' in error.data &&
        typeof error.data.error === 'string'
          ? error.data.error
          : 'Registration failed. Please try again.'
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('italiano_user')
    localStorage.removeItem('italiano_token')
    // Clear cache and notify listeners
    cachedUser = null
    cachedUserString = null
    emitChange()
  }

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
