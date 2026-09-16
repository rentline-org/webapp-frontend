import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type {
  LeaseTemporalStatus,
  LeaseWorkflowStatus,
} from '../types'

const workflowVariants: Record<
  LeaseWorkflowStatus,
  'outline' | 'success' | 'warning' | 'destructive'
> = {
  draft: 'outline',
  active: 'success',
  terminated: 'warning',
  cancelled: 'destructive',
}

const temporalVariants: Record<
  LeaseTemporalStatus,
  'outline' | 'success' | 'info'
> = {
  upcoming: 'info',
  current: 'success',
  expired: 'outline',
}

export function LeaseWorkflowBadge({ status }: { status: LeaseWorkflowStatus }) {
  const { t } = useTranslation('leases')
  return (
    <Badge variant={workflowVariants[status]} className='rounded-full'>
      {t(`workflow.${status}`)}
    </Badge>
  )
}

export function LeaseTemporalBadge({ status }: { status: LeaseTemporalStatus }) {
  const { t } = useTranslation('leases')
  return (
    <Badge variant={temporalVariants[status]} className='rounded-full'>
      {t(`timing.${status}`)}
    </Badge>
  )
}
