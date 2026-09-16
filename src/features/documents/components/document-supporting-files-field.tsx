import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { FileImage, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { IDocumentSupportingUpload } from '../types'
import { DOCUMENT_ACCEPT } from '../utils/constants'

type SupportingFilesFieldProps = {
  value: IDocumentSupportingUpload[]
  onChange: (value: IDocumentSupportingUpload[]) => void
  disabled?: boolean
  error?: string
}

const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

export function DocumentSupportingFilesField({
  value,
  onChange,
  disabled = false,
  error,
}: SupportingFilesFieldProps) {
  const { t } = useTranslation('documents')
  const inputId = `supporting-files-${useId()}`

  const addFiles = (files: File[]) => {
    const existing = new Set(value.map((item) => fileKey(item.file)))
    const additions = files
      .filter((file) => !existing.has(fileKey(file)))
      .slice(0, Math.max(0, 20 - value.length))
      .map((file) => ({ file, label: file.name, party_visible: false }))

    onChange([...value, ...additions])
  }

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='space-y-1'>
          <Label htmlFor={inputId}>{t('form.supportingFiles')}</Label>
          <p className='text-xs leading-relaxed text-muted-foreground'>
            {t('form.supportingDescription')}
          </p>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={disabled || value.length >= 20}
          asChild
        >
          <Label htmlFor={inputId} className='cursor-pointer'>
            <Plus />
            {t('form.addSupporting')}
          </Label>
        </Button>
      </div>

      <input
        id={inputId}
        type='file'
        className='sr-only'
        accept={DOCUMENT_ACCEPT}
        multiple
        disabled={disabled || value.length >= 20}
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []))
          event.target.value = ''
        }}
      />

      {value.length ? (
        <div className='divide-y rounded-lg border'>
          {value.map((upload, index) => (
            <div
              key={fileKey(upload.file)}
              className='grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,0.7fr)_auto] sm:items-center'
            >
              <div className='flex min-w-0 items-center gap-3'>
                <span className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted'>
                  <FileImage className='size-4 text-muted-foreground' />
                </span>
                <p className='truncate text-sm font-medium'>
                  {upload.file.name}
                </p>
              </div>

              <Input
                value={upload.label}
                aria-label={`${t('form.supportingFiles')}: ${upload.file.name}`}
                disabled={disabled}
                onChange={(event) => {
                  const next = [...value]
                  next[index] = { ...upload, label: event.target.value }
                  onChange(next)
                }}
              />

              <div className='flex items-center justify-between gap-3 sm:justify-end'>
                <Label className='flex cursor-pointer items-center gap-2 text-xs text-muted-foreground'>
                  <Checkbox
                    checked={upload.party_visible}
                    disabled={disabled}
                    onCheckedChange={(checked) => {
                      const next = [...value]
                      next[index] = {
                        ...upload,
                        party_visible: checked === true,
                      }
                      onChange(next)
                    }}
                  />
                  {t('form.partyVisible')}
                </Label>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  disabled={disabled}
                  onClick={() =>
                    onChange(value.filter((_, itemIndex) => itemIndex !== index))
                  }
                >
                  <X />
                  <span className='sr-only'>
                    {t('files.removeNamed', { name: upload.file.name })}
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className='text-sm text-destructive'>{error}</p> : null}
    </div>
  )
}
