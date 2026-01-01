'use client';
import { AuthProvider } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import Navbar from './Navbar';
import { ReactNode } from 'react';

export default function AppContent({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LoginModal />
      <Navbar />
      {children}
    </AuthProvider>
  );
}

