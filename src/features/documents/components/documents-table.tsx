import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { Files, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppFormatters } from '@/i18n/use-formatters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { IDocument } from '../types'
import { getDocumentsColumns } from './documents-columns'

type DocumentsTableProps = {
  documents: IDocument[]
  isLoading?: boolean
  onEdit: (document: IDocument) => void
  onDelete?: (document: IDocument) => void
  onManageSignature?: (document: IDocument) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function DocumentsTable({
  documents,
  isLoading = false,
  onEdit,
  onDelete,
  onManageSignature,
  emptyTitle = 'No documents found',
  emptyDescription = 'Add a document or adjust your filters.',
}: DocumentsTableProps) {
  const { t } = useTranslation('documents')
  const { formatDate } = useAppFormatters()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'updated_at', desc: true },
  ])
  const columns = useMemo(
    () =>
      getDocumentsColumns({
        onEdit,
        onDelete,
        onManageSignature,
        formatDate,
        labels: {
          document: t('table.document'),
          type: t('table.type'),
          usedFor: t('table.usedFor'),
          signature: t('table.signature'),
          updated: t('table.updated'),
          organizationWide: t('common:organizationWide'),
          unit: (name) => t('table.unit', { name }),
        },
      }),
    [formatDate, onDelete, onEdit, onManageSignature, t]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: documents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className='flex flex-col gap-4'>
      <div className='overflow-x-auto rounded-lg border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'h-11 bg-muted/30 text-xs font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-40'>
                  <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                    <Loader2 className='size-4 animate-spin' />
                    {t('table.loading')}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'align-middle',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-52'>
                  <div className='flex flex-col items-center justify-center gap-3 text-center'>
                    <span className='rounded-2xl border bg-muted/30 p-3'>
                      <Files className='size-5 text-muted-foreground' />
                    </span>
                    <div className='space-y-1'>
                      <p className='font-medium'>{emptyTitle}</p>
                      <p className='text-sm text-muted-foreground'>
                        {emptyDescription}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
