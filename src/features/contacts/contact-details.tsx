import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { getRouteApi, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building2,
  CalendarRange,
  FileKey2,
  Files,
  Languages,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { DocumentTypeBadge } from '@/features/documents/components/document-type-badge'
import { SignatureStatusBadge } from '@/features/documents/components/signature-status-badge'
import { useGetDocuments } from '@/features/documents/query'
import { LeaseWorkflowBadge } from '@/features/leases/components/lease-status-badges'
import { useGetLeases } from '@/features/leases/query'
import { ContactFormDrawer } from './components/contact-form-drawer'
import { ContactTypeBadge } from './components/contact-type-badge'
import { useGetContact } from './query'
import type { IContactAssignment } from './types'

const route = getRouteApi('/_authenticated/contacts/$contactId/')

export function ContactDetails() {
  const { t } = useTranslation('contacts')
  const { contactId } = route.useParams()
  const { tab = 'overview' } = route.useSearch()
  const navigate = route.useNavigate()
  const id = Number(contactId)
  const contactQuery = useGetContact(id, Number.isInteger(id))
  const leasesQuery = useGetLeases({ contact_id: id, per_page: 100 })
  const documentsQuery = useGetDocuments({ contact_id: id, per_page: 100 })
  const { formatDate } = useAppFormatters()
  const [editOpen, setEditOpen] = useState(false)

  if (contactQuery.isLoading) {
    return (
      <Main className='flex min-h-72 items-center justify-center'>
        <Loader2 className='size-5 animate-spin text-muted-foreground' />
      </Main>
    )
  }

  const contact = contactQuery.data
  if (!contact) {
    return (
      <Main className='flex min-h-72 flex-col items-center justify-center gap-4 text-center'>
        <UserRound className='size-8 text-muted-foreground' />
        <p className='font-medium'>{t('details.notFound')}</p>
        <Button asChild variant='outline'>
          <Link to='/contacts'>{t('details.back')}</Link>
        </Button>
      </Main>
    )
  }

  const assignments = contact.assignments ?? []
  const leases = leasesQuery.data?.items ?? contact.leases ?? []
  const documents = documentsQuery.data?.items ?? []
  const portal = contact.portal_access

  return (
    <>
      <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
        <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
          <Link
            to='/contacts'
            className='inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='size-4' />
            {t('details.back')}
          </Link>

          <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex min-w-0 items-start gap-4'>
              <span className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
                {contact.identity_kind === 'company' ? (
                  <Building2 className='size-6' />
                ) : (
                  <UserRound className='size-6' />
                )}
              </span>
              <div className='min-w-0 space-y-2'>
                <h1 className='truncate text-2xl font-semibold tracking-tight sm:text-3xl'>
                  {contact.name}
                </h1>
                <div className='flex flex-wrap items-center gap-2'>
                  <ContactTypeBadge type={contact.type} />
                  <Badge variant='outline' className='rounded-full'>
                    {t(`identity.${contact.identity_kind}`)}
                  </Badge>
                  <PortalStatusBadge
                    linked={portal?.linked ?? Boolean(contact.user_id)}
                    status={portal?.invitation?.status}
                  />
                </div>
              </div>
            </div>
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto'
              onClick={() => setEditOpen(true)}
            >
              <Pencil />
              {t('details.edit')}
            </Button>
          </header>

          <div className='grid gap-3 sm:grid-cols-3'>
            <SummaryCard
              icon={MapPin}
              label={t('details.assignments')}
              value={assignments.length}
            />
            <SummaryCard
              icon={FileKey2}
              label={t('details.leases')}
              value={leases.length}
            />
            <SummaryCard
              icon={Files}
              label={t('details.documents')}
              value={documents.length}
            />
          </div>

          <Tabs
            value={tab}
            onValueChange={(value) =>
              navigate({
                replace: true,
                search: (previous) => ({ ...previous, tab: value as typeof tab }),
              })
            }
          >
            <div className='overflow-x-auto pb-1'>
              <TabsList>
                <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
                <TabsTrigger value='assignments'>
                  {t('tabs.assignments')}
                </TabsTrigger>
                <TabsTrigger value='leases'>{t('tabs.leases')}</TabsTrigger>
                <TabsTrigger value='documents'>{t('tabs.documents')}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value='overview' className='grid gap-4 lg:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('details.contactInformation')}</CardTitle>
                  <CardDescription>{t('details.contactDescription')}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <InformationRow icon={Mail} label={t('fields.email')}>
                    {contact.email ? (
                      <a className='hover:underline' href={`mailto:${contact.email}`}>
                        {contact.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </InformationRow>
                  <InformationRow icon={Phone} label={t('fields.phone')}>
                    {contact.phone ? (
                      <a className='hover:underline' href={`tel:${contact.phone}`}>
                        {contact.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </InformationRow>
                  <InformationRow icon={ShieldCheck} label={t('fields.taxId')}>
                    {contact.tax_id_masked ?? '—'}
                  </InformationRow>
                  <InformationRow icon={Languages} label={t('fields.language')}>
                    {contact.preferred_locale === 'pt-BR'
                      ? 'Português (Brasil)'
                      : 'English'}
                  </InformationRow>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('portal.title')}</CardTitle>
                  <CardDescription>{t('portal.description')}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between gap-3 rounded-lg border p-4'>
                    <div className='min-w-0'>
                      <p className='font-medium'>
                        {portal?.linked
                          ? t('portal.linked')
                          : portal?.invitation
                            ? t(`portal.status.${portal.invitation.status}`)
                            : t('portal.notInvited')}
                      </p>
                      <p className='mt-1 truncate text-sm text-muted-foreground'>
                        {portal?.invitation?.email ?? contact.email ?? t('portal.noEmail')}
                      </p>
                    </div>
                    <UsersRound className='size-5 shrink-0 text-muted-foreground' />
                  </div>
                  {portal?.invitation?.expires_at &&
                    portal.invitation.status === 'pending' && (
                      <p className='text-sm text-muted-foreground'>
                        {t('portal.expires', {
                          date: formatDate(portal.invitation.expires_at),
                        })}
                      </p>
                    )}
                  <Button asChild variant='outline' className='w-full sm:w-auto'>
                    <Link to='/users'>{t('portal.manageAccess')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle>{t('details.properties')}</CardTitle>
                  <CardDescription>{t('details.propertiesDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {contact.properties.length ? (
                    <div className='grid gap-3 sm:grid-cols-2'>
                      {contact.properties.map((property) => (
                        <Link
                          key={property.id}
                          to='/properties/$propertySlug'
                          params={{ propertySlug: property.slug }}
                          className='flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40'
                        >
                          <Building2 className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
                          <span className='min-w-0'>
                            <span className='block truncate font-medium'>
                              {property.title}
                            </span>
                            {property.address && (
                              <span className='mt-1 block truncate text-sm text-muted-foreground'>
                                {property.address}
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text={t('details.noProperties')} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='assignments'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('assignments.title')}</CardTitle>
                  <CardDescription>{t('assignments.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {assignments.length ? (
                    <div className='grid gap-3 md:grid-cols-2'>
                      {assignments.map((assignment) => (
                        <AssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState text={t('assignments.empty')} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='leases'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('leases.title')}</CardTitle>
                  <CardDescription>{t('leases.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {leasesQuery.isLoading ? (
                    <LoadingState />
                  ) : leases.length ? (
                    <div className='grid gap-3'>
                      {leases.map((lease) => (
                        <Link
                          key={lease.id}
                          to='/leases/$leaseId'
                          params={{ leaseId: String(lease.id) }}
                          className='flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between'
                        >
                          <span className='min-w-0'>
                            <span className='block truncate font-medium'>
                              {lease.title || `#${lease.id}`}
                            </span>
                            <span className='mt-1 flex items-center gap-2 text-sm text-muted-foreground'>
                              <CalendarRange className='size-3.5' />
                              {formatDate(lease.starts_on)} – {formatDate(lease.ends_on)}
                            </span>
                          </span>
                          <LeaseWorkflowBadge status={lease.workflow_status} />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text={t('leases.empty')} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='documents'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('documents.title')}</CardTitle>
                  <CardDescription>{t('documents.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {documentsQuery.isLoading ? (
                    <LoadingState />
                  ) : documents.length ? (
                    <div className='grid gap-3'>
                      {documents.map((document) => (
                        <Link
                          key={document.id}
                          to='/documents/$documentId'
                          params={{ documentId: String(document.id) }}
                          className='flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between'
                        >
                          <span className='min-w-0'>
                            <span className='block truncate font-medium'>
                              {document.title}
                            </span>
                            <span className='mt-1 block truncate text-sm text-muted-foreground'>
                              {document.purpose}
                            </span>
                          </span>
                          <span className='flex flex-wrap gap-2'>
                            <DocumentTypeBadge
                              type={document.type}
                              label={document.kind?.label}
                            />
                            <SignatureStatusBadge status={document.signature_status} />
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text={t('documents.empty')} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Main>

      <ContactFormDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        contact={contact}
      />
    </>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className='flex items-center gap-3 p-4'>
        <span className='rounded-xl bg-muted p-2.5 text-muted-foreground'>
          <Icon className='size-4' />
        </span>
        <span>
          <span className='block text-2xl font-semibold'>{value}</span>
          <span className='block text-xs text-muted-foreground'>{label}</span>
        </span>
      </CardContent>
    </Card>
  )
}

function InformationRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail
  label: string
  children: ReactNode
}) {
  return (
    <div className='flex items-start gap-3'>
      <Icon className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
      <div className='min-w-0'>
        <p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
          {label}
        </p>
        <div className='mt-1 break-words text-sm'>{children}</div>
      </div>
    </div>
  )
}

function PortalStatusBadge({
  linked,
  status,
}: {
  linked: boolean
  status?: 'pending' | 'accepted' | 'revoked' | 'expired'
}) {
  const { t } = useTranslation('contacts')
  if (linked) {
    return (
      <Badge variant='success' className='rounded-full'>
        {t('portal.linkedBadge')}
      </Badge>
    )
  }

  return (
    <Badge variant={status === 'pending' ? 'info' : 'outline'} className='rounded-full'>
      {status ? t(`portal.status.${status}`) : t('portal.noAccessBadge')}
    </Badge>
  )
}

function AssignmentCard({
  assignment,
  formatDate,
}: {
  assignment: IContactAssignment
  formatDate: (value: string) => string
}) {
  const { t } = useTranslation('contacts')
  const title = assignment.unit?.name ?? assignment.property?.title ?? `#${assignment.id}`

  return (
    <div className='space-y-3 rounded-lg border p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='truncate font-medium'>{title}</p>
          {assignment.unit && assignment.property && (
            <p className='mt-1 truncate text-sm text-muted-foreground'>
              {assignment.property.title}
            </p>
          )}
        </div>
        <Badge variant='outline' className='rounded-full'>
          {t(`roles.${assignment.role}`, { defaultValue: assignment.role })}
        </Badge>
      </div>
      <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
        <span>{t(`sources.${assignment.source}`)}</span>
        {assignment.starts_on && <span>{formatDate(assignment.starts_on)}</span>}
        {assignment.ends_on && (
          <span>– {formatDate(assignment.ends_on)}</span>
        )}
        {assignment.ownership_percentage && (
          <span>{assignment.ownership_percentage}%</span>
        )}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className='flex min-h-40 items-center justify-center'>
      <Loader2 className='size-5 animate-spin text-muted-foreground' />
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className='flex min-h-40 items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground'>
      {text}
    </div>
  )
}
