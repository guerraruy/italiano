'use client'
import { NounsList } from './internals'

interface ManageNounsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageNouns({ onError, onSuccess }: ManageNounsProps) {
  return <NounsList onError={onError} onSuccess={onSuccess} />
}
