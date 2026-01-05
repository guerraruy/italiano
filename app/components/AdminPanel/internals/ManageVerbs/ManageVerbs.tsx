'use client'
import { ImportVerbs, VerbsList } from './internals'

interface ManageVerbsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageVerbs({ onError, onSuccess }: ManageVerbsProps) {
  return (
    <>
      <ImportVerbs onError={onError} onSuccess={onSuccess} />
      <VerbsList onError={onError} onSuccess={onSuccess} />
    </>
  )
}

