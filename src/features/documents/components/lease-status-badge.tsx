import { Badge } from '@/components/ui/badge'
import type { LeaseStatus } from '../types'
import { LEASE_STATUS_LABELS } from '../utils/constants'

const variants: Record<LeaseStatus, 'info' | 'success' | 'outline'> = {
  upcoming: 'info',
  active: 'success',
  expired: 'outline',
}

export function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  return (
    <Badge variant={variants[status]} className='rounded-full'>
      {LEASE_STATUS_LABELS[status]}
    </Badge>
  )
}
