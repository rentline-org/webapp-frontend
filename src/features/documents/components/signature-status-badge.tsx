import { Badge } from '@/components/ui/badge'
import type { SignatureStatus } from '../types'
import { SIGNATURE_STATUS_LABELS } from '../utils/constants'

const variants: Record<SignatureStatus, 'outline' | 'success' | 'warning'> = {
  not_required: 'outline',
  pending: 'warning',
  signed: 'success',
}

export function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
  return (
    <Badge variant={variants[status]} className='rounded-full'>
      {SIGNATURE_STATUS_LABELS[status]}
    </Badge>
  )
}
