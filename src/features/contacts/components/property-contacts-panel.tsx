import { useCallback, useMemo, useState } from 'react'
import { Link2, Loader2, Plus, RefreshCw, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { IProperty } from '@/features/properties/types'
import { useGetContacts, useUpdateContact } from '../query'
import type { IContact } from '../types'
import { ContactFormDrawer } from './contact-form-drawer'
import { ContactsTable } from './contacts-table'
import { LinkContactDialog } from './link-contact-dialog'

type PropertyContactsPanelProps = {
  property: IProperty
  title?: string
  description?: string
}

export function PropertyContactsPanel({
  property,
  title = 'Property contacts',
  description = 'Owners, agents, and tenants connected to this property.',
}: PropertyContactsPanelProps) {
  const { data: contacts = [], isLoading, isError, refetch } = useGetContacts()
  const updateMutation = useUpdateContact()
  const [formOpen, setFormOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<IContact | null>(null)
  const [removingContact, setRemovingContact] = useState<IContact | null>(null)

  const propertyContacts = useMemo(
    () =>
      contacts.filter((contact) => contact.property_ids.includes(property.id)),
    [contacts, property.id]
  )
  const initialPropertyIds = useMemo(() => [property.id], [property.id])

  const handleEdit = useCallback((contact: IContact) => {
    setEditingContact(contact)
    setFormOpen(true)
  }, [])

  const handleRemoveRequest = useCallback((contact: IContact) => {
    setRemovingContact(contact)
  }, [])

  const handleRemove = () => {
    if (!removingContact) return

    updateMutation.mutate(
      {
        contact: removingContact,
        payload: {
          property_ids: removingContact.property_ids.filter(
            (propertyId) => propertyId !== property.id
          ),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `${removingContact.name} removed from ${property.title}.`
          )
          setRemovingContact(null)
        },
      }
    )
  }

  return (
    <>
      <Card>
        <CardHeader className='gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle className='flex items-center gap-2'>
              <UsersRound className='size-5 text-muted-foreground' />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => setLinkOpen(true)}
              disabled={isLoading || isError}
              className='w-full sm:w-auto'
            >
              <Link2 />
              Link existing
            </Button>
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
              New contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className='flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center'>
              <p className='text-sm text-muted-foreground'>
                Contacts could not be loaded.
              </p>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => void refetch()}
              >
                <RefreshCw />
                Try again
              </Button>
            </div>
          ) : (
            <ContactsTable
              contacts={propertyContacts}
              isLoading={isLoading}
              onEdit={handleEdit}
              onRemoveFromProperty={handleRemoveRequest}
              showProperties={false}
              emptyTitle='No contacts linked'
              emptyDescription='Create a contact or link one from your organization.'
            />
          )}
        </CardContent>
      </Card>

      <ContactFormDrawer
        open={formOpen}
        onOpenChange={(nextOpen) => {
          setFormOpen(nextOpen)
          if (!nextOpen) setEditingContact(null)
        }}
        contact={editingContact}
        initialPropertyIds={initialPropertyIds}
      />

      <LinkContactDialog
        contacts={contacts}
        property={property}
        open={linkOpen}
        onOpenChange={setLinkOpen}
      />

      <ConfirmDialog
        open={Boolean(removingContact)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !updateMutation.isPending) setRemovingContact(null)
        }}
        title='Remove contact from property?'
        desc={
          removingContact ? (
            <span>
              <strong>{removingContact.name}</strong> will remain in your
              organization&apos;s contact directory.
            </span>
          ) : (
            'The contact will remain in your directory.'
          )
        }
        confirmText={
          updateMutation.isPending ? (
            <>
              <Loader2 className='animate-spin' />
              Removing…
            </>
          ) : (
            'Remove from property'
          )
        }
        isLoading={updateMutation.isPending}
        handleConfirm={handleRemove}
      />
    </>
  )
}
