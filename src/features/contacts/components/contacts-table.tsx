import { useEffect, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { Loader2, UsersRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import type { IContact } from '../types'
import { getContactsColumns } from './contacts-columns'

type ContactsTableProps = {
  contacts: IContact[]
  isLoading?: boolean
  onEdit: (contact: IContact) => void
  onDelete?: (contact: IContact) => void
  onRemoveFromProperty?: (contact: IContact) => void
  showProperties?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function ContactsTable({
  contacts,
  isLoading = false,
  onEdit,
  onDelete,
  onRemoveFromProperty,
  showProperties = true,
  emptyTitle = 'No contacts found',
  emptyDescription = 'Add a contact or adjust your filters.',
}: ContactsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ])
  const columns = useMemo(
    () =>
      getContactsColumns({
        onEdit,
        onDelete,
        onRemoveFromProperty,
        showProperties,
      }),
    [onDelete, onEdit, onRemoveFromProperty, showProperties]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: contacts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })

  useEffect(() => {
    const lastPageIndex = Math.max(0, table.getPageCount() - 1)
    if (table.getState().pagination.pageIndex > lastPageIndex) {
      table.setPageIndex(lastPageIndex)
    }
  }, [contacts.length, table])

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
                    Loading contacts…
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
                      <UsersRound className='size-5 text-muted-foreground' />
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

      {contacts.length > 10 && <DataTablePagination table={table} />}
    </div>
  )
}
