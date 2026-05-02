import { Archive, Copy, MoreHorizontal, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { IProperty } from '../types'

function DetailsActionsMenu({
  property,
  // onUploadImages,
}: {
  property: IProperty
  // onUploadImages: () => void
}) {
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Property link copied.')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='secondary' size='icon' className='shrink-0'>
          <MoreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuItem onSelect={() => {}}>
          <Upload className='mr-2 size-4' />
          Upload images
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={copyLink}>
          <Copy className='mr-2 size-4' />
          Copy property link
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            void navigator.clipboard.writeText(property.slug)
            toast.success('Property slug copied.')
          }}
        >
          <Archive className='mr-2 size-4' />
          Copy slug
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive'>
          <Trash2 />
          Delete Property
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DetailsActionsMenu
