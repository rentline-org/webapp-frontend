import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { FileText, Plus, RefreshCw, Search } from 'lucide-react'
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
import { DocumentDeleteDialog } from './components/document-delete-dialog'
import { DocumentFormDrawer } from './components/document-form-drawer'
import { DocumentSignatureDialog } from './components/document-signature-dialog'
import { DocumentsTable } from './components/documents-table'
import { useGetDocuments } from './query'
import type {
  DocumentType,
  IDocument,
  SignatureStatus,
} from './types'
import {
  DOCUMENT_TYPE_OPTIONS,
  SIGNATURE_STATUS_LABELS,
} from './utils/constants'

const route = getRouteApi('/_authenticated/documents/')

export function Documents() {
  const { filter = '', type, signature } = route.useSearch()
  const navigate = route.useNavigate()
  const deferredFilter = useDeferredValue(filter)
  const filters = useMemo(
    () => ({
      search: deferredFilter.trim() || undefined,
      type,
      signature_status: signature,
    }),
    [deferredFilter, signature, type]
  )
  const { data: documents = [], isLoading, isError, refetch } =
    useGetDocuments(filters)
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

  const hasFilters = Boolean(filter.trim() || type || signature)

  return (
    <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              Documents
            </h1>
            <p className='max-w-2xl text-sm text-muted-foreground'>
              Keep organization records, property files, and leases together
              with clear ownership and signature status.
            </p>
          </div>
          <Button
            type='button'
            size='sm'
            className='w-full sm:w-auto'
            onClick={() => {
              setEditingDocument(null)
              setFormOpen(true)
            }}
          >
            <Plus />
            Add document
          </Button>
        </div>

        <Card>
          <CardContent className='space-y-4 pt-6'>
            <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
              <div className='relative flex-1 lg:max-w-md'>
                <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={filter}
                  onChange={(event) =>
                    navigate({
                      replace: true,
                      search: (previous) => ({
                        ...previous,
                        filter: event.target.value || undefined,
                      }),
                    })
                  }
                  placeholder='Search titles, purposes, properties, or tenants…'
                  className='pl-9'
                />
              </div>

              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex'>
                <Select
                  value={type ?? 'all'}
                  onValueChange={(value: DocumentType | 'all') =>
                    navigate({
                      replace: true,
                      search: (previous) => ({
                        ...previous,
                        type: value === 'all' ? undefined : value,
                      }),
                    })
                  }
                >
                  <SelectTrigger className='w-full lg:w-48'>
                    <SelectValue placeholder='All document types' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All document types</SelectItem>
                    {DOCUMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                      }),
                    })
                  }
                >
                  <SelectTrigger className='w-full lg:w-48'>
                    <SelectValue placeholder='All signature statuses' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All signature statuses</SelectItem>
                    {Object.entries(SIGNATURE_STATUS_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {hasFilters && (
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
                      },
                    })
                  }
                >
                  Reset
                </Button>
              )}
            </div>

            {isError ? (
              <div className='flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-center'>
                <span className='rounded-2xl bg-muted p-3'>
                  <FileText className='size-5 text-muted-foreground' />
                </span>
                <div className='space-y-1'>
                  <p className='font-medium'>Documents could not be loaded</p>
                  <p className='text-sm text-muted-foreground'>
                    Check your connection and try again.
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => void refetch()}
                >
                  <RefreshCw />
                  Try again
                </Button>
              </div>
            ) : (
              <DocumentsTable
                documents={documents}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={setDeletingDocument}
                onManageSignature={setSignatureDocument}
                emptyTitle={
                  hasFilters ? 'No matching documents' : 'No documents yet'
                }
                emptyDescription={
                  hasFilters
                    ? 'Adjust the search or filters to see more records.'
                    : 'Upload a record or create the first lease for this organization.'
                }
              />
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
