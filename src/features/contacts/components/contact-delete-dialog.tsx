import { Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteContact } from '../query'
import type { IContact } from '../types'

type ContactDeleteDialogProps = {
  contact: IContact | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactDeleteDialog({
  contact,
  open,
  onOpenChange,
}: ContactDeleteDialogProps) {
  const deleteMutation = useDeleteContact()

  const handleDelete = () => {
    if (!contact) return

    deleteMutation.mutate(contact, {
      onSuccess: () => {
        toast.success(`${contact.name} was deleted.`)
        onOpenChange(false)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deleteMutation.isPending) onOpenChange(nextOpen)
      }}
      title={
        <span className='inline-flex items-center gap-2 text-destructive'>
          <TriangleAlert className='size-5' />
          Delete contact
        </span>
      }
      desc={
        contact ? (
          <span>
            Delete <strong>{contact.name}</strong> from this organization? The
            contact will also be removed from all linked properties. This cannot
            be undone.
          </span>
        ) : (
          'Delete this contact?'
        )
      }
      confirmText={
        deleteMutation.isPending ? (
          <>
            <Loader2 className='animate-spin' />
            Deleting…
          </>
        ) : (
          'Delete contact'
        )
      }
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={handleDelete}
    />
  )
}
