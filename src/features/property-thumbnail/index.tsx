import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { ResetIcon } from '@radix-ui/react-icons'
import { useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  invalidatePropertiesQuery,
  invalidatePropertyBySlug,
} from '../properties/query'
import { type IProperty } from '../properties/types'
import type { IMediaData } from '../units/types'
import { useDeletePropretyThumbnail, useUploadPropertyThumbnail } from './query'
import { propertyThumbnailSchema } from './types'

type Props = {
  property: IProperty
  thumbnail: IMediaData | null
  className?: string
  disabled?: boolean
}

const PropertyThumbnail = ({
  property,
  thumbnail,
  className,
  disabled = false,
}: Props) => {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const uploadMutation = useUploadPropertyThumbnail()
  const deleteMutation = useDeletePropretyThumbnail()

  const [currentThumbnail, setCurrentThumbnail] = useState<IMediaData | null>(
    () => thumbnail
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const isBusy = disabled

  const displayThumbnail = useMemo(() => {
    if (previewUrl) {
      return {
        id: 'temp',
        url: previewUrl,
      }
    }

    return currentThumbnail
  }, [currentThumbnail, previewUrl])

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const revokePreview = () => {
    setPreviewUrl((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }

      return null
    })
  }

  const openPicker = () => {
    if (isBusy) return
    inputRef.current?.click()
  }

  const validateFile = (file: File) => {
    const result = propertyThumbnailSchema.safeParse({ thumbnail: file })

    if (!result.success) {
      return result.error.issues[0]?.message ?? 'Invalid file.'
    }

    return null
  }

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file)

    if (validationError) {
      setLocalError(validationError)
      toast.error(validationError)
      clearInput()
      return
    }

    setLocalError(null)
    setSelectedFileName(file.name)

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return await uploadMutation.mutateAsync(
      {
        propertyId: property.id,
        thumbnail: file,
      },
      {
        async onSuccess(data) {
          setCurrentThumbnail(data?.property?.thumbnail ?? null)
          setLocalError(null)
          setSelectedFileName(null)
          revokePreview()
          clearInput()

          await Promise.all([
            // invalidatePropertiesQuery(queryClient),
            invalidatePropertyBySlug(queryClient, property.slug),
          ])
        },
        onError(error) {
          revokePreview()
          setSelectedFileName(null)
          setLocalError('Failed to upload thumbnail.')
          clearInput()

          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to upload thumbnail.'
          )
        },
      }
    )
  }

  const handleDelete = async () => {
    if (!displayThumbnail) return

    await deleteMutation.mutateAsync(
      {
        propertyId: property.id,
      },
      {
        async onSuccess() {
          setCurrentThumbnail(null)
          setSelectedFileName(null)
          setLocalError(null)
          revokePreview()
          clearInput()

          await Promise.all([
            invalidatePropertiesQuery(queryClient),
            invalidatePropertyBySlug(queryClient, property.slug),
          ])
        },
        onError(error) {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to delete thumbnail.'
          )
        },
      }
    )
  }

  const handleFile = (file: File | null) => {
    if (!file || isBusy) return

    toast.promise(handleUpload(file), {
      success: () => 'Thumbnail changed successfully',
      loading: 'Uploading thumbnail...',
    })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null)
  }

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (isBusy) return

    setDragActive(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }

  return (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-2xl bg-muted',
        className
      )}
    >
      {displayThumbnail && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='secondary'
              size='icon'
              onClick={() => {
                toast.promise(handleDelete(), {
                  loading: 'Deleting thumbnail...',
                  success: 'Thumbnail deleted',
                })
              }}
              disabled={isBusy}
              className='absolute top-1 right-1 z-20 h-7 w-7 rounded-full'
            >
              <ResetIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>Remove thumbnail</TooltipContent>
        </Tooltip>
      )}

      <button
        type='button'
        onClick={openPicker}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!isBusy) setDragActive(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!isBusy) setDragActive(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(false)
        }}
        onDrop={handleDrop}
        disabled={isBusy}
        aria-label='Upload unit thumbnail'
        className={cn(
          'group relative h-full w-full overflow-hidden rounded-2xl border bg-muted transition',
          'outline-none focus:ring-2 focus:ring-primary/30',
          isBusy && 'cursor-not-allowed opacity-90',
          dragActive && 'border-primary ring-2 ring-primary/20'
        )}
      >
        {displayThumbnail ? (
          <img
            src={displayThumbnail.url}
            alt='Unit thumbnail preview'
            className='h-full w-full object-cover transition duration-200 group-hover:scale-[1.01]'
          />
        ) : (
          <div className='flex h-full flex-col items-center justify-center gap-2 px-3 text-center'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm'>
              <ImagePlus className='h-5 w-5 text-muted-foreground' />
            </div>
            <div>
              <p className='text-xs font-medium'>
                {dragActive ? 'Drop to upload' : 'No thumbnail'}
              </p>
              {/* <p className='mt-1 text-[11px] text-muted-foreground'>
                JPG, PNG, WebP
              </p> */}
            </div>
          </div>
        )}

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition duration-200',
            'group-hover:opacity-100',
            dragActive && 'opacity-100'
          )}
        >
          <div className='flex flex-col items-center gap-1 text-white'>
            <Upload className='h-5 w-5' />
            <span className='text-[11px] font-medium'>
              {displayThumbnail ? 'Change' : 'Upload'}
            </span>
          </div>
        </div>
      </button>

      {selectedFileName && (
        <p className='mt-2 text-[11px] text-muted-foreground'>
          Selected: <span className='font-medium'>{selectedFileName}</span>
        </p>
      )}

      {localError && (
        <p className='mt-2 text-xs text-destructive'>{localError}</p>
      )}

      <input
        ref={inputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp'
        className='hidden'
        onChange={handleInputChange}
        disabled={isBusy}
      />
    </div>
  )
}

export default PropertyThumbnail
