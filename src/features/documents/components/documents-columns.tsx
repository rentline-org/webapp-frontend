import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Building2, CalendarClock, FileText, UserRound } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import type { IDocument } from '../types'
import { DocumentRowActions } from './document-row-actions'
import { DocumentTypeBadge } from './document-type-badge'
import { SignatureStatusBadge } from './signature-status-badge'

type DocumentColumnActions = {
  onEdit: (document: IDocument) => void
  onDelete?: (document: IDocument) => void
  onManageSignature?: (document: IDocument) => void
  formatDate: (value: string) => string
  labels: {
    document: string
    type: string
    usedFor: string
    signature: string
    updated: string
    organizationWide: string
    unit: (name: string) => string
  }
}

export const getDocumentsColumns = ({
  onEdit,
  onDelete,
  onManageSignature,
  formatDate,
  labels,
}: DocumentColumnActions): ColumnDef<IDocument>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.document} />
    ),
    cell: ({ row }) => {
      const document = row.original

      return (
        <div className='flex min-w-0 items-start gap-3 sm:min-w-52'>
          <span className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
            <FileText className='size-4' />
          </span>
          <div className='min-w-0 space-y-1.5'>
            <div>
              <Link
                to='/documents/$documentId'
                params={{ documentId: String(document.id) }}
                className='block rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
              >
                <LongText className='max-w-64 font-medium text-foreground hover:underline'>
                  {document.title}
                </LongText>
              </Link>
              <LongText className='max-w-64 text-xs text-muted-foreground'>
                {document.purpose}
              </LongText>
            </div>
            <div className='flex flex-wrap gap-1.5 sm:hidden'>
              <DocumentTypeBadge type={document.type} />
              <SignatureStatusBadge status={document.signature_status} />
            </div>
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.type} />
    ),
    cell: ({ row }) => (
      <DocumentTypeBadge
        type={row.original.type}
        label={row.original.kind?.label}
      />
    ),
    filterFn: 'equalsString',
    meta: { className: 'hidden sm:table-cell sm:w-36' },
  },
  {
    id: 'usedFor',
    accessorFn: (document) =>
      [
        document.property?.title ??
          document.lease?.property_title_snapshot ??
          document.contexts?.properties?.[0]?.title ??
          labels.organizationWide,
        document.unit?.name ?? document.lease?.unit_name_snapshot,
        document.parties?.[0]?.name ?? document.parties?.[0]?.contact?.name,
      ]
        .filter(Boolean)
        .join(' '),
    header: () => (
      <span className='inline-flex items-center gap-2'>
        <Building2 className='size-3.5' />
        {labels.usedFor}
      </span>
    ),
    cell: ({ row }) => {
      const document = row.original
      const propertyName =
        document.property?.title ??
        document.lease?.property_title_snapshot ??
        document.contexts?.properties?.[0]?.title ??
        labels.organizationWide
      const unitName =
        document.unit?.name ??
        document.contexts?.units?.[0]?.name ??
        document.lease?.unit_name_snapshot ??
        null
      const partyName =
        document.parties?.[0]?.name ??
        document.parties?.[0]?.contact?.name ??
        document.lease?.tenant?.name

      return (
        <div className='max-w-64 space-y-1'>
          <p className='truncate text-sm font-medium'>{propertyName}</p>
          {unitName && (
            <p className='truncate text-xs text-muted-foreground'>
              {labels.unit(unitName)}
            </p>
          )}
          {partyName && (
            <p className='flex items-center gap-1 truncate text-xs text-muted-foreground'>
              <UserRound className='size-3 shrink-0' />
              {partyName}
            </p>
          )}
        </div>
      )
    },
    enableSorting: false,
    meta: { className: 'hidden md:table-cell' },
  },
  {
    accessorKey: 'signature_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.signature} />
    ),
    cell: ({ row }) => (
      <SignatureStatusBadge status={row.original.signature_status} />
    ),
    filterFn: 'equalsString',
    meta: { className: 'hidden sm:table-cell sm:w-40' },
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={labels.updated} />
    ),
    cell: ({ row }) => (
      <span className='inline-flex items-center gap-2 text-sm whitespace-nowrap text-muted-foreground'>
        <CalendarClock className='size-3.5' />
        {formatDate(row.original.updated_at)}
      </span>
    ),
    meta: { className: 'hidden lg:table-cell lg:w-40' },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DocumentRowActions
        document={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        onManageSignature={onManageSignature}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    meta: { className: 'w-12 text-right' },
  },
]
