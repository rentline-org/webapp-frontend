import { useMemo, useState } from 'react'
import { Check, Link2, Loader2, Search, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { IProperty } from '@/features/properties/types'
import { useUpdateContact } from '../query'
import type { IContact } from '../types'
import { ContactTypeBadge } from './contact-type-badge'

type LinkContactDialogProps = {
  contacts: IContact[]
  property: IProperty
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LinkContactDialog({
  contacts,
  property,
  open,
  onOpenChange,
}: LinkContactDialogProps) {
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null
  )
  const updateMutation = useUpdateContact()
  const availableContacts = useMemo(
    () =>
      contacts.filter((contact) => !contact.property_ids.includes(property.id)),
    [contacts, property.id]
  )

  const selectedContact = availableContacts.find(
    (contact) => contact.id === selectedContactId
  )

  const handleLink = () => {
    if (!selectedContact) return

    updateMutation.mutate(
      {
        contact: selectedContact,
        payload: {
          property_ids: [...selectedContact.property_ids, property.id],
        },
      },
      {
        onSuccess: () => {
          toast.success(`${selectedContact.name} linked to ${property.title}.`)
          setSelectedContactId(null)
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (updateMutation.isPending) return
        if (!nextOpen) setSelectedContactId(null)
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>Link an existing contact</DialogTitle>
          <DialogDescription>
            Choose a contact to connect to {property.title}.
          </DialogDescription>
        </DialogHeader>

        <Command className='rounded-lg border'>
          <CommandInput placeholder='Search contacts…' />
          <CommandList className='max-h-72'>
            <CommandEmpty>
              <div className='flex flex-col items-center gap-2 py-6 text-center'>
                {contacts.length > 0 && availableContacts.length === 0 ? (
                  <Link2 className='size-5 text-muted-foreground' />
                ) : (
                  <Search className='size-5 text-muted-foreground' />
                )}
                <span>
                  {contacts.length === 0
                    ? 'No contacts in your directory yet.'
                    : availableContacts.length === 0
                      ? 'Every contact is already linked.'
                      : 'No contacts found.'}
                </span>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {availableContacts.map((contact) => {
                const isSelected = contact.id === selectedContactId

                return (
                  <CommandItem
                    key={contact.id}
                    value={`${contact.id} ${contact.name} ${contact.email ?? ''} ${contact.phone ?? ''}`}
                    onSelect={() => setSelectedContactId(contact.id)}
                    className='gap-3 py-3'
                  >
                    <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-muted'>
                      <UserRound className='size-4 text-muted-foreground' />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate font-medium'>
                        {contact.name}
                      </span>
                      <span className='block truncate text-xs text-muted-foreground'>
                        {contact.email || contact.phone || 'No contact details'}
                      </span>
                    </span>
                    <ContactTypeBadge type={contact.type} />
                    <Check
                      className={cn(
                        'size-4 shrink-0 text-primary',
                        !isSelected && 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              setSelectedContactId(null)
              onOpenChange(false)
            }}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleLink}
            disabled={!selectedContact || updateMutation.isPending}
          >
            {updateMutation.isPending && <Loader2 className='animate-spin' />}
            Link contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
