import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Building2, Mail, Phone, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import type { IContact } from '../types'
import { ContactRowActions } from './contact-row-actions'
import { ContactTypeBadge } from './contact-type-badge'

type ContactColumnActions = {
  onEdit: (contact: IContact) => void
  onDelete?: (contact: IContact) => void
  onRemoveFromProperty?: (contact: IContact) => void
  showProperties?: boolean
}

export const getContactsColumns = ({
  onEdit,
  onDelete,
  onRemoveFromProperty,
  showProperties = true,
}: ContactColumnActions): ColumnDef<IContact>[] => {
  const columns: ColumnDef<IContact>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Contact' />
      ),
      cell: ({ row }) => (
        <div className='flex min-w-0 items-center gap-3 sm:min-w-44'>
          <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <UserRound className='size-4' />
          </span>
          <div className='min-w-0 space-y-1.5'>
            <Link
              to='/contacts/$contactId'
              params={{ contactId: String(row.original.id) }}
              className='block rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
            >
              <LongText className='max-w-56 font-medium text-foreground hover:underline'>
                {row.original.name}
              </LongText>
            </Link>
            <div className='sm:hidden'>
              <ContactTypeBadge type={row.original.type} />
            </div>
          </div>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => <ContactTypeBadge type={row.original.type} />,
      filterFn: 'equalsString',
      meta: { className: 'hidden sm:table-cell sm:w-40' },
    },
    {
      accessorKey: 'email',
      header: () => (
        <span className='inline-flex items-center gap-2'>
          <Mail className='size-3.5' />
          Email
        </span>
      ),
      cell: ({ row }) =>
        row.original.email ? (
          <a
            href={`mailto:${row.original.email}`}
            className='text-sm text-foreground underline-offset-4 hover:underline'
          >
            {row.original.email}
          </a>
        ) : (
          <span className='text-muted-foreground'>—</span>
        ),
      enableSorting: false,
      meta: { className: 'hidden md:table-cell' },
    },
    {
      accessorKey: 'phone',
      header: () => (
        <span className='inline-flex items-center gap-2'>
          <Phone className='size-3.5' />
          Phone
        </span>
      ),
      cell: ({ row }) =>
        row.original.phone ? (
          <a
            href={`tel:${row.original.phone}`}
            className='text-sm whitespace-nowrap text-foreground underline-offset-4 hover:underline'
          >
            {row.original.phone}
          </a>
        ) : (
          <span className='text-muted-foreground'>—</span>
        ),
      enableSorting: false,
      meta: { className: 'hidden lg:table-cell' },
    },
  ]

  if (showProperties) {
    columns.push({
      id: 'properties',
      accessorFn: (contact) =>
        contact.properties.map((property) => property.title).join(' '),
      header: () => (
        <span className='inline-flex items-center gap-2'>
          <Building2 className='size-3.5' />
          Properties
        </span>
      ),
      cell: ({ row }) => {
        const properties = row.original.properties

        if (properties.length === 0) {
          return (
            <span className='text-sm text-muted-foreground'>Unassigned</span>
          )
        }

        return (
          <div className='flex max-w-72 flex-wrap gap-1.5'>
            {properties.slice(0, 2).map((property) => (
              <Badge key={property.id} variant='outline'>
                {property.title}
              </Badge>
            ))}
            {properties.length > 2 && (
              <Badge variant='secondary'>+{properties.length - 2}</Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
      meta: { className: 'hidden sm:table-cell' },
    })
  }

  columns.push({
    id: 'actions',
    cell: ({ row }) => (
      <ContactRowActions
        contact={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        onRemoveFromProperty={onRemoveFromProperty}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    meta: { className: 'w-12 text-right' },
  })

  return columns
}
