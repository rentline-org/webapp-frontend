import { useMemo, useState } from 'react'
import { FilePenLine, Plus, RefreshCw } from 'lucide-react'
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

type PropertyLeasesPanelProps = {
  property: IProperty
  unit?: IUnitData
}

export function PropertyLeasesPanel({
  property,
  unit,
}: PropertyLeasesPanelProps) {
  const unitId = unit?.id
  const filters = useMemo<IDocumentFilters>(
    () => ({
      type: 'lease',
      property_id: property.id,
      ...(unitId ? { unit_id: unitId } : {}),
    }),
    [property.id, unitId]
  )
  const { data, isLoading, isError, isFetching, refetch } =
    useGetDocuments(filters)
  const leases = data?.items ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<IDocument | null>(null)
  const [deletingDocument, setDeletingDocument] = useState<IDocument | null>(
    null
  )
  const [signatureDocument, setSignatureDocument] = useState<IDocument | null>(
    null
  )

  const initialUnitId =
    unit?.id ??
    (property.property_type === 'single_unit'
      ? property.units?.[0]?.id
      : undefined)
  const scopeName = unit ? unit.name : property.title

  return (
    <>
      <Card>
        <CardHeader className='gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle className='flex items-center gap-2'>
              <FilePenLine className='size-5 text-muted-foreground' />
              {unit ? 'Unit leases' : 'Property leases'}
            </CardTitle>
            <CardDescription>
              {unit
                ? `Lease agreements and terms recorded for ${unit.name}.`
                : `Lease agreements across ${property.title}.`}
            </CardDescription>
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
            New lease
          </Button>
        </CardHeader>

        <CardContent>
          {isError ? (
            <div className='flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 text-center'>
              <p className='text-sm text-muted-foreground'>
                Leases for {scopeName} could not be loaded.
              </p>
              <Button
                type='button'
                size='sm'
                variant='outline'
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                <RefreshCw
                  className={isFetching ? 'animate-spin' : undefined}
                />
                Try again
              </Button>
            </div>
          ) : (
            <DocumentsTable
              documents={leases}
              isLoading={isLoading}
              onEdit={(document) => {
                setEditingDocument(document)
                setFormOpen(true)
              }}
              onDelete={setDeletingDocument}
              onManageSignature={setSignatureDocument}
              emptyTitle={unit ? 'No leases for this unit' : 'No leases yet'}
              emptyDescription={
                unit
                  ? "Create a lease to record this unit's tenant, term, and rent."
                  : 'Create a lease to track tenant agreements for this property.'
              }
            />
          )}
        </CardContent>
      </Card>

      <DocumentFormDrawer
        open={formOpen}
        onOpenChange={(nextOpen) => {
          setFormOpen(nextOpen)
          if (!nextOpen) setEditingDocument(null)
        }}
        document={editingDocument ?? undefined}
        initialType='lease'
        initialPropertyId={property.id}
        initialUnitId={initialUnitId}
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
    </>
  )
}
