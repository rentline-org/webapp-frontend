import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { SignatureStatus } from '../types'

const variants: Record<
  SignatureStatus,
  'outline' | 'success' | 'warning' | 'destructive'
> = {
  not_required: 'outline',
  pending: 'warning',
  partially_signed: 'warning',
  signed: 'success',
  declined: 'destructive',
}

const keys: Record<SignatureStatus, string> = {
  not_required: 'signature.notRequired',
  pending: 'signature.pending',
  partially_signed: 'signature.partiallySigned',
  signed: 'signature.signed',
  declined: 'signature.declined',
}

export function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
  const { t } = useTranslation('documents')

  return (
    <Badge variant={variants[status]} className='rounded-full'>
      {t(keys[status])}
    </Badge>
  )
}
