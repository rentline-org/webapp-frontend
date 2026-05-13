import { Download, MoreVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import MinimalCard, { MinimalCardImage } from '@/components/ui/minimal-card'
import InlineText from '@/components/inline-text'
import { Lens } from './ui/lens'

type Props = {
  title: string
  imgUrl: string
  className?: string
  imageClassName?: string
  onTitleSubmit?: (value: string) => void
  onDownload?: () => void
  onDelete?: () => void
}

const GalleryCard = ({
  title,
  imgUrl,
  className,
  onTitleSubmit,
  onDownload,
  imageClassName,
  onDelete,
}: Props) => {
  const canEdit = Boolean(onTitleSubmit)
  const hasActions = Boolean(onDownload || onDelete)

  return (
    <MinimalCard className={cn('group overflow-hidden p-2', className)}>
      <Lens lensSize={100}>
        <MinimalCardImage
          src={imgUrl}
          alt={title}
          imgClass={cn('object-center', imageClassName)}
        />
      </Lens>

      <div className='flex items-center gap-2 px-2 pt-4 pb-2'>
        <div className='min-w-0 flex-1'>
          <InlineText
            value={title}
            editable={canEdit}
            onSubmit={onTitleSubmit}
            placeholder='Untitled image'
            className='items-start gap-2 pr-0'
            textClassName='text-sm font-semibold leading-5 text-foreground'
            inputClassName='text-sm font-semibold'
          />
        </div>

        {hasActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-8 shrink-0'
                aria-label='Open image actions'
              >
                <MoreVertical className='size-4' />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-44'>
              {onDownload && (
                <DropdownMenuItem onSelect={onDownload}>
                  <Download className='size-4' />
                  Download
                </DropdownMenuItem>
              )}

              {onDownload && onDelete && <DropdownMenuSeparator />}

              {onDelete && (
                <DropdownMenuItem onSelect={onDelete} variant='destructive'>
                  <Trash2 className='size-4' />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </MinimalCard>
  )
}

export default GalleryCard
