'use client'
import { AdjectivesList } from './internals'

interface ManageAdjectivesProps {
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ManageAdjectives({
  onError,
  onSuccess,
}: ManageAdjectivesProps) {
  return <AdjectivesList onError={onError} onSuccess={onSuccess} />
}
