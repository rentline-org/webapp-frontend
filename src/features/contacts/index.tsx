import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Plus, RefreshCw, Search, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Main } from '@/components/layout/main'
import { ContactDeleteDialog } from './components/contact-delete-dialog'
import { ContactFormDrawer } from './components/contact-form-drawer'
import { ContactsTable } from './components/contacts-table'
import { useGetContacts } from './query'
import type { ContactType, IContact } from './types'
import { CONTACT_TYPE_OPTIONS } from './utils/constants'

const route = getRouteApi('/_authenticated/contacts/')

export function Contacts() {
  const { data: contacts = [], isLoading, isError, refetch } = useGetContacts()
  const { filter = '', type = 'all' } = route.useSearch()
  const navigate = route.useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<IContact | null>(null)
  const [deletingContact, setDeletingContact] = useState<IContact | null>(null)

  const filteredContacts = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase()

    return contacts.filter((contact) => {
      const matchesType = type === 'all' || contact.type === type
      const matchesSearch =
        normalizedFilter.length === 0 ||
        [
          contact.name,
          contact.email ?? '',
          contact.phone ?? '',
          ...contact.properties.map((property) => property.title),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedFilter)

      return matchesType && matchesSearch
    })
  }, [contacts, filter, type])

  const handleEdit = useCallback((contact: IContact) => {
    setEditingContact(contact)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((contact: IContact) => {
    setDeletingContact(contact)
  }, [])

  const hasFilters = filter.length > 0 || type !== 'all'

  return (
    <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              Contacts
            </h1>
            <p className='text-sm text-muted-foreground'>
              Manage owners, real estate agents, and tenant contacts.
            </p>
          </div>
          <Button
            type='button'
            size='sm'
            onClick={() => {
              setEditingContact(null)
              setFormOpen(true)
            }}
            className='w-full sm:w-auto'
          >
            <Plus />
            Add contact
          </Button>
        </div>

        <Card>
          <CardContent className='space-y-4 pt-6'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <div className='relative flex-1 sm:max-w-sm'>
                <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={filter}
                  onChange={(event) =>
                    navigate({
                      replace: true,
                      search: (previous) => ({
                        ...previous,
                        filter: event.target.value || undefined,
                      }),
                    })
                  }
                  placeholder='Search contacts or properties…'
                  className='pl-9'
                />
              </div>
              <Select
                value={type}
                onValueChange={(value: ContactType | 'all') =>
                  navigate({
                    replace: true,
                    search: (previous) => ({
                      ...previous,
                      type: value === 'all' ? undefined : value,
                    }),
                  })
                }
              >
                <SelectTrigger className='w-full sm:w-52'>
                  <SelectValue placeholder='All contact types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All contact types</SelectItem>
                  {CONTACT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() =>
                    navigate({
                      replace: true,
                      search: { filter: undefined, type: undefined },
                    })
                  }
                >
                  Reset
                </Button>
              )}
            </div>

            {isError ? (
              <div className='flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-center'>
                <span className='rounded-2xl bg-muted p-3'>
                  <UsersRound className='size-5 text-muted-foreground' />
                </span>
                <div className='space-y-1'>
                  <p className='font-medium'>Contacts could not be loaded</p>
                  <p className='text-sm text-muted-foreground'>
                    Check your connection and try again.
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => void refetch()}
                >
                  <RefreshCw />
                  Try again
                </Button>
              </div>
            ) : (
              <ContactsTable
                contacts={filteredContacts}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyTitle={
                  hasFilters ? 'No matching contacts' : 'No contacts yet'
                }
                emptyDescription={
                  hasFilters
                    ? 'Adjust the search or contact type filter.'
                    : 'Add your first owner, agent, or tenant contact.'
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ContactFormDrawer
        open={formOpen}
        onOpenChange={(nextOpen) => {
          setFormOpen(nextOpen)
          if (!nextOpen) setEditingContact(null)
        }}
        contact={editingContact}
      />

      <ContactDeleteDialog
        contact={deletingContact}
        open={Boolean(deletingContact)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeletingContact(null)
        }}
      />
    </Main>
  )
}
