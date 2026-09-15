import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Link2Off, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { IContact } from '../types'

type ContactRowActionsProps = {
  contact: IContact
  onEdit: (contact: IContact) => void
  onDelete?: (contact: IContact) => void
  onRemoveFromProperty?: (contact: IContact) => void
}

export function ContactRowActions({
  contact,
  onEdit,
  onDelete,
  onRemoveFromProperty,
}: ContactRowActionsProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-11 sm:size-8'>
          <DotsHorizontalIcon />
          <span className='sr-only'>Open actions for {contact.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-52'>
        <DropdownMenuItem onClick={() => onEdit(contact)}>
          <Pencil />
          Edit contact
        </DropdownMenuItem>

        {onRemoveFromProperty && (
          <DropdownMenuItem onClick={() => onRemoveFromProperty(contact)}>
            <Link2Off />
            Remove from property
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant='destructive'
              onClick={() => onDelete(contact)}
            >
              <Trash2 />
              Delete contact
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
