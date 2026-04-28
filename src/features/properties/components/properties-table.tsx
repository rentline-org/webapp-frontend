import { useEffect, useState } from 'react'
import {
  type ColumnFiltersState,
  type FilterFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import type { IProperty } from '../types'
import { propertyTypes, statusOptions } from '../utils/constants'
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

const propertyGlobalFilterFn: FilterFn<IProperty> = (
  row,
  _columnId,
  filterValue
) => {
  const query = String(filterValue ?? '')
    .trim()
    .toLowerCase()
  if (!query) return true

  const title = String(row.original.title ?? '').toLowerCase()
  const address = String(row.original.address ?? '').toLowerCase()
  const propertyType = String(row.original.property_type ?? '').toLowerCase()
  const status = row.original.is_available ? 'vacant' : 'occupied'

  return [title, address, propertyType, status].some((value) =>
    value.includes(query)
  )
}

const PropertiesTable = ({ data, onRowClick }: DataTableProps) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnFilters,
      pagination,
      sorting,
      globalFilter,
    },
    globalFilterFn: propertyGlobalFilterFn,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search properties...'
        filters={[
          {
            columnId: 'property_type',
            title: 'Type',
            options: propertyTypes
              .filter((item) => item.value !== 'all')
              .map((item) => ({
                label: item.label,
                value: item.value,
              })),
          },
          {
            columnId: 'status',
            title: 'Status',
            options: statusOptions.map((item) => ({
              label: item.label,
              value: item.value,
            })),
          },
        ]}
      />

      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader className='sticky top-0 z-10'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='hover:bg-muted/30'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'h-12 bg-muted/30 text-xs font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase',
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
                  className='group cursor-pointer transition-colors hover:bg-secondary/50 data-[state=selected]:bg-primary/5'
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
                <TableCell colSpan={table.getAllLeafColumns().length}>
                  <div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
                    <div className='rounded-2xl border bg-muted/30 p-3'>
                      <Eye className='size-5 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='text-base font-medium'>
                        No properties found
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Try adjusting the search or filters.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}

export default PropertiesTable
