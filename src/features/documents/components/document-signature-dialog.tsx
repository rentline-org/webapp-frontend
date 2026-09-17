import { useId, useState } from 'react'
import { Download, FileCheck2, Loader2, Signature } from 'lucide-react'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  downloadDocumentFile,
  useRemoveDocumentSignature,
  useUploadDocumentSignature,
} from '../query'
import { documentFileError, type IDocument } from '../types'
import { SIGNED_DOCUMENT_ACCEPT } from '../utils/constants'

type DocumentSignatureDialogProps = {
  document: IDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentSignatureDialog({
  document,
  open,
  onOpenChange,
}: DocumentSignatureDialogProps) {
  const switchId = useId()
  const fileId = useId()
  const [nextSigned, setNextSigned] = useState<boolean | null>(null)
  const [signedFile, setSignedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const uploadMutation = useUploadDocumentSignature()
  const removeMutation = useRemoveDocumentSignature()
  const isPending = uploadMutation.isPending || removeMutation.isPending
  const isSigned = nextSigned ?? document?.is_signed ?? false
  const hasChanged = Boolean(document) && isSigned !== document?.is_signed

  const resetState = () => {
    setNextSigned(null)
    setSignedFile(null)
    setFileError(null)
  }

  const closeDialog = () => {
    resetState()
    onOpenChange(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return
    if (!nextOpen) resetState()
    onOpenChange(nextOpen)
  }

  const handleFileChange = (file: File | null) => {
    setSignedFile(file)
    setFileError(documentFileError(file, true))
  }

  const handleSave = () => {
    if (!document || !hasChanged) return

    if (isSigned) {
      const validationError = documentFileError(signedFile, true)
      if (!signedFile || validationError) {
        setFileError(validationError ?? 'Upload the signed copy.')
        return
      }

      uploadMutation.mutate(
        { document, file: signedFile },
        {
          onSuccess: (savedDocument) => {
            toast.success(
              savedDocument.is_signed
                ? `${document.title} was marked as signed.`
                : `The signed copy for ${document.title} was uploaded. Complete the remaining signer statuses to finish signature tracking.`
            )
            closeDialog()
          },
        }
      )
      return
    }

    removeMutation.mutate(document, {
      onSuccess: () => {
        toast.success(`${document.title} now needs a signature.`)
        closeDialog()
      },
    })
  }

  const handleDownload = async () => {
    const file = document?.files.signed
    if (!file) return

    setIsDownloading(true)
    try {
      await downloadDocumentFile(file)
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle className='inline-flex items-center gap-2'>
            <Signature className='size-5 text-muted-foreground' />
            Signature status
          </DialogTitle>
          <DialogDescription>
            Record whether {document?.title ?? 'this document'} has been signed
            and keep the verified copy with the original.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex items-start justify-between gap-4 rounded-lg border p-4'>
            <div className='space-y-1'>
              <Label htmlFor={switchId}>Document is signed</Label>
              <p className='text-sm text-muted-foreground'>
                {isSigned
                  ? 'A signed copy is stored with this document.'
                  : 'This document is still waiting for a signature.'}
              </p>
            </div>
            <Switch
              id={switchId}
              checked={isSigned}
              onCheckedChange={(checked) => {
                setNextSigned(checked)
                setFileError(null)
                if (!checked) setSignedFile(null)
              }}
              disabled={!document?.requires_signature || isPending}
              aria-label='Document is signed'
            />
          </div>

          {isSigned && !document?.is_signed && (
            <div className='space-y-2'>
              <Label htmlFor={fileId}>Signed copy</Label>
              <Input
                id={fileId}
                type='file'
                accept={SIGNED_DOCUMENT_ACCEPT}
                className='h-auto cursor-pointer py-2'
                aria-invalid={Boolean(fileError)}
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
                disabled={isPending}
              />
              <p
                className={
                  fileError
                    ? 'text-sm text-destructive'
                    : 'text-xs text-muted-foreground'
                }
              >
                {fileError ??
                  'PDF, Word document, or image. Maximum file size: 10 MB.'}
              </p>
            </div>
          )}

          {document?.is_signed && isSigned && document.files.signed && (
            <div className='flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3'>
              <div className='flex min-w-0 items-center gap-3'>
                <span className='rounded-md bg-background p-2 text-muted-foreground shadow-xs'>
                  <FileCheck2 className='size-4' />
                </span>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>
                    {document.files.signed.file_name}
                  </p>
                  <p className='text-xs text-muted-foreground'>Signed copy</p>
                </div>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => void handleDownload()}
                disabled={isDownloading || isPending}
              >
                {isDownloading ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <Download />
                )}
                <span className='sr-only sm:not-sr-only'>Download</span>
              </Button>
            </div>
          )}

          {document?.is_signed && !isSigned && (
            <Alert>
              <FileCheck2 />
              <AlertTitle>Signed copy will be removed</AlertTitle>
              <AlertDescription>
                The original stays in place, but this document will return to
                needs signature.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={closeDialog}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            disabled={
              !document ||
              !document.requires_signature ||
              !hasChanged ||
              isPending
            }
          >
            {isPending && <Loader2 className='animate-spin' />}
            Save signature status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
