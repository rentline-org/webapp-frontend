import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MoreVertical, Plus, Edit, EyeOff, Power, Trash2 } from 'lucide-react'

function WebsiteIntegrationDropdownActions({
  isPublished,
  hasIntegration,
  onEdit,
  onPublishToggle,
  onDelete,
}: {
  isPublished: boolean
  hasIntegration: boolean
  onEdit: () => void
  onPublishToggle: () => void
  onView: () => void
  onCopyLink: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size='icon'
                variant='outline'
                className='h-9 w-9 shrink-0'
              >
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Actions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align='end' className='w-48'>
        {!hasIntegration ? (
          <DropdownMenuItem onClick={onEdit} className='gap-2'>
            <Plus className='h-4 w-4' />
            Create integration
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={onEdit} className='gap-2'>
              <Edit className='h-4 w-4' />
              Edit settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPublishToggle} className='gap-2'>
              {isPublished ? (
                <>
                  <EyeOff className='h-4 w-4' />
                  Unpublish
                </>
              ) : (
                <>
                  <Power className='h-4 w-4' />
                  Publish
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className='gap-2 text-destructive focus:text-destructive'
            >
              <Trash2 className='h-4 w-4' />
              Delete integration
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WebsiteIntegrationDropdownActions
