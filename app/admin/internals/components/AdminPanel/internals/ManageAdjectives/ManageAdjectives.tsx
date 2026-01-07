'use client'
import { ImportAdjectives, AdjectivesList } from './internals'

interface ManageAdjectivesProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageAdjectives({ onError, onSuccess }: ManageAdjectivesProps) {
  return (
    <>
      <ImportAdjectives onError={onError} onSuccess={onSuccess} />
      <AdjectivesList onError={onError} onSuccess={onSuccess} />
    </>
  )
}

