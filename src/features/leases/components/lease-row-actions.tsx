import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { CalendarPlus2, CirclePlay, Eye, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { IOperationalLease } from '../types'

export function LeaseRowActions({
  lease,
  onActivate,
  onTerminate,
  onRenew,
}: {
  lease: IOperationalLease
  onActivate: (lease: IOperationalLease) => void
  onTerminate: (lease: IOperationalLease) => void
  onRenew: (lease: IOperationalLease) => void
}) {
  const { t } = useTranslation('leases')
  const canActivate =
    lease.capabilities?.can_activate ?? lease.workflow_status === 'draft'
  const canTerminate =
    lease.capabilities?.can_terminate ?? lease.workflow_status === 'active'
  const canRenew =
    lease.capabilities?.can_renew ??
    ['active', 'terminated'].includes(lease.workflow_status)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-11 sm:size-8'>
          <DotsHorizontalIcon />
          <span className='sr-only'>
            {t('actions.openFor', { reference: lease.title || lease.id })}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-52'>
        <DropdownMenuItem asChild>
          <Link to='/leases/$leaseId' params={{ leaseId: String(lease.id) }}>
            <Eye />
            {t('common:actions.view')}
          </Link>
        </DropdownMenuItem>
        {canActivate ? (
          <DropdownMenuItem onClick={() => onActivate(lease)}>
            <CirclePlay />
            {t('actions.activate')}
          </DropdownMenuItem>
        ) : null}
        {canRenew ? (
          <DropdownMenuItem onClick={() => onRenew(lease)}>
            <CalendarPlus2 />
            {t('actions.renew')}
          </DropdownMenuItem>
        ) : null}
        {canTerminate ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant='destructive'
              onClick={() => onTerminate(lease)}
            >
              <LogOut />
              {t('actions.terminate')}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
