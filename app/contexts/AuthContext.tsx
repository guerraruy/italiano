'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  username: string
}

interface AuthContextType {
  user: User | null
  login: (username: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize state from localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('italiano_user')
      if (savedUser) {
        try {
          return JSON.parse(savedUser)
        } catch {
          return null
        }
      }
    }
    return null
  })

  const login = (username: string) => {
    const newUser = { username }
    setUser(newUser)
    localStorage.setItem('italiano_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('italiano_user')
  }

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
