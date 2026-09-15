import { FileWarning, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteDocument } from '../query'
import type { IDocument } from '../types'

type DocumentDeleteDialogProps = {
  document: IDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentDeleteDialog({
  document,
  open,
  onOpenChange,
}: DocumentDeleteDialogProps) {
  const deleteMutation = useDeleteDocument()

  const handleDelete = () => {
    if (!document) return

    deleteMutation.mutate(document, {
      onSuccess: () => {
        toast.success(`${document.title} was deleted.`)
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
          <FileWarning className='size-5' />
          Delete document
        </span>
      }
      desc={
        document ? (
          <span>
            Delete <strong>{document.title}</strong> and its uploaded files?{' '}
            {document.type === 'lease' &&
              'The associated lease record will also be deleted. '}
            This cannot be undone.
          </span>
        ) : (
          'Delete this document and its uploaded files?'
        )
      }
      confirmText={
        deleteMutation.isPending ? (
          <>
            <Loader2 className='animate-spin' />
            Deleting…
          </>
        ) : (
          'Delete document'
        )
      }
      destructive
      isLoading={deleteMutation.isPending}
      handleConfirm={handleDelete}
    />
  )
}
