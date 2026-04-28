// components/properties-table.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import type { IProperty } from '../types'
import { propertiesColumns as columns } from './properties-columns'

type DataTableProps = {
  data: IProperty[]
  onRowClick: (property: IProperty) => void
}

function isInteractiveElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  return Boolean(
    target.closest(
      'button, a, input, textarea, select, [role="checkbox"], [data-no-row-click="true"]'
    )
  )
}

const PropertiesTable = ({ data, onRowClick }: DataTableProps) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  useEffect(() => {
    const pageCount = table.getPageCount()
    if (pagination.pageIndex > Math.max(pageCount - 1, 0)) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.max(pageCount - 1, 0),
      }))
    }
  }, [pagination.pageIndex, table])

  const rowCount = useMemo(() => data.length, [data])

  return (
    <div className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <div className='flex items-center gap-2'>
          <h2 className='text-sm font-medium'>Properties</h2>
          <Badge variant='outline' className='rounded-full px-2 py-0 text-xs'>
            {rowCount}
          </Badge>
        </div>
        <div className='text-xs text-muted-foreground'>
          Click any row to open details
        </div>
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader className='sticky top-0 z-10'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className='bg-muted/30 hover:bg-muted/30'
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'h-12 bg-muted/30 text-xs font-semibold tracking-wide text-muted-foreground uppercase',
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row cursor-pointer transition-colors hover:bg-secondary/50'
                  role='link'
                  tabIndex={0}
                  onClick={(e) => {
                    if (isInteractiveElement(e.target)) return
                    onRowClick(row.original)
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return
                    if (isInteractiveElement(e.target)) return
                    e.preventDefault()
                    onRowClick(row.original)
                  }}
                >
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
                <TableCell
                  colSpan={columns.length}
                  className='h-28 text-center'
                >
                  No properties found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='border-t px-4 py-3'>
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}

export default PropertiesTable
