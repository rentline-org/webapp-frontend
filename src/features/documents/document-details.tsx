import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRouteApi, Link } from '@tanstack/react-router'
import {
  Archive,
  ArrowLeft,
  Building2,
  CircleCheck,
  Download,
  FileClock,
  FilePlus2,
  FileText,
  History,
  Loader2,
  Pencil,
  Share2,
  Signature,
  Trash2,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { getAppLocale } from '@/i18n'
import { handleServerError } from '@/lib/handle-server-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Main } from '@/components/layout/main'
import { useGetContacts } from '@/features/contacts/query'
import { DocumentFormDrawer } from './components/document-form-drawer'
import { DocumentSignatureDialog } from './components/document-signature-dialog'
import { DocumentTypeBadge } from './components/document-type-badge'
import { SignatureStatusBadge } from './components/signature-status-badge'
import {
  downloadDocumentFile,
  useAddDocumentSigner,
  useActivateDocument,
  useArchiveDocument,
  useCreateDocumentRevision,
  useGetDocument,
  useGetDocumentAuditEvents,
  useGrantDocumentShare,
  useRevokeDocumentShare,
  useRemoveDocumentSigner,
  useUpdateDocumentSigner,
} from './query'
import {
  documentFileError,
  type IDocument,
  type IDocumentFile,
  type IDocumentSigner,
} from './types'
import { DOCUMENT_ACCEPT, SIGNED_DOCUMENT_ACCEPT } from './utils/constants'

const route = getRouteApi('/_authenticated/documents/$documentId/')

export function DocumentDetails() {
  const { t } = useTranslation('documents')
  const { documentId } = route.useParams()
  const { tab = 'overview' } = route.useSearch()
  const navigate = route.useNavigate()
  const id = Number(documentId)
  const documentQuery = useGetDocument(id, Number.isInteger(id))
  const auditQuery = useGetDocumentAuditEvents(
    id,
    tab === 'activity' && Boolean(documentQuery.data?.capabilities?.can_update)
  )
  const archiveDocument = useArchiveDocument()
  const activateDocument = useActivateDocument()
  const [editOpen, setEditOpen] = useState(false)
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [revisionOpen, setRevisionOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [activateOpen, setActivateOpen] = useState(false)

  if (documentQuery.isLoading) {
    return (
      <Main className='flex min-h-72 items-center justify-center'>
        <Loader2 className='size-5 animate-spin text-muted-foreground' />
      </Main>
    )
  }

  const document = documentQuery.data
  if (!document) {
    return (
      <Main className='flex min-h-72 flex-col items-center justify-center gap-4 text-center'>
        <FileText className='size-8 text-muted-foreground' />
        <p className='font-medium'>{t('details.notFound')}</p>
        <Button asChild variant='outline'>
          <Link to='/documents'>{t('details.back')}</Link>
        </Button>
      </Main>
    )
  }

  const capabilities = document.capabilities ?? {}

  return (
    <>
      <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
        <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
          <Link
            to='/documents'
            className='inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='size-4' />
            {t('details.back')}
          </Link>

          <header className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='min-w-0 space-y-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <DocumentTypeBadge
                  type={document.type}
                  label={document.kind?.label}
                />
                <Badge variant='outline' className='capitalize'>
                  {t(`lifecycle.${document.lifecycle ?? 'draft'}`)}
                </Badge>
                <SignatureStatusBadge status={document.signature_status} />
                {document.expiry_status && (
                  <Badge
                    variant={
                      document.expiry_status === 'expired'
                        ? 'destructive'
                        : document.expiry_status === 'expiring'
                          ? 'warning'
                          : 'outline'
                    }
                    className='capitalize'
                  >
                    {document.expiry_status}
                  </Badge>
                )}
              </div>
              <div>
                <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                  {document.title}
                </h1>
                <p className='mt-1 max-w-3xl text-sm text-muted-foreground'>
                  {document.purpose}
                </p>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {capabilities.can_activate && (
                <Button size='sm' onClick={() => setActivateOpen(true)}>
                  <CircleCheck />
                  {t('details.activate')}
                </Button>
              )}
              {capabilities.can_update && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil />
                  {t('actions.edit')}
                </Button>
              )}
              {capabilities.can_create_revision && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setRevisionOpen(true)}
                >
                  <FilePlus2 />
                  {t('details.newRevision', { defaultValue: 'New revision' })}
                </Button>
              )}
              {document.requires_signature &&
                capabilities.can_manage_signatures && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSignatureOpen(true)}
                  >
                    <Signature />
                    {t('actions.manageSignature')}
                  </Button>
                )}
              {capabilities.can_archive && (
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setArchiveOpen(true)}
                >
                  <Archive />
                  {t('details.archive', { defaultValue: 'Archive' })}
                </Button>
              )}
            </div>
          </header>

          <Tabs
            value={tab}
            onValueChange={(value) =>
              navigate({
                replace: true,
                search: {
                  tab: value as 'overview' | 'files' | 'parties' | 'activity',
                },
              })
            }
          >
            <TabsList className='h-auto max-w-full justify-start overflow-x-auto p-1'>
              <TabsTrigger value='overview'>
                {t('details.overview')}
              </TabsTrigger>
              <TabsTrigger value='files'>{t('details.files')}</TabsTrigger>
              <TabsTrigger value='parties'>{t('details.parties')}</TabsTrigger>
              {capabilities.can_update && (
                <TabsTrigger value='activity'>
                  {t('details.activity')}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value='overview' className='mt-6 space-y-4'>
              <Overview document={document} />
            </TabsContent>
            <TabsContent value='files' className='mt-6 space-y-4'>
              <FilesAndVersions document={document} />
            </TabsContent>
            <TabsContent value='parties' className='mt-6 space-y-4'>
              <PartiesAndSigners document={document} />
            </TabsContent>
            <TabsContent value='activity' className='mt-6'>
              <Activity
                events={auditQuery.data?.items ?? []}
                isLoading={auditQuery.isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Main>

      <DocumentFormDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        document={document}
      />
      <DocumentSignatureDialog
        open={signatureOpen}
        onOpenChange={setSignatureOpen}
        document={document}
      />
      <RevisionDialog
        open={revisionOpen}
        onOpenChange={setRevisionOpen}
        document={document}
      />
      <ConfirmDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title={t('details.activateTitle')}
        desc={t('details.activateDescription')}
        confirmText={t('details.activate')}
        isLoading={activateDocument.isPending}
        handleConfirm={() =>
          activateDocument.mutate(document, {
            onSuccess: () => {
              toast.success(t('details.activated'))
              setActivateOpen(false)
            },
          })
        }
      />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={t('details.archiveTitle', {
          defaultValue: 'Archive this document?',
        })}
        desc={t('details.archiveDescription', {
          defaultValue:
            'The record and every version remain available in history, but no further changes can be made.',
        })}
        confirmText={t('details.archive', { defaultValue: 'Archive' })}
        isLoading={archiveDocument.isPending}
        handleConfirm={() =>
          archiveDocument.mutate(document, {
            onSuccess: () => {
              toast.success(
                t('details.archived', { defaultValue: 'Document archived.' })
              )
              setArchiveOpen(false)
            },
          })
        }
      />
    </>
  )
}

function Overview({ document }: { document: IDocument }) {
  const detailEntries = Object.entries(document.details ?? {}).filter(
    ([, value]) => value !== null && value !== ''
  )
  const contexts = document.contexts

  return (
    <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Overview</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2'>
          <Definition label='Reference' value={document.reference_number} />
          <Definition
            label='Issued on'
            value={formatDate(document.issued_on)}
          />
          <Definition
            label='Effective on'
            value={formatDate(document.effective_on)}
          />
          <Definition
            label='Expires on'
            value={formatDate(document.expires_on)}
          />
          {document.description && (
            <div className='sm:col-span-2'>
              <Definition label='Description' value={document.description} />
            </div>
          )}
          {detailEntries.map(([key, value]) => (
            <Definition
              key={key}
              label={humanize(key)}
              value={
                typeof value === 'boolean'
                  ? value
                    ? 'Yes'
                    : 'No'
                  : String(value)
              }
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Building2 className='size-5 text-muted-foreground' />
            Used for
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          {(
            contexts?.properties ??
            (document.property ? [document.property] : [])
          ).map((property) => (
            <Link
              key={property.id}
              to='/properties/$propertySlug'
              params={{ propertySlug: property.slug }}
              className='block rounded-md border p-3 hover:bg-muted/40'
            >
              <p className='font-medium'>{property.title}</p>
              <p className='text-xs text-muted-foreground'>Property</p>
            </Link>
          ))}
          {(contexts?.units ?? (document.unit ? [document.unit] : [])).map(
            (unit) => (
              <div key={unit.id} className='rounded-md border p-3'>
                <p className='font-medium'>{unit.name}</p>
                <p className='text-xs text-muted-foreground'>Unit</p>
              </div>
            )
          )}
          {(contexts?.leases ?? []).map((lease) => (
            <Link
              key={lease.id}
              to='/leases/$leaseId'
              params={{ leaseId: String(lease.id) }}
              className='block rounded-md border p-3 hover:bg-muted/40'
            >
              <p className='font-medium'>
                {lease.title || `Lease #${lease.id}`}
              </p>
              <p className='text-xs text-muted-foreground'>Lease</p>
            </Link>
          ))}
          {!document.property &&
            !document.unit &&
            (contexts?.properties.length ?? 0) === 0 &&
            (contexts?.units.length ?? 0) === 0 &&
            (contexts?.leases.length ?? 0) === 0 && (
              <p className='text-muted-foreground'>Organization-wide record</p>
            )}
        </CardContent>
      </Card>
    </div>
  )
}

function FilesAndVersions({ document }: { document: IDocument }) {
  const versions =
    document.versions ??
    (document.current_version ? [document.current_version] : [])

  return (
    <div className='space-y-4'>
      {versions.map((version) => (
        <Card key={version.id}>
          <CardHeader>
            <div className='flex flex-wrap items-start justify-between gap-2'>
              <div>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <FileClock className='size-5 text-muted-foreground' />
                  Version {version.version_number}
                </CardTitle>
                <CardDescription>
                  {formatDateTime(version.created_at)}
                  {version.creator?.name ? ` · ${version.creator.name}` : ''}
                </CardDescription>
              </div>
              {version.finalized_at && (
                <Badge variant='success'>Finalized</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {version.notes && <p className='text-sm'>{version.notes}</p>}
            <FileRow file={version.files.original} label='Primary document' />
            <FileRow file={version.files.signed} label='Final signed copy' />
            {(version.files.supporting ?? []).map((file) => (
              <FileRow
                key={file.id}
                file={file}
                label={file.label || 'Supporting file'}
              />
            ))}
            {!version.files.original &&
              !version.files.signed &&
              (version.files.supporting ?? []).length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No files are attached.
                </p>
              )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FileRow({
  file,
  label,
}: {
  file: IDocumentFile | null
  label: string
}) {
  const [downloading, setDownloading] = useState(false)
  if (!file) return null

  return (
    <div className='flex items-center justify-between gap-3 rounded-md border p-3'>
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium'>{file.file_name}</p>
        <p className='text-xs text-muted-foreground'>
          {label} · {formatBytes(file.size)}
          {file.party_visible ? ' · Party visible' : ''}
        </p>
      </div>
      <Button
        size='icon'
        variant='ghost'
        aria-label={`Download ${file.file_name}`}
        disabled={downloading}
        onClick={async () => {
          setDownloading(true)
          try {
            await downloadDocumentFile(file)
          } catch (error) {
            handleServerError(error)
          } finally {
            setDownloading(false)
          }
        }}
      >
        {downloading ? <Loader2 className='animate-spin' /> : <Download />}
      </Button>
    </div>
  )
}

function PartiesAndSigners({ document }: { document: IDocument }) {
  const { t } = useTranslation('documents')
  const updateSigner = useUpdateDocumentSigner()
  const addSigner = useAddDocumentSigner()
  const removeSigner = useRemoveDocumentSigner()
  const contactsQuery = useGetContacts()
  const grantShare = useGrantDocumentShare()
  const revokeShare = useRevokeDocumentShare()
  const [contactId, setContactId] = useState('')
  const [signerContactId, setSignerContactId] = useState('')
  const partyContactIds = new Set(
    (document.parties ?? []).map((party) => party.contact_id).filter(Boolean)
  )
  const sharedContactIds = new Set(
    (document.shares ?? []).map((share) => share.contact_id).filter(Boolean)
  )
  const eligibleContacts = (contactsQuery.data ?? []).filter(
    (contact) =>
      contact.user_id &&
      partyContactIds.has(contact.id) &&
      !sharedContactIds.has(contact.id)
  )
  const signerContactIds = new Set(
    (document.signers ?? []).map((signer) => signer.contact_id).filter(Boolean)
  )
  const eligibleSignerContacts = (contactsQuery.data ?? []).filter(
    (contact) =>
      partyContactIds.has(contact.id) && !signerContactIds.has(contact.id)
  )
  const canConfigureSigners = Boolean(
    document.capabilities?.can_manage_signatures &&
    document.lifecycle === 'draft' &&
    !document.is_signed
  )

  const changeSigner = (
    signer: IDocumentSigner,
    status: IDocumentSigner['status']
  ) => {
    updateSigner.mutate({ document, signer, status })
  }

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <UserRound className='size-5 text-muted-foreground' />
            Parties
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {(document.parties ?? []).length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No parties recorded.
            </p>
          ) : (
            (document.parties ?? []).map((party) => (
              <div key={party.id} className='rounded-md border p-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='font-medium'>
                    {party.name ?? party.name_snapshot ?? 'Party'}
                  </p>
                  <Badge variant='outline' className='capitalize'>
                    {humanize(party.role)}
                  </Badge>
                  {party.is_primary && (
                    <Badge variant='secondary'>Primary</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Signature className='size-5 text-muted-foreground' />
            Required signers
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {canConfigureSigners ? (
            <div className='flex flex-col gap-2 rounded-md border p-3 sm:flex-row'>
              <Select
                value={signerContactId}
                onValueChange={setSignerContactId}
              >
                <SelectTrigger className='flex-1'>
                  <SelectValue placeholder={t('details.selectSigner')} />
                </SelectTrigger>
                <SelectContent>
                  {eligibleSignerContacts.map((contact) => (
                    <SelectItem key={contact.id} value={String(contact.id)}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type='button'
                variant='outline'
                disabled={!signerContactId || addSigner.isPending}
                onClick={() => {
                  const signerContact = eligibleSignerContacts.find(
                    (contact) => contact.id === Number(signerContactId)
                  )
                  if (!signerContact) return
                  const partyRole = (document.parties ?? []).find(
                    (party) => party.contact_id === signerContact.id
                  )?.role
                  addSigner.mutate(
                    {
                      document,
                      contactId: signerContact.id,
                      role: partyRole ?? 'other',
                    },
                    { onSuccess: () => setSignerContactId('') }
                  )
                }}
              >
                {addSigner.isPending ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <UserPlus />
                )}
                {t('details.addSigner')}
              </Button>
            </div>
          ) : null}
          {(document.signers ?? []).length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No required signers.
            </p>
          ) : (
            (document.signers ?? []).map((signer) => (
              <div
                key={signer.id}
                className='flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='min-w-0'>
                  <p className='truncate font-medium'>{signer.name}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {signer.email || humanize(signer.role ?? 'signer')}
                  </p>
                </div>
                {document.capabilities?.can_manage_signatures &&
                !document.is_signed ? (
                  <div className='flex gap-1'>
                    <Select
                      value={signer.status}
                      onValueChange={(value) =>
                        changeSigner(signer, value as IDocumentSigner['status'])
                      }
                      disabled={updateSigner.isPending}
                    >
                      <SelectTrigger className='w-full sm:w-36'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['pending', 'signed', 'declined', 'waived'].map(
                          (status) => (
                            <SelectItem key={status} value={status}>
                              {humanize(status)}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {canConfigureSigners ? (
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        aria-label={t('details.removeSigner')}
                        disabled={removeSigner.isPending}
                        onClick={() =>
                          removeSigner.mutate({ document, signer })
                        }
                      >
                        <Trash2 />
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <Badge variant='outline'>{humanize(signer.status)}</Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {document.capabilities?.can_share && (
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Share2 className='size-5 text-muted-foreground' />
              Portal sharing
            </CardTitle>
            <CardDescription>
              Only linked document parties with an active organization account
              can receive access.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger className='flex-1'>
                  <SelectValue placeholder='Select an eligible party' />
                </SelectTrigger>
                <SelectContent>
                  {eligibleContacts.map((contact) => (
                    <SelectItem key={contact.id} value={String(contact.id)}>
                      {contact.name} · {contact.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!contactId || grantShare.isPending}
                onClick={() => {
                  const contact = eligibleContacts.find(
                    (item) => item.id === Number(contactId)
                  )
                  if (!contact?.user_id) return
                  grantShare.mutate(
                    {
                      document,
                      contactId: contact.id,
                      userId: contact.user_id,
                    },
                    { onSuccess: () => setContactId('') }
                  )
                }}
              >
                {grantShare.isPending && <Loader2 className='animate-spin' />}
                Grant access
              </Button>
            </div>
            {(document.shares ?? []).map((share) => (
              <div
                key={share.id}
                className='flex items-center justify-between gap-3 rounded-md border p-3'
              >
                <div className='min-w-0'>
                  <p className='truncate font-medium'>{share.user.name}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {share.user.email}
                  </p>
                </div>
                <Button
                  size='sm'
                  variant='ghost'
                  disabled={revokeShare.isPending}
                  onClick={() =>
                    revokeShare.mutate({ document, shareId: share.id })
                  }
                >
                  Revoke
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Activity({
  events,
  isLoading,
}: {
  events: Array<{
    id: number
    event: string
    actor: { name: string } | null
    created_at: string
  }>
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <History className='size-5 text-muted-foreground' />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-1'>
        {isLoading ? (
          <Loader2 className='mx-auto my-8 animate-spin text-muted-foreground' />
        ) : events.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            No activity has been recorded.
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className='flex gap-3 border-b py-3 last:border-0'
            >
              <span className='mt-0.5 rounded-full bg-muted p-2'>
                <History className='size-3.5' />
              </span>
              <div>
                <p className='text-sm font-medium'>{humanize(event.event)}</p>
                <p className='text-xs text-muted-foreground'>
                  {event.actor?.name ?? 'System'} ·{' '}
                  {formatDateTime(event.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function RevisionDialog({
  document,
  open,
  onOpenChange,
}: {
  document: IDocument
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const revision = useCreateDocumentRevision()
  const [file, setFile] = useState<File | null>(null)
  const [signedFile, setSignedFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const reset = () => {
    setFile(null)
    setSignedFile(null)
    setNotes('')
    setError(null)
    setProgress(0)
  }

  const submit = () => {
    const primaryError = documentFileError(file)
    const finalError = documentFileError(signedFile, true)
    if (!file || primaryError || finalError) {
      setError(primaryError ?? finalError ?? 'Choose the primary document.')
      return
    }

    const payload = new FormData()
    payload.append('file', file)
    if (signedFile) payload.append('signed_file', signedFile)
    if (notes.trim()) payload.append('notes', notes.trim())
    revision.mutate(
      { document, payload, onProgress: setProgress },
      {
        onSuccess: () => {
          toast.success('A new immutable document revision was created.')
          reset()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (revision.isPending) return
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Upload a new revision</DialogTitle>
          <DialogDescription>
            Previous versions remain unchanged and available in the audit
            history.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='revision-primary'>Primary document</Label>
            <Input
              id='revision-primary'
              type='file'
              accept={DOCUMENT_ACCEPT}
              className='h-auto py-2'
              disabled={revision.isPending}
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null
                setFile(selected)
                setError(documentFileError(selected))
              }}
            />
          </div>
          {document.requires_signature && (
            <div className='space-y-2'>
              <Label htmlFor='revision-signed'>
                Final signed copy (optional)
              </Label>
              <Input
                id='revision-signed'
                type='file'
                accept={SIGNED_DOCUMENT_ACCEPT}
                className='h-auto py-2'
                disabled={revision.isPending}
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null
                  setSignedFile(selected)
                  setError(documentFileError(selected, true))
                }}
              />
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='revision-notes'>Revision notes</Label>
            <Textarea
              id='revision-notes'
              value={notes}
              maxLength={1000}
              onChange={(event) => setNotes(event.target.value)}
              disabled={revision.isPending}
            />
          </div>
          {error && <p className='text-sm text-destructive'>{error}</p>}
          {revision.isPending && (
            <div className='space-y-1'>
              <Progress value={progress} />
              <p className='text-xs text-muted-foreground'>
                Uploading {progress}%
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={revision.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={revision.isPending}>
            {revision.isPending && <Loader2 className='animate-spin' />}
            Create revision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Definition({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className='space-y-1'>
      <p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
        {label}
      </p>
      <p className='text-sm'>{value || '—'}</p>
    </div>
  )
}

function humanize(value: string) {
  return value
    .replace(/^document\./, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(getAppLocale(), {
    dateStyle: 'medium',
  }).format(new Date(`${value}T12:00:00`))
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(getAppLocale(), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
