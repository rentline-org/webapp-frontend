import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Building2, CalendarRange, FileKey2, Loader2, UserRound } from 'lucide-react'
import { useAppFormatters } from '@/i18n/use-formatters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { IOperationalLease } from '../types'
import {
  getLeaseTemporalStatus,
  getPrimaryTenantParty,
  getRentTerm,
} from '../utils'
import { LeaseRowActions } from './lease-row-actions'
import { LeaseTemporalBadge, LeaseWorkflowBadge } from './lease-status-badges'

export function LeasesTable({
  leases,
  isLoading,
  onActivate,
  onTerminate,
  onRenew,
  emptyTitle,
  emptyDescription,
}: {
  leases: IOperationalLease[]
  isLoading: boolean
  onActivate: (lease: IOperationalLease) => void
  onTerminate: (lease: IOperationalLease) => void
  onRenew: (lease: IOperationalLease) => void
  emptyTitle: string
  emptyDescription: string
}) {
  const { t } = useTranslation('leases')
  const { formatDateShort, formatCurrency } = useAppFormatters()

  return (
    <div className='overflow-x-auto rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.lease')}</TableHead>
            <TableHead className='hidden sm:table-cell'>
              {t('table.tenant')}
            </TableHead>
            <TableHead className='hidden md:table-cell'>
              {t('table.propertyUnit')}
            </TableHead>
            <TableHead className='hidden lg:table-cell'>
              {t('table.term')}
            </TableHead>
            <TableHead className='hidden sm:table-cell'>
              {t('table.rent')}
            </TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead className='w-12' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className='h-40 text-center'>
                <span className='inline-flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='size-4 animate-spin' />
                  {t('table.loading')}
                </span>
              </TableCell>
            </TableRow>
          ) : leases.length ? (
            leases.map((lease) => {
              const tenant = getPrimaryTenantParty(lease)
              const rent = getRentTerm(lease)

              return (
                <TableRow key={lease.id}>
                  <TableCell>
                    <Link
                      to='/leases/$leaseId'
                      params={{ leaseId: String(lease.id) }}
                      className='group flex min-w-44 items-start gap-3'
                    >
                      <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground'>
                        <FileKey2 className='size-4' />
                      </span>
                      <span className='min-w-0'>
                        <span className='block truncate font-medium group-hover:underline'>
                          {lease.title || `#${lease.id}`}
                        </span>
                        <span className='mt-1 flex flex-wrap gap-1 sm:hidden'>
                          <LeaseWorkflowBadge status={lease.workflow_status} />
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className='hidden sm:table-cell'>
                    <span className='inline-flex max-w-48 items-center gap-2 truncate text-sm'>
                      <UserRound className='size-3.5 shrink-0 text-muted-foreground' />
                      {tenant?.contact?.name ??
                        tenant?.name_snapshot ??
                        lease.primary_tenant?.name ??
                        '—'}
                    </span>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    <span className='flex max-w-56 items-start gap-2 text-sm'>
                      <Building2 className='mt-0.5 size-3.5 shrink-0 text-muted-foreground' />
                      <span className='min-w-0'>
                        <span className='block truncate'>
                          {lease.property?.title ?? '—'}
                        </span>
                        <span className='block truncate text-xs text-muted-foreground'>
                          {lease.unit?.name ?? '—'}
                        </span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className='hidden lg:table-cell'>
                    <span className='inline-flex items-center gap-2 text-sm whitespace-nowrap'>
                      <CalendarRange className='size-3.5 text-muted-foreground' />
                      {formatDateShort(lease.starts_on)} –{' '}
                      {formatDateShort(lease.ends_on)}
                    </span>
                  </TableCell>
                  <TableCell className='hidden sm:table-cell'>
                    <span className='whitespace-nowrap text-sm font-medium'>
                      {formatCurrency(
                        rent?.amount ?? lease.rent_amount,
                        rent?.currency ?? lease.currency
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col items-start gap-1.5'>
                      <LeaseWorkflowBadge status={lease.workflow_status} />
                      {lease.workflow_status === 'active' ? (
                        <LeaseTemporalBadge
                          status={getLeaseTemporalStatus(lease)}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <LeaseRowActions
                      lease={lease}
                      onActivate={onActivate}
                      onTerminate={onTerminate}
                      onRenew={onRenew}
                    />
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className='h-52 text-center'>
                <div className='mx-auto max-w-sm space-y-1'>
                  <p className='font-medium'>{emptyTitle}</p>
                  <p className='text-sm text-muted-foreground'>
                    {emptyDescription}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
