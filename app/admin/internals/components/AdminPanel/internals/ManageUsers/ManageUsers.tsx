'use client'
import { UsersList } from './internals'

interface ManageUsersProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageUsers({ onError, onSuccess }: ManageUsersProps) {
  return (
    <>
      <UsersList onError={onError} onSuccess={onSuccess} />
    </>
  )
}
