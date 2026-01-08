'use client'
import { VerbsList } from './internals'

interface ManageVerbsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageVerbs({ onError, onSuccess }: ManageVerbsProps) {
  return <VerbsList onError={onError} onSuccess={onSuccess} />
}

