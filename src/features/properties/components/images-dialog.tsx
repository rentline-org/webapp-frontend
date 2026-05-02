import { useState } from 'react'
import { toast } from 'sonner'
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
import type { IProperty } from '../types'

function PropertyImagesDialog({
  open,
  onOpenChange,
  property,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: IProperty
}) {
  const [files, setFiles] = useState<File[]>([])

  const handleOpenChange = (value: boolean) => {
    if (!value) setFiles([])
    onOpenChange(value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.success(`${files.length} image(s) prepared for upload.`)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Upload images</DialogTitle>
          <DialogDescription>
            Add property images for {property.title}. The API hook can be wired
            in later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='property-images'>Choose images</Label>
            <Input
              id='property-images'
              type='file'
              accept='image/*'
              multiple
              onChange={(event) =>
                setFiles(Array.from(event.target.files ?? []))
              }
            />
          </div>

          <div className='rounded-2xl border bg-muted/20 p-4'>
            <p className='text-sm font-medium'>Selected files</p>
            <div className='mt-3 space-y-2 text-sm text-muted-foreground'>
              {files.length ? (
                files.map((file) => <p key={file.name}>{file.name}</p>)
              ) : (
                <p>No files selected.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!files.length}>
              Upload images
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PropertyImagesDialog
