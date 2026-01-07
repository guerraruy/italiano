'use client'
import { ImportConjugations, ConjugationsList } from './internals'

interface ManageConjugationsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageConjugations({
  onError,
  onSuccess,
}: ManageConjugationsProps) {
  return (
    <>
      <ImportConjugations onError={onError} onSuccess={onSuccess} />
      <ConjugationsList onError={onError} onSuccess={onSuccess} />
    </>
  )
}

