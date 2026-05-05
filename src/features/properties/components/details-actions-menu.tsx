import { getRouteApi } from '@tanstack/react-router'
import {
  Archive,
  Copy,
  Loader2,
  MoreHorizontal,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteProperty } from '../query'
import type { IProperty } from '../types'

const routeApi = getRouteApi('/_authenticated/properties/$propertySlug')

function DetailsActionsMenu({
  property,
}: {
  property: IProperty
  // onUploadImages: () => void
}) {
  const { mutate, isPending: isDeleting } = useDeleteProperty(property)
  const navigate = routeApi.useNavigate()

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Property link copied.')
  }

  const onDelete = () => {
    mutate(undefined, {
      async onSuccess() {
        toast.success('Property Deleted')

        navigate({
          to: '/properties',
        })
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isDeleting}
          variant={isDeleting ? 'destructive' : 'secondary'}
          size='icon'
          className='shrink-0'
        >
          {isDeleting ? <Loader2 /> : <MoreHorizontal className='size-4' />}
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
        <DropdownMenuItem variant='destructive' onClick={onDelete}>
          <Trash2 />
          Delete Property
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DetailsActionsMenu
