import { useEffect, useRef, useState } from 'react'
import { ResetIcon } from '@radix-ui/react-icons'
import { ImagePlus, Upload } from 'lucide-react'
import { motion } from 'motion/react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import GalleryCard from '@/components/gallery-card'
import type { GalleryDraftItem } from '@/features/property-gallery/types'
import {
  buildGalleryPayload,
  createDraftItem,
  revokePreview,
} from '@/features/property-gallery/utils'

type Props = {
  title: string
  className?: string
  isLoading?: boolean
  onSave?: (payload: FormData) => void
}

const PropertyGalleryUploadForm = ({
  title,
  className,
  onSave,
  isLoading = false,
}: Props) => {
  const [drafts, setDrafts] = useState<GalleryDraftItem[]>([])
  const draftsRef = useRef<GalleryDraftItem[]>([])

  useEffect(() => {
    draftsRef.current = drafts
  }, [drafts])

  useEffect(() => {
    return () => {
      draftsRef.current.forEach((item) => revokePreview(item.previewUrl))
    }
  }, [])

  const addFiles = (files: File[]) => {
    if (!files.length) return

    setDrafts((current) => {
      const existingKeys = new Set(
        current.map(
          (item) =>
            `${item.file.name}-${item.file.size}-${item.file.lastModified}`
        )
      )

      const nextItems = files
        .filter((file) => file.type.startsWith('image/'))
        .filter(
          (file) =>
            !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`)
        )
        .map(createDraftItem)

      return [...current, ...nextItems]
    })
  }

  const removeDraft = (id: string) => {
    setDrafts((current) => {
      const target = current.find((item) => item.id === id)
      if (target) revokePreview(target.previewUrl)
      return current.filter((item) => item.id !== id)
    })
  }

  const updateDraftTitle = (id: string, value: string) => {
    setDrafts((current) =>
      current.map((item) => (item.id === id ? { ...item, title: value } : item))
    )
  }

  const downloadDraft = (item: GalleryDraftItem) => {
    const link = document.createElement('a')
    link.href = item.previewUrl
    link.download = item.file.name
    link.click()
  }

  const clearAll = () => {
    drafts.forEach((item) => revokePreview(item.previewUrl))
    setDrafts([])
  }

  const handleSave = () => {
    if (!drafts.length) return
    onSave?.(buildGalleryPayload(drafts))
    setDrafts([])
  }

  const hasDrafts = drafts.length > 0

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': [],
    },
    onDrop: addFiles,
  })

  return (
    <Card className={cn('border-none bg-background shadow-none', className)}>
      <CardHeader className='space-y-1 px-0'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Upload images in bulk, then edit each title before saving.
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6 px-0'>
        <div {...getRootProps()} className='w-full'>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={cn(
              'relative cursor-pointer overflow-hidden rounded-lg border border-dashed bg-background p-6 text-center transition-colors',
              isDragActive
                ? 'border-primary bg-accent/30'
                : 'border-border hover:border-primary/40 hover:bg-accent/20'
            )}
            onClick={open}
          >
            <input {...getInputProps()} />

            <div className='flex flex-col items-center justify-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card shadow-sm'>
                <ImagePlus className='h-5 w-5 text-muted-foreground' />
              </div>

              <div className='space-y-1'>
                <p className='text-sm font-semibold text-foreground'>
                  {isDragActive ? 'Drop images here' : 'Upload gallery images'}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Drag and drop or browse to add multiple images at once.
                </p>
              </div>

              <Button type='button' variant='outline' size='sm'>
                <Upload className='mr-2 size-4' />
                Choose images
              </Button>
            </div>
          </motion.div>
        </div>

        <Separator />

        <div className='flex items-center justify-between gap-3'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <p className='text-sm font-medium text-foreground'>
                Selected images
              </p>
              <Badge variant='secondary'>{drafts.length}</Badge>
            </div>
            <p className='text-sm text-muted-foreground'>
              Make sure the titles match the images uploaded
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='destructive'
                size='icon'
                onClick={clearAll}
                disabled={!hasDrafts}
              >
                <ResetIcon className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset selected</TooltipContent>
          </Tooltip>
        </div>

        {hasDrafts ? (
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {drafts.map((item) => (
              <GalleryCard
                key={item.id}
                title={item.title}
                imgUrl={item.previewUrl}
                onTitleSubmit={(value) => updateDraftTitle(item.id, value)}
                onDownload={() => downloadDraft(item)}
                onDelete={() => removeDraft(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className='rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground'>
            No images selected yet.
          </div>
        )}

        <div className='mt-12 flex items-center justify-start gap-2'>
          <Button
            type='button'
            onClick={handleSave}
            size='lg'
            disabled={!hasDrafts || !onSave || isLoading}
          >
            <Upload className='size-4' />
            Finish upload
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PropertyGalleryUploadForm
