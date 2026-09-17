import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Files, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { IProperty } from '@/features/properties/types'
import type { IUnitData } from '@/features/units/types'
import { useGetDocuments } from '../query'
import type { IDocument, IDocumentFilters } from '../types'
import { DocumentDeleteDialog } from './document-delete-dialog'
import { DocumentFormDrawer } from './document-form-drawer'
import { DocumentSignatureDialog } from './document-signature-dialog'
import { DocumentsTable } from './documents-table'

export function PropertyDocumentsPanel({
  property,
  unit,
}: {
  property: IProperty
  unit?: IUnitData
}) {
  const { t } = useTranslation('documents')
  const filters = useMemo<IDocumentFilters>(
    () => ({
      property_id: property.id,
      ...(unit ? { unit_id: unit.id } : {}),
      per_page: 100,
    }),
    [property.id, unit]
  )
  const documentsQuery = useGetDocuments(filters)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<IDocument | null>(null)
  const [deleting, setDeleting] = useState<IDocument | null>(null)
  const [signature, setSignature] = useState<IDocument | null>(null)
  const initialUnitId =
    unit?.id ??
    (property.property_type === 'single_unit'
      ? property.units?.[0]?.id
      : undefined)

  return (
    <>
      <Card>
        <CardHeader className='gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle className='flex items-center gap-2'>
              <Files className='size-5 text-muted-foreground' />
              {unit ? 'Unit documents' : 'Property documents'}
            </CardTitle>
            <CardDescription>
              {unit
                ? `Agreements, inspections, evidence, and records connected to ${unit.name}.`
                : `Property-wide records plus documents linked to units in ${property.title}.`}
            </CardDescription>
          </div>
          <Button
            size='sm'
            className='min-h-11 w-full sm:min-h-8 sm:w-auto'
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus />
            {t('page.add')}
          </Button>
        </CardHeader>
        <CardContent>
          {documentsQuery.isError ? (
            <div className='flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center'>
              <p className='text-sm text-muted-foreground'>
                {t('page.loadErrorDescription')}
              </p>
              <Button
                size='sm'
                variant='outline'
                disabled={documentsQuery.isFetching}
                onClick={() => void documentsQuery.refetch()}
              >
                <RefreshCw
                  className={
                    documentsQuery.isFetching ? 'animate-spin' : undefined
                  }
                />
                {t('common:actions.retry')}
              </Button>
            </div>
          ) : (
            <DocumentsTable
              documents={documentsQuery.data?.items ?? []}
              isLoading={documentsQuery.isLoading}
              onEdit={(document) => {
                setEditing(document)
                setFormOpen(true)
              }}
              onDelete={setDeleting}
              onManageSignature={setSignature}
              emptyTitle={
                unit ? 'No documents for this unit' : 'No property documents'
              }
              emptyDescription='Add a document here and its property or unit context will be preselected.'
            />
          )}
        </CardContent>
      </Card>

      <DocumentFormDrawer
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        document={editing}
        initialPropertyId={property.id}
        initialUnitId={initialUnitId}
      />
      <DocumentDeleteDialog
        document={deleting}
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
      <DocumentSignatureDialog
        document={signature}
        open={Boolean(signature)}
        onOpenChange={(open) => !open && setSignature(null)}
      />
    </>
  )
}
