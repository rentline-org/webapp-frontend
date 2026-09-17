import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRouteApi, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building2,
  CalendarPlus2,
  CalendarRange,
  CirclePlay,
  FileText,
  Loader2,
  LogOut,
  ShieldCheck,
  UserRound,
  WalletCards,
} from 'lucide-react'
import { useAppFormatters } from '@/i18n/use-formatters'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { DocumentTypeBadge } from '@/features/documents/components/document-type-badge'
import { useGetDocuments } from '@/features/documents/query'
import { LeaseActivationDialog } from './components/lease-activation-dialog'
import { LeaseFormDrawer } from './components/lease-form-drawer'
import { LeaseTerminationDialog } from './components/lease-termination-dialog'
import {
  LeaseTemporalBadge,
  LeaseWorkflowBadge,
} from './components/lease-status-badges'
import { useGetLease } from './query'
import type { RentalGuarantee } from './types'
import { getLeaseTemporalStatus, getRentTerm } from './utils'

const route = getRouteApi('/_authenticated/leases/$leaseId/')

const guaranteeKeys: Record<RentalGuarantee, string> = {
  cash_deposit: 'form.cashDeposit',
  guarantor: 'form.guarantor',
  rental_guarantee_insurance: 'form.guaranteeInsurance',
  investment_fund_quotas: 'form.investmentFund',
}

export function LeaseDetails() {
  const { t } = useTranslation('leases')
  const { leaseId } = route.useParams()
  const id = Number(leaseId)
  const leaseQuery = useGetLease(id, Number.isInteger(id))
  const documentsQuery = useGetDocuments({ lease_id: id, per_page: 20 })
  const { formatDate, formatCurrency } = useAppFormatters()
  const [activateOpen, setActivateOpen] = useState(false)
  const [terminateOpen, setTerminateOpen] = useState(false)
  const [renewOpen, setRenewOpen] = useState(false)

  if (leaseQuery.isLoading) {
    return (
      <Main className='flex min-h-72 items-center justify-center'>
        <Loader2 className='size-5 animate-spin text-muted-foreground' />
      </Main>
    )
  }

  const lease = leaseQuery.data
  if (!lease) {
    return (
      <Main className='flex min-h-72 flex-col items-center justify-center gap-4 text-center'>
        <FileText className='size-8 text-muted-foreground' />
        <p className='font-medium'>{t('details.notFound')}</p>
        <Button asChild variant='outline'>
          <Link to='/leases'>{t('details.back')}</Link>
        </Button>
      </Main>
    )
  }

  const rent = getRentTerm(lease)
  const documents = documentsQuery.data?.items ?? []
  const canActivate =
    lease.capabilities?.can_activate ?? lease.workflow_status === 'draft'
  const canTerminate =
    lease.capabilities?.can_terminate ?? lease.workflow_status === 'active'
  const canRenew =
    lease.capabilities?.can_renew ??
    ['active', 'terminated'].includes(lease.workflow_status)

  return (
    <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
        <Link
          to='/leases'
          className='inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='size-4' />
          {t('details.back')}
        </Link>

        <header className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='min-w-0 space-y-3'>
            <div className='flex flex-wrap gap-2'>
              <LeaseWorkflowBadge status={lease.workflow_status} />
              {lease.workflow_status === 'active' ? (
                <LeaseTemporalBadge status={getLeaseTemporalStatus(lease)} />
              ) : null}
            </div>
            <div>
              <h1 className='truncate text-2xl font-semibold tracking-tight sm:text-3xl'>
                {lease.title || `#${lease.id}`}
              </h1>
              <p className='mt-1 flex items-center gap-2 text-sm text-muted-foreground'>
                <Building2 className='size-4' />
                {lease.property?.title ?? '—'} / {lease.unit?.name ?? '—'}
              </p>
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            {canActivate ? (
              <Button size='sm' onClick={() => setActivateOpen(true)}>
                <CirclePlay />
                {t('actions.activate')}
              </Button>
            ) : null}
            {canRenew ? (
              <Button
                size='sm'
                variant='outline'
                onClick={() => setRenewOpen(true)}
              >
                <CalendarPlus2 />
                {t('actions.renew')}
              </Button>
            ) : null}
            {canTerminate ? (
              <Button
                size='sm'
                variant='destructive'
                onClick={() => setTerminateOpen(true)}
              >
                <LogOut />
                {t('actions.terminate')}
              </Button>
            ) : null}
          </div>
        </header>

        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-3'>
              <CardDescription>{t('table.term')}</CardDescription>
              <CardTitle className='flex items-center gap-2 text-base'>
                <CalendarRange className='size-4 text-muted-foreground' />
                {formatDate(lease.starts_on)} – {formatDate(lease.ends_on)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-3'>
              <CardDescription>{t('table.rent')}</CardDescription>
              <CardTitle className='flex items-center gap-2 text-base'>
                <WalletCards className='size-4 text-muted-foreground' />
                {formatCurrency(
                  rent?.amount ?? lease.rent_amount,
                  rent?.currency ?? lease.currency
                )}
              </CardTitle>
              {rent?.due_day ? (
                <CardDescription>
                  {t('details.dueDay', { day: rent.due_day })}
                </CardDescription>
              ) : null}
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-3'>
              <CardDescription>{t('details.guarantee')}</CardDescription>
              <CardTitle className='flex items-center gap-2 text-base'>
                <ShieldCheck className='size-4 text-muted-foreground' />
                {lease.guarantee_type
                  ? t(guaranteeKeys[lease.guarantee_type])
                  : t('details.noGuarantee')}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>{t('details.parties')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-1'>
              {lease.parties?.length ? (
                lease.parties.map((party, index) => (
                  <div key={party.id}>
                    <div className='flex items-center justify-between gap-4 py-3'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-muted'>
                          <UserRound className='size-4 text-muted-foreground' />
                        </span>
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-medium'>
                            {party.contact?.name ?? party.name_snapshot}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {party.role.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    {index < lease.parties.length - 1 ? <Separator /> : null}
                  </div>
                ))
              ) : (
                <p className='py-6 text-sm text-muted-foreground'>
                  {t('details.noParties')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('details.financialTerms')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-1'>
              {lease.financial_terms?.map((term, index) => (
                <div key={term.id}>
                  <div className='flex items-center justify-between gap-4 py-3'>
                    <div>
                      <p className='text-sm font-medium capitalize'>
                        {term.type.replace(/_/g, ' ')}
                      </p>
                      <p className='text-xs text-muted-foreground capitalize'>
                        {term.frequency.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <p className='text-sm font-semibold'>
                      {term.amount
                        ? formatCurrency(term.amount, term.currency ?? 'BRL')
                        : term.percentage
                          ? `${term.percentage}%`
                          : '—'}
                    </p>
                  </div>
                  {index < lease.financial_terms.length - 1 ? (
                    <Separator />
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('details.documents')}</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length ? (
              <div className='divide-y rounded-lg border'>
                {documents.map((document) => (
                  <Link
                    key={document.id}
                    to='/documents/$documentId'
                    params={{ documentId: String(document.id) }}
                    className='flex min-h-14 items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40'
                  >
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-medium'>
                        {document.title}
                      </p>
                      <p className='truncate text-xs text-muted-foreground'>
                        {document.purpose}
                      </p>
                    </div>
                    <DocumentTypeBadge
                      type={document.type}
                      label={document.kind?.label}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className='py-6 text-sm text-muted-foreground'>
                {t('details.noDocuments')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <LeaseActivationDialog
        lease={lease}
        open={activateOpen}
        onOpenChange={setActivateOpen}
      />
      <LeaseTerminationDialog
        lease={lease}
        open={terminateOpen}
        onOpenChange={setTerminateOpen}
      />
      <LeaseFormDrawer
        renewalOf={lease}
        open={renewOpen}
        onOpenChange={setRenewOpen}
      />
    </Main>
  )
}
