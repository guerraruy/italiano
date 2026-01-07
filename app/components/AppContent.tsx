'use client'
import { ReactNode } from 'react'

import LoginModal from './LoginModal'
import Navbar from './Navbar'
import { AuthProvider } from '../contexts/AuthContext'

export default function AppContent({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LoginModal />
      <Navbar />
      {children}
    </AuthProvider>
  )
}
