import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { ResetIcon } from '@radix-ui/react-icons'
import { useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUploadOrganizationLogo } from '@/features/organizations/query'
import {
  type IOrganizationData,
  organizationLogoUploadSchema,
  type TOrganizationLogoUploadSchema,
} from '@/features/organizations/types'
import { invalidateUserProfile } from '../../profile/query'

type Props = {
  organization: IOrganizationData
}

const UploadOrganizationLogo = ({ organization }: Props) => {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const { mutate: uploadLogo, isPending } = useUploadOrganizationLogo()

  const currentPreview = previewUrl ?? organization.logo ?? null

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const openPicker = () => {
    if (isPending) return
    inputRef.current?.click()
  }

  const validateFile = (file: File) => {
    const result = organizationLogoUploadSchema.safeParse({ logo: file })

    if (!result.success) {
      return result.error.issues[0]?.message ?? 'Invalid file.'
    }

    return null
  }

  const handleFile = (file: File | null) => {
    if (!file || isPending) return

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

    uploadLogo({ logo: file } as TOrganizationLogoUploadSchema, {
      async onSuccess() {
        await invalidateUserProfile(queryClient)

        setPreviewUrl(null)
        setSelectedFileName(null)
        setLocalError(null)
        clearInput()

        toast.success('Organization logo updated!')
      },
      onError() {
        setPreviewUrl(null)
        setSelectedFileName(null)
        clearInput()
        toast.error('Failed to upload logo. Please try again.')
      },
    })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    handleFile(file)
  }

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0] ?? null
    handleFile(file)
  }

  return (
    <div className='rounded-2xl border border-border/50 p-4'>
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div>
          <div className='text-sm font-medium'>Logo</div>
          <p className='mt-1 text-xs text-muted-foreground'>
            Click or drop an image to replace the organization logo.
          </p>
        </div>

        {currentPreview && !isPending && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => {
                  setPreviewUrl(null)
                  setSelectedFileName(null)
                  setLocalError(null)
                  clearInput()
                }}
              >
                <ResetIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove Logo</TooltipContent>
          </Tooltip>
        )}
      </div>

      <button
        type='button'
        onClick={openPicker}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(false)
        }}
        onDrop={handleDrop}
        disabled={isPending}
        aria-label='Upload organization logo'
        className={cn(
          'group relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted transition',
          'outline-none focus:ring-2 focus:ring-primary/30',
          isPending && 'cursor-not-allowed opacity-90',
          dragActive && 'border-primary ring-2 ring-primary/20'
        )}
      >
        {currentPreview ? (
          <img
            src={currentPreview}
            alt='Organization logo preview'
            className='h-full w-full object-cover transition duration-200 group-hover:scale-[1.01]'
          />
        ) : (
          <div className='flex h-full flex-col items-center justify-center gap-3 px-6 text-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-full border bg-background shadow-sm'>
              <ImagePlus className='h-6 w-6 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-medium'>
                {dragActive ? 'Drop to upload' : 'No logo uploaded'}
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>
                JPG, PNG or WebP up to 2MB
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition duration-200',
            'group-hover:opacity-100',
            isPending && 'opacity-100',
            dragActive && 'opacity-100'
          )}
        >
          {isPending ? (
            <div className='flex flex-col items-center gap-2 text-white'>
              <Loader2 className='h-6 w-6 animate-spin' />
              <span className='text-xs font-medium'>Uploading...</span>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2 text-white'>
              <Upload className='h-6 w-6' />
              <span className='text-xs font-medium'>Click to change logo</span>
            </div>
          )}
        </div>
      </button>

      <div className='mt-4 flex flex-wrap items-center gap-3'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-9'
          onClick={openPicker}
          disabled={isPending}
        >
          <Upload className='mr-2 h-4 w-4' />
          {currentPreview ? 'Replace logo' : 'Upload logo'}
        </Button>

        <p className='text-xs text-muted-foreground'>
          Supported: JPG, PNG, WebP. Max size: 2MB.
        </p>
      </div>

      {selectedFileName && (
        <p className='mt-3 text-xs text-muted-foreground'>
          Selected file: <span className='font-medium'>{selectedFileName}</span>
        </p>
      )}

      {localError && (
        <p className='mt-3 text-sm text-destructive'>{localError}</p>
      )}

      <input
        ref={inputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp'
        className='hidden'
        onChange={handleInputChange}
        disabled={isPending}
      />
    </div>
  )
}

export default UploadOrganizationLogo
