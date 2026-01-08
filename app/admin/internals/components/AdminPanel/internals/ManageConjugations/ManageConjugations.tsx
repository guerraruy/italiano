'use client'
import { ConjugationsList } from './internals'

interface ManageConjugationsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageConjugations({
  onError,
  onSuccess,
}: ManageConjugationsProps) {
  return <ConjugationsList onError={onError} onSuccess={onSuccess} />
}
