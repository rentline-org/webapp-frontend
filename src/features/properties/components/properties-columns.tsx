// components/properties-columns.tsx
import { type ColumnDef } from '@tanstack/react-table'
import { type VariantProps } from 'class-variance-authority'
import { Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge, type badgeVariants } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { LongText } from '@/components/long-text'
import type { IProperty, TPropertyType } from '../types'
import { currency } from '../utils'

export const propertiesColumns: ColumnDef<IProperty>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    meta: {
      className: cn('w-12 max-md:sticky max-md:inset-s-0 max-md:z-10'),
      thClassName: 'w-12',
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'thumbnail',
    accessorKey: 'thumbnail_url',
    header: 'Image',
    cell: ({ row }) => {
      const { thumbnail_url, title } = row.original

      if (!thumbnail_url) {
        return (
          <div className='relative aspect-[4/3] w-28 overflow-hidden rounded-xl border bg-muted/30'>
            <Skeleton className='h-full w-full rounded-none' />
            <Image className='absolute inset-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground' />
          </div>
        )
      }

      return (
        <img
          src={thumbnail_url}
          alt={title}
          className='aspect-[4/3] w-28 rounded-xl object-cover ring-1 ring-border'
        />
      )
    },
    meta: {
      className: 'w-36',
      thClassName: 'w-36',
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className='flex min-w-0 flex-col gap-1'>
        <LongText className='max-w-44 font-medium text-foreground'>
          {row.getValue('title')}
        </LongText>
        <span className='max-w-52 truncate text-xs text-muted-foreground'>
          {row.original.address}
        </span>
      </div>
    ),
    meta: {
      className: cn(
        'min-w-0',
        'max-md:sticky max-md:inset-s-14 max-md:z-10 max-md:bg-background'
      ),
      thClassName: 'min-w-0',
    },
    enableHiding: false,
  },
  {
    accessorKey: 'property_type',
    header: 'Type',
    cell: ({ row }) => {
      const { property_type } = row.original

      const variants: Record<
        TPropertyType,
        VariantProps<typeof badgeVariants>['variant']
      > = {
        house: 'info',
        apartment: 'success',
        land: 'outline',
      }

      return <Badge variant={variants[property_type]}>{property_type}</Badge>
    },
    filterFn: 'equalsString',
    meta: {
      className: 'w-36',
      thClassName: 'w-36',
    },
  },
  {
    accessorFn: (row) => row.units_count,
    id: 'units_count',
    header: 'Units',
    cell: ({ row }) => {
      const { units_count, property_type } = row.original

      if (property_type !== 'apartment') {
        return <Badge variant='warning'>N/A</Badge>
      }

      return <Badge variant='default'>{units_count}</Badge>
    },
    meta: {
      className: 'w-24',
      thClassName: 'w-24',
    },
    enableSorting: true,
  },
  {
    accessorKey: 'rent_price',
    header: 'Rent',
    cell: ({ row }) => {
      const { rent_price } = row.original

      if (!rent_price) {
        return <span className='text-muted-foreground'>—</span>
      }

      return <span>{currency(rent_price, 'pt-BR', 'BRL')}</span>
    },
    meta: {
      className: 'w-36',
      thClassName: 'w-36',
    },
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { is_available } = row.original
      const statusText = is_available ? 'Vacant' : 'Occupied'
      const badgeColor = is_available ? 'success' : 'info'

      return <Badge variant={badgeColor}>{statusText}</Badge>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    meta: {
      className: 'w-32',
      thClassName: 'w-32',
    },
    enableHiding: false,
    enableSorting: false,
  },
]
