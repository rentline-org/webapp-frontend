import { type ColumnDef } from '@tanstack/react-table'
import { type VariantProps } from 'class-variance-authority'
import {
  BadgeDollarSign,
  Building2,
  CircleDashed,
  House,
  Image as ImageIcon,
  Layers3,
} from 'lucide-react'
import { cleanSnakecase, cn } from '@/lib/utils'
import { Badge, type badgeVariants } from '@/components/ui/badge'
// import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { LongText } from '@/components/long-text'
import type { IProperty, TPropertyType } from '../types'
import { currency } from '../utils'

export const propertiesColumns: ColumnDef<IProperty>[] = [
  //   {
  //     id: 'select',
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && 'indeterminate')
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label='Select all'
  //         className='translate-y-0.5'
  //       />
  //     ),
  //     meta: {
  //       className: cn('w-12 max-md:sticky max-md:inset-s-0 max-md:z-10'),
  //       thClassName: 'w-12',
  //     },
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label='Select row'
  //         className='translate-y-0.5'
  //         onClick={(e) => e.stopPropagation()}
  //       />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  //   },
  {
    id: 'thumbnail',
    accessorKey: 'thumbnail_url',
    header: () => (
      <span className='inline-flex items-center gap-2'>
        <ImageIcon className='size-3.5' />
        Thumbnail
      </span>
    ),
    cell: ({ row }) => {
      const { thumbnail, title, property_type, units } = row.original

      const imgUrl =
        property_type === 'multi_unit' ? thumbnail : units?.[0]?.thumbnail?.url

      if (!imgUrl) {
        return (
          <div className='relative aspect-4/3 w-28 overflow-hidden rounded-2xl bg-secondary'>
            <Skeleton className='h-full w-full rounded-none bg-secondary' />
            <ImageIcon className='absolute inset-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground' />
          </div>
        )
      }

      return (
        <img
          src={imgUrl}
          alt={title}
          className='aspect-4/3 w-28 rounded-2xl object-cover ring-1 ring-border'
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
    header: () => (
      <span className='inline-flex items-center gap-2'>
        <House className='size-3.5' />
        Property
      </span>
    ),
    cell: ({ row }) => (
      <div className='flex min-w-0 flex-col gap-1'>
        <LongText className='max-w-52 font-medium text-foreground'>
          {row.getValue('title')}
        </LongText>
        <span className='max-w-60 truncate text-xs text-muted-foreground'>
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
    header: () => (
      <span className='inline-flex items-center gap-2'>
        <Building2 className='size-3.5' />
        Type
      </span>
    ),
    cell: ({ row }) => {
      const { property_type } = row.original

      const variants: Record<
        TPropertyType,
        VariantProps<typeof badgeVariants>['variant']
      > = {
        single_unit: 'info',
        multi_unit: 'success',
        land: 'outline',
      }

      const icons: Record<TPropertyType, React.ReactNode> = {
        single_unit: <House className='mr-1 size-3.5' />,
        multi_unit: <Building2 className='mr-1 size-3.5' />,
        land: <Layers3 className='mr-1 size-3.5' />,
      }

      return (
        <Badge variant={variants[property_type]} className='capitalize'>
          {icons[property_type]}
          {cleanSnakecase(property_type)}
        </Badge>
      )
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
    header: () => (
      <span className='inline-flex items-center gap-2'>
        <CircleDashed className='size-3.5' />
        Units
      </span>
    ),
    cell: ({ row }) => {
      const { units_count, property_type } = row.original

      if (property_type !== 'multi_unit') {
        return (
          <Badge variant='warning' className='rounded-full'>
            N/A
          </Badge>
        )
      }

      return (
        <Badge variant='default' className='rounded-full'>
          {units_count}
        </Badge>
      )
    },
    meta: {
      className: 'w-24',
      thClassName: 'w-24',
    },
    enableSorting: true,
  },
  {
    accessorKey: 'rent_price',
    header: () => (
      <span className='inline-flex items-center gap-2'>
        <BadgeDollarSign className='size-3.5' />
        Rent
      </span>
    ),
    cell: ({ row }) => {
      const data = row.original.units?.[0]

      if (!data?.rent_price) {
        return <span className='text-muted-foreground'>—</span>
      }

      return (
        <span className='font-medium'>
          {currency(data!.rent_price, 'pt-BR', 'BRL')}
        </span>
      )
    },
    meta: {
      className: 'w-36',
      thClassName: 'w-36',
    },
    enableSorting: true,
  },
  // {
  //   accessorKey: 'sale_price',
  //   header: () => (
  //     <span className='inline-flex items-center gap-2'>
  //       <BadgeDollarSign className='size-3.5' />
  //       Sale
  //     </span>
  //   ),
  //   cell: ({ row }) => {
  //     const { sale_price } = row.original

  //     if (!sale_price) {
  //       return <span className='text-muted-foreground'>—</span>
  //     }

  //     return (
  //       <span className='font-medium'>
  //         {currency(sale_price, 'pt-BR', 'BRL')}
  //       </span>
  //     )
  //   },
  //   meta: {
  //     className: 'w-36',
  //     thClassName: 'w-36',
  //   },
  //   enableSorting: true,
  // },
  // {
  //   id: 'status',
  //   accessorFn: (row) => (row.is_available ? 'vacant' : 'occupied'),
  //   header: () => (
  //     <span className='inline-flex items-center gap-2'>
  //       <CircleCheck className='size-3.5' />
  //       Status
  //     </span>
  //   ),
  //   cell: ({ row }) => {
  //     const { is_available } = row.original
  //     const statusText = is_available ? 'Vacant' : 'Occupied'
  //     const badgeColor = is_available ? 'success' : 'info'

  //     return (
  //       <Badge variant={badgeColor} className='rounded-full'>
  //         {statusText}
  //       </Badge>
  //     )
  //   },
  //   filterFn: (row, id, value) => value.includes(row.getValue(id)),
  //   meta: {
  //     className: 'w-32',
  //     thClassName: 'w-32',
  //   },
  //   enableHiding: false,
  //   enableSorting: false,
  // },
]
