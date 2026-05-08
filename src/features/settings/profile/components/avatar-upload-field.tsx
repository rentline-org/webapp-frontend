import * as React from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type AvatarUploadFieldProps = {
  value?: string | null
  onChange: (file: File | null) => void | Promise<void>
  fallbackText?: string
  className?: string
  disabled?: boolean
  isUploading?: boolean
}

export function AvatarUploadField({
  value,
  onChange,
  fallbackText = 'U',
  className,
  disabled = false,
  isUploading = false,
}: AvatarUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [localPreview, setLocalPreview] = React.useState<string | null>(null)

  const preview = localPreview ?? value ?? null

  React.useEffect(() => {
    return () => {
      if (localPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)

    await onChange(file)
  }

  const handleClick = () => {
    if (disabled || isUploading) return
    inputRef.current?.click()
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center',
        className
      )}
    >
      <button
        type='button'
        onClick={handleClick}
        disabled={disabled || isUploading}
        className='group relative h-24 w-24 shrink-0 overflow-hidden rounded-full transition outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed'
        aria-label='Change avatar'
      >
        <Avatar className='h-24 w-24 border border-border/70 shadow-sm'>
          <AvatarImage
            src={preview ?? undefined}
            alt='User avatar'
            className='object-cover'
          />
          <AvatarFallback className='bg-muted text-lg font-semibold'>
            {fallbackText}
          </AvatarFallback>
        </Avatar>

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition duration-200',
            isUploading ? 'opacity-100' : 'group-hover:opacity-100'
          )}
        >
          {isUploading ? (
            <Loader2 className='h-5 w-5 animate-spin text-white' />
          ) : (
            <Camera className='h-5 w-5 text-white' />
          )}
        </div>
      </button>

      <div className='space-y-1'>
        <p className='text-sm font-medium'>Profile avatar</p>
        <p className='text-sm text-muted-foreground'>
          Click the avatar to upload a new image.
        </p>
      </div>

      <input
        ref={inputRef}
        type='file'
        accept='image/png,image/jpeg,image/webp'
        className='hidden'
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
    </div>
  )
}
