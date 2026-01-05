'use client'
import { ImportNouns, NounsList } from './internals'

interface ManageNounsProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageNouns({ onError, onSuccess }: ManageNounsProps) {
  return (
    <>
      <ImportNouns onError={onError} onSuccess={onSuccess} />
      <NounsList onError={onError} onSuccess={onSuccess} />
    </>
  )
}
