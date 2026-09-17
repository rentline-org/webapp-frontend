import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Building2,
  CalendarRange,
  Check,
  FileClock,
  Files,
  FileText,
  Home,
  KeyRound,
  Loader2,
  Signature,
} from 'lucide-react'
import { useAppFormatters } from '@/i18n/use-formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { DocumentTypeBadge } from '@/features/documents/components/document-type-badge'
import { SignatureStatusBadge } from '@/features/documents/components/signature-status-badge'
import { useGetDocuments } from '@/features/documents/query'
import type { IDocument } from '@/features/documents/types'
import { useGetLeases } from '@/features/leases/query'
import type { IOperationalLease } from '@/features/leases/types'
import { getPrimaryTenantParty, getRentTerm } from '@/features/leases/utils'
import {
  LeaseTemporalBadge,
  LeaseWorkflowBadge,
} from '@/features/leases/components/lease-status-badges'
import { useGetActionItems, useUpdateActionItem } from '@/features/operations/query'
import type { IActionItem } from '@/features/operations/types'
import { useUserProfileQuery } from '@/features/settings/profile/query'

export function Dashboard() {
  const profile = useUserProfileQuery()
  const leases = useGetLeases({ per_page: 100 })
  const documents = useGetDocuments({ per_page: 100 })
  const actionItems = useGetActionItems({ status: 'open', per_page: 20 })
  const isTenant = profile.data?.organization_role === 'tenant'
  const isLoading =
    profile.isLoading || leases.isLoading || documents.isLoading || actionItems.isLoading

  if (isLoading) {
    return (
      <Main className='flex min-h-72 items-center justify-center'>
        <Loader2 className='size-5 animate-spin text-muted-foreground' />
      </Main>
    )
  }

  if (isTenant) {
    return (
      <TenantDashboard
        name={profile.data?.first_name || profile.data?.name || ''}
        leases={leases.data?.items ?? []}
        documents={documents.data?.items ?? []}
        actionItems={actionItems.data?.items ?? []}
      />
    )
  }

  return (
    <OperationsDashboard
      name={profile.data?.first_name || profile.data?.name || ''}
      leases={leases.data?.items ?? []}
      documents={documents.data?.items ?? []}
      actionItems={actionItems.data?.items ?? []}
    />
  )
}

type DashboardData = {
  name: string
  leases: IOperationalLease[]
  documents: IDocument[]
  actionItems: IActionItem[]
}

function TenantDashboard({
  name,
  leases,
  documents,
  actionItems,
}: DashboardData) {
  const { t } = useTranslation('dashboard')
  const { formatDate, formatCurrency } = useAppFormatters()
  const primaryLease = [...leases]
    .filter((lease) => lease.workflow_status === 'active')
    .sort((a, b) => a.starts_on.localeCompare(b.starts_on))[0]
  const rent = primaryLease ? getRentTerm(primaryLease) : null
  const pendingSignatures = documents.filter((document) =>
    ['pending', 'partially_signed'].includes(document.signature_status)
  )

  return (
    <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6'>
        <header>
          <p className='text-sm font-medium text-primary'>{t('tenant.eyebrow')}</p>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight sm:text-3xl'>
            {t('tenant.greeting', { name })}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('tenant.description')}
          </p>
        </header>

        {primaryLease ? (
          <Card>
            <CardHeader className='gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Home className='size-5 text-muted-foreground' />
                  {primaryLease.property?.title ?? t('tenant.home')}
                </CardTitle>
                <CardDescription>
                  {primaryLease.unit?.name ?? '—'}
                </CardDescription>
              </div>
              <LeaseTemporalBadge status={primaryLease.temporal_status} />
            </CardHeader>
            <CardContent className='grid gap-4 sm:grid-cols-3'>
              <SummaryValue
                icon={CalendarRange}
                label={t('tenant.term')}
                value={`${formatDate(primaryLease.starts_on)} – ${formatDate(primaryLease.ends_on)}`}
              />
              <SummaryValue
                icon={KeyRound}
                label={t('tenant.rent')}
                value={formatCurrency(
                  rent?.amount ?? primaryLease.rent_amount,
                  rent?.currency ?? primaryLease.currency
                )}
              />
              <div className='flex items-end sm:justify-end'>
                <Button asChild variant='outline' className='w-full sm:w-auto'>
                  <Link
                    to='/leases/$leaseId'
                    params={{ leaseId: String(primaryLease.id) }}
                  >
                    <FileText />
                    {t('tenant.viewLease')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className='py-10 text-center'>
              <Building2 className='mx-auto size-7 text-muted-foreground' />
              <p className='mt-3 font-medium'>{t('tenant.noLease')}</p>
              <p className='mt-1 text-sm text-muted-foreground'>
                {t('tenant.noLeaseDescription')}
              </p>
            </CardContent>
          </Card>
        )}

        <div className='grid gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Signature className='size-5 text-muted-foreground' />
                {t('tenant.signatures')}
              </CardTitle>
              <CardDescription>{t('tenant.signaturesDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {pendingSignatures.length ? (
                pendingSignatures.map((document) => (
                  <DocumentLink key={document.id} document={document} />
                ))
              ) : (
                <Empty text={t('tenant.noSignatures')} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Files className='size-5 text-muted-foreground' />
                {t('tenant.sharedDocuments')}
              </CardTitle>
              <CardDescription>{t('tenant.sharedDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {documents.length ? (
                documents.slice(0, 8).map((document) => (
                  <DocumentLink key={document.id} document={document} />
                ))
              ) : (
                <Empty text={t('tenant.noDocuments')} />
              )}
            </CardContent>
          </Card>
        </div>

        {actionItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <AlertTriangle className='size-5 text-amber-600' />
                {t('tenant.reminders')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {actionItems.map((item) => (
                <ActionItemRow key={item.id} item={item} readOnly />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Main>
  )
}

function OperationsDashboard({ name, leases, documents, actionItems }: DashboardData) {
  const { t } = useTranslation('dashboard')
  const activeLeases = leases.filter(
    (lease) => lease.workflow_status === 'active' && lease.temporal_status === 'current'
  )
  const upcomingLeases = leases.filter(
    (lease) => lease.workflow_status === 'active' && lease.temporal_status === 'upcoming'
  )
  const documentsNeedingAttention = documents.filter(
    (document) =>
      ['pending', 'partially_signed'].includes(document.signature_status) ||
      ['expiring', 'expired'].includes(document.expiry_status ?? '')
  )

  return (
    <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
        <header>
          <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
            {t('operations.greeting', { name })}
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('operations.description')}
          </p>
        </header>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <Metric
            icon={KeyRound}
            label={t('operations.currentLeases')}
            value={activeLeases.length}
            href='/leases'
          />
          <Metric
            icon={CalendarRange}
            label={t('operations.upcomingLeases')}
            value={upcomingLeases.length}
            href='/leases'
          />
          <Metric
            icon={FileClock}
            label={t('operations.documentAttention')}
            value={documentsNeedingAttention.length}
            href='/documents'
          />
          <Metric
            icon={AlertTriangle}
            label={t('operations.openActions')}
            value={actionItems.length}
            href='/tasks'
          />
        </div>

        <div className='grid gap-4 xl:grid-cols-[1.4fr_1fr]'>
          <Card>
            <CardHeader>
              <CardTitle>{t('operations.attentionTitle')}</CardTitle>
              <CardDescription>{t('operations.attentionDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {actionItems.length ? (
                actionItems.map((item) => (
                  <ActionItemRow key={item.id} item={item} />
                ))
              ) : (
                <Empty text={t('operations.noActions')} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('operations.documentsTitle')}</CardTitle>
              <CardDescription>{t('operations.documentsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {documentsNeedingAttention.length ? (
                documentsNeedingAttention.slice(0, 8).map((document) => (
                  <DocumentLink key={document.id} document={document} />
                ))
              ) : (
                <Empty text={t('operations.noDocuments')} />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className='flex-row items-center justify-between gap-4'>
            <div>
              <CardTitle>{t('operations.leaseTitle')}</CardTitle>
              <CardDescription>{t('operations.leaseDescription')}</CardDescription>
            </div>
            <Button asChild variant='outline' size='sm'>
              <Link to='/leases'>{t('operations.viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {[...activeLeases, ...upcomingLeases].slice(0, 6).map((lease) => {
              const tenant = getPrimaryTenantParty(lease)
              return (
                <Link
                  key={lease.id}
                  to='/leases/$leaseId'
                  params={{ leaseId: String(lease.id) }}
                  className='rounded-lg border p-4 transition-colors hover:bg-muted/40'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <p className='font-medium'>{lease.title || `Lease #${lease.id}`}</p>
                    <LeaseWorkflowBadge status={lease.workflow_status} />
                  </div>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {lease.property?.title} · {lease.unit?.name}
                  </p>
                  <p className='mt-1 text-sm'>
                    {tenant?.contact?.name ?? tenant?.name_snapshot ?? '—'}
                  </p>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Home
  label: string
  value: number
  href: '/leases' | '/documents' | '/tasks'
}) {
  return (
    <Link to={href}>
      <Card className='h-full transition-colors hover:bg-muted/30'>
        <CardContent className='flex items-center justify-between gap-4 p-5'>
          <div>
            <p className='text-sm text-muted-foreground'>{label}</p>
            <p className='mt-1 text-3xl font-semibold'>{value}</p>
          </div>
          <span className='rounded-xl bg-primary/10 p-3 text-primary'>
            <Icon className='size-5' />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

function SummaryValue({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home
  label: string
  value: string
}) {
  return (
    <div className='rounded-lg bg-muted/40 p-4'>
      <p className='flex items-center gap-2 text-xs text-muted-foreground'>
        <Icon className='size-3.5' />
        {label}
      </p>
      <p className='mt-2 text-sm font-medium'>{value}</p>
    </div>
  )
}

function DocumentLink({ document }: { document: DashboardData['documents'][number] }) {
  return (
    <Link
      to='/documents/$documentId'
      params={{ documentId: String(document.id) }}
      className='flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/40'
    >
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium'>{document.title}</p>
        <div className='mt-1 flex flex-wrap gap-1.5'>
          <DocumentTypeBadge type={document.type} label={document.kind?.label} />
          <SignatureStatusBadge status={document.signature_status} />
        </div>
      </div>
      <FileText className='size-4 shrink-0 text-muted-foreground' />
    </Link>
  )
}

function ActionItemRow({ item, readOnly = false }: { item: IActionItem; readOnly?: boolean }) {
  const update = useUpdateActionItem()
  const target = item.document_id
    ? { to: '/documents/$documentId' as const, params: { documentId: String(item.document_id) } }
    : item.lease_id
      ? { to: '/leases/$leaseId' as const, params: { leaseId: String(item.lease_id) } }
      : null
  const body = (
    <div className='min-w-0 flex-1'>
      <div className='flex flex-wrap items-center gap-2'>
        <p className='font-medium'>{item.title}</p>
        {item.priority === 'high' && <Badge variant='destructive'>High</Badge>}
      </div>
      {item.description && (
        <p className='mt-1 text-sm text-muted-foreground'>{item.description}</p>
      )}
    </div>
  )

  return (
    <div className='flex items-start gap-3 rounded-lg border p-3'>
      {target ? (
        <Link {...target} className='min-w-0 flex-1 hover:underline'>
          {body}
        </Link>
      ) : (
        body
      )}
      {!readOnly && item.capabilities.can_complete && (
        <Button
          size='icon'
          variant='ghost'
          aria-label='Complete action item'
          disabled={update.isPending}
          onClick={() => update.mutate({ item, status: 'completed' })}
        >
          {update.isPending ? <Loader2 className='animate-spin' /> : <Check />}
        </Button>
      )}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className='py-8 text-center text-sm text-muted-foreground'>{text}</p>
}
