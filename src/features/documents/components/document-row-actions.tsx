import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Download, FileCheck2, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { handleServerError } from '@/lib/handle-server-error'
import { downloadDocumentFile } from '../query'
import type { IDocument, IDocumentFile } from '../types'

type DocumentRowActionsProps = {
  document: IDocument
  onEdit: (document: IDocument) => void
  onDelete?: (document: IDocument) => void
  onManageSignature?: (document: IDocument) => void
}

export function DocumentRowActions({
  document,
  onEdit,
  onDelete,
  onManageSignature,
}: DocumentRowActionsProps) {
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(
    null
  )

  const handleDownload = async (file: IDocumentFile) => {
    setDownloadingFileId(file.id)

    try {
      await downloadDocumentFile(file)
    } catch (error) {
      handleServerError(error)
    } finally {
      setDownloadingFileId(null)
    }
  }

  const originalFile = document.files.original
  const signedFile = document.files.signed
  const isDownloading = downloadingFileId !== null

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-11 sm:size-8'>
          <DotsHorizontalIcon />
          <span className='sr-only'>Open actions for {document.title}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        {originalFile && (
          <DropdownMenuItem
            disabled={isDownloading}
            onClick={() => void handleDownload(originalFile)}
          >
            {downloadingFileId === originalFile.id ? (
              <Loader2 className='animate-spin' />
            ) : (
              <Download />
            )}
            Download original
          </DropdownMenuItem>
        )}

        {signedFile && (
          <DropdownMenuItem
            disabled={isDownloading}
            onClick={() => void handleDownload(signedFile)}
          >
            {downloadingFileId === signedFile.id ? (
              <Loader2 className='animate-spin' />
            ) : (
              <FileCheck2 />
            )}
            Download signed copy
          </DropdownMenuItem>
        )}

        {(originalFile || signedFile) && <DropdownMenuSeparator />}

        <DropdownMenuItem onClick={() => onEdit(document)}>
          <Pencil />
          Edit document
        </DropdownMenuItem>

        {document.requires_signature && onManageSignature && (
          <DropdownMenuItem onClick={() => onManageSignature(document)}>
            <FileCheck2 />
            Manage signature
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant='destructive'
              onClick={() => onDelete(document)}
            >
              <Trash2 />
              Delete document
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
