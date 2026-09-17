import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRouteApi } from '@tanstack/react-router'
import {
  AlertTriangle,
  Clock3,
  FileCheck2,
  FileText,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Main } from '@/components/layout/main'
import { ServerPagination } from '@/components/data-table'
import { DocumentDeleteDialog } from './components/document-delete-dialog'
import { DocumentFormDrawer } from './components/document-form-drawer'
import { DocumentSignatureDialog } from './components/document-signature-dialog'
import { DocumentsTable } from './components/documents-table'
import { useGetDocuments } from './query'
import type {
  DocumentLifecycle,
  DocumentType,
  IDocument,
  SignatureStatus,
} from './types'
import {
  DOCUMENT_KIND_I18N_KEYS,
  DOCUMENT_TYPE_OPTIONS,
} from './utils/constants'

const route = getRouteApi('/_authenticated/documents/')

export function Documents() {
  const { t } = useTranslation(['documents', 'common'])
  const {
    filter = '',
    type,
    signature,
    lifecycle,
    page = 1,
    perPage = 20,
  } = route.useSearch()
  const navigate = route.useNavigate()
  const deferredFilter = useDeferredValue(filter)
  const filters = useMemo(
    () => ({
      search: deferredFilter.trim() || undefined,
      type,
      signature_status: signature,
      lifecycle,
      page,
      per_page: perPage,
      sort: '-updated_at',
    }),
    [deferredFilter, lifecycle, page, perPage, signature, type]
  )
  const query = useGetDocuments(filters)
  const documents = query.data?.items ?? []
  const [formOpen, setFormOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<IDocument | null>(null)
  const [deletingDocument, setDeletingDocument] = useState<IDocument | null>(
    null
  )
  const [signatureDocument, setSignatureDocument] = useState<IDocument | null>(
    null
  )

  const handleEdit = useCallback((document: IDocument) => {
    setEditingDocument(document)
    setFormOpen(true)
  }, [])

  const hasFilters = Boolean(filter.trim() || type || signature || lifecycle)
  const summary = query.data?.summary ?? {}
  const attention = {
    pending_signatures:
      summary.pending_signatures ??
      documents.filter((item) => item.signature_status === 'pending').length,
    expiring:
      summary.expiring ??
      documents.filter((item) => item.expiry_status === 'expiring').length,
    expired:
      summary.expired ??
      documents.filter((item) => item.expiry_status === 'expired').length,
  }

  return (
    <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='flex flex-col gap-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              {t('documents:page.title')}
            </h1>
            <p className='max-w-2xl text-sm text-muted-foreground'>
              {t('documents:page.description')}
            </p>
          </div>
          <Button
            type='button'
            size='sm'
            className='min-h-11 w-full sm:min-h-8 sm:w-auto'
            onClick={() => {
              setEditingDocument(null)
              setFormOpen(true)
            }}
          >
            <Plus />
            {t('documents:page.add')}
          </Button>
        </header>

        <section
          aria-labelledby='document-attention-title'
          className='space-y-3'
        >
          <h2 id='document-attention-title' className='text-sm font-semibold'>
            {t('documents:attention.title')}
          </h2>
          <div className='grid gap-3 sm:grid-cols-3'>
            {[
              {
                key: 'pendingSignatures',
                value: attention.pending_signatures,
                icon: FileCheck2,
              },
              { key: 'expiringSoon', value: attention.expiring, icon: Clock3 },
              { key: 'expired', value: attention.expired, icon: AlertTriangle },
            ].map((item) => (
              <Card key={item.key}>
                <CardContent className='flex items-center gap-3 p-4'>
                  <span className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                    <item.icon className='size-4' />
                  </span>
                  <div>
                    <p className='text-xl font-semibold tabular-nums'>
                      {item.value}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {t(`documents:attention.${item.key}`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card>
          <CardContent className='space-y-4 pt-6'>
            <div className='flex flex-col gap-3 xl:flex-row xl:items-center'>
              <div className='relative min-w-0 flex-1 xl:max-w-md'>
                <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={filter}
                  onChange={(event) =>
                    navigate({
                      replace: true,
                      search: (previous) => ({
                        ...previous,
                        filter: event.target.value || undefined,
                        page: 1,
                      }),
                    })
                  }
                  placeholder={t('documents:page.searchPlaceholder')}
                  className='pl-9'
                />
              </div>

              <div className='grid gap-3 sm:grid-cols-3 xl:flex'>
                <Select
                  value={type ?? 'all'}
                  onValueChange={(value: DocumentType | 'all') =>
                    navigate({
                      replace: true,
                      search: (previous) => ({
                        ...previous,
                        type: value === 'all' ? undefined : value,
                        page: 1,
                      }),
                    })
                  }
                >
                  <SelectTrigger className='w-full xl:w-52'>
                    <SelectValue placeholder={t('documents:page.allKinds')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('documents:page.allKinds')}
                    </SelectItem>
                    {DOCUMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(
                          `documents:kinds.${DOCUMENT_KIND_I18N_KEYS[option.value]}.label`
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={signature ?? 'all'}
                  onValueChange={(value: SignatureStatus | 'all') =>
                    navigate({
                      replace: true,
                      search: (previous) => ({
                        ...previous,
                        signature: value === 'all' ? undefined : value,
                        page: 1,
                      }),
                    })
                  }
                >
                  <SelectTrigger className='w-full xl:w-48'>
                    <SelectValue
                      placeholder={t('documents:page.allSignatures')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('documents:page.allSignatures')}
                    </SelectItem>
                    {(
                      [
                        'not_required',
                        'pending',
                        'partially_signed',
                        'signed',
                        'declined',
                      ] as const
                    ).map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(
                          `documents:signature.${
                            value === 'not_required'
                              ? 'notRequired'
                              : value === 'partially_signed'
                                ? 'partiallySigned'
                                : value
                          }`
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={lifecycle ?? 'all'}
                  onValueChange={(value: DocumentLifecycle | 'all') =>
                    navigate({
                      replace: true,
                      search: (previous) => ({
                        ...previous,
                        lifecycle: value === 'all' ? undefined : value,
                        page: 1,
                      }),
                    })
                  }
                >
                  <SelectTrigger className='w-full xl:w-44'>
                    <SelectValue
                      placeholder={t('documents:page.allLifecycles')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('documents:page.allLifecycles')}
                    </SelectItem>
                    {(
                      ['draft', 'active', 'superseded', 'archived'] as const
                    ).map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(`documents:lifecycle.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasFilters ? (
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() =>
                    navigate({
                      replace: true,
                      search: {
                        filter: undefined,
                        type: undefined,
                        signature: undefined,
                        lifecycle: undefined,
                        page: 1,
                        perPage,
                      },
                    })
                  }
                >
                  {t('common:actions.reset')}
                </Button>
              ) : null}
            </div>

            {query.isError ? (
              <div className='flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-center'>
                <span className='rounded-2xl bg-muted p-3'>
                  <FileText className='size-5 text-muted-foreground' />
                </span>
                <div className='space-y-1'>
                  <p className='font-medium'>
                    {t('documents:page.loadErrorTitle')}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {t('documents:page.loadErrorDescription')}
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => void query.refetch()}
                >
                  <RefreshCw />
                  {t('common:actions.retry')}
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                <DocumentsTable
                  documents={documents}
                  isLoading={query.isLoading}
                  onEdit={handleEdit}
                  onDelete={setDeletingDocument}
                  onManageSignature={setSignatureDocument}
                  emptyTitle={
                    hasFilters
                      ? t('documents:page.noMatchesTitle')
                      : t('documents:page.emptyTitle')
                  }
                  emptyDescription={
                    hasFilters
                      ? t('documents:page.noMatchesDescription')
                      : t('documents:page.emptyDescription')
                  }
                />
                {query.data ? (
                  <ServerPagination
                    meta={query.data.meta}
                    disabled={query.isFetching}
                    onPageChange={(nextPage) =>
                      navigate({
                        search: (previous) => ({
                          ...previous,
                          page: nextPage,
                        }),
                      })
                    }
                    onPerPageChange={(nextPerPage) =>
                      navigate({
                        search: (previous) => ({
                          ...previous,
                          page: 1,
                          perPage: nextPerPage,
                        }),
                      })
                    }
                  />
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DocumentFormDrawer
        open={formOpen}
        onOpenChange={(nextOpen) => {
          setFormOpen(nextOpen)
          if (!nextOpen) setEditingDocument(null)
        }}
        document={editingDocument}
      />
      <DocumentDeleteDialog
        document={deletingDocument}
        open={Boolean(deletingDocument)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeletingDocument(null)
        }}
      />
      <DocumentSignatureDialog
        document={signatureDocument}
        open={Boolean(signatureDocument)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSignatureDocument(null)
        }}
      />
    </Main>
  )
}
