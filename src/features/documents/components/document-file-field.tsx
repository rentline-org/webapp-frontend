import { forwardRef, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { IDocumentFile } from '../types'

type DocumentFileFieldProps = {
  value: File | null
  onChange: (file: File | null) => void
  label: string
  accept: string
  description?: string
  currentFile?: IDocumentFile | null
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export const DocumentFileField = forwardRef<
  HTMLInputElement,
  DocumentFileFieldProps
>(function DocumentFileField(
  {
    value,
    onChange,
    label,
    accept,
    description,
    currentFile,
    disabled = false,
    required = false,
    error,
    className,
  },
  ref
) {
  const { t } = useTranslation('documents')
  const generatedId = useId()
  const inputId = `document-file-${generatedId}`
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`
  const displayedFile = value ?? currentFile

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={inputId} data-error={Boolean(error)}>
        {label}
        {required && <span aria-hidden='true'> *</span>}
      </Label>

      <input
        ref={ref}
        id={inputId}
        type='file'
        accept={accept}
        disabled={disabled}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [description ? descriptionId : null, error ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
        className='sr-only'
        onChange={(event) => {
          onChange(event.target.files?.[0] ?? null)
          event.target.value = ''
        }}
      />

      {displayedFile ? (
        <div
          className={cn(
            'flex min-w-0 items-center gap-3 rounded-lg border bg-muted/30 px-3 py-3',
            error && 'border-destructive',
            disabled && 'opacity-70'
          )}
        >
          <div className='flex size-9 shrink-0 items-center justify-center rounded-md border bg-background'>
            <FileText className='size-4 text-muted-foreground' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{displayedFile.name}</p>
            <p className='text-xs text-muted-foreground'>
              {formatFileSize(displayedFile.size)}
              {' · '}
              {currentFile && !value
                ? t('files.current')
                : t('files.ready')}
            </p>
          </div>

          {!disabled && value ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='shrink-0'
              onClick={() => onChange(null)}
            >
              <X />
              <span className='sr-only'>
                {t('files.removeNamed', { name: value.name })}
              </span>
            </Button>
          ) : null}
        </div>
      ) : (
        <Label
          htmlFor={inputId}
          aria-disabled={disabled}
          className={cn(
            'flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-colors',
            'hover:border-primary/50 hover:bg-muted/30',
            error && 'border-destructive',
            disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
          )}
        >
          <span className='flex size-9 items-center justify-center rounded-full border bg-background'>
            <Upload className='size-4 text-muted-foreground' />
          </span>
          <span className='text-sm font-medium'>{t('files.choose')}</span>
          <span className='text-xs font-normal text-muted-foreground'>
            {t('files.maxSize')}
          </span>
        </Label>
      )}

      {description ? (
        <p id={descriptionId} className='text-xs text-muted-foreground'>
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className='text-sm text-destructive'>
          {error}
        </p>
      ) : null}
    </div>
  )
})
