import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { LeaseStatus } from '../types'

const variants: Record<LeaseStatus, 'info' | 'success' | 'outline'> = {
  upcoming: 'info',
  active: 'success',
  expired: 'outline',
}

export function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  const { t } = useTranslation('leases')

  return (
    <Badge variant={variants[status]} className='rounded-full'>
      {t(`timing.${status === 'active' ? 'current' : status}`)}
    </Badge>
  )
}
