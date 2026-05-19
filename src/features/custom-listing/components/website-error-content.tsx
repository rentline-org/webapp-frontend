import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TriangleAlert, Settings2 } from 'lucide-react'

type Props = {
  error: unknown
}

const WebsiteErrorContent = ({ error }: Props) => {
  return (
    <div className='flex w-full items-start justify-between gap-4'>
      <div className='space-y-2'>
        <Badge variant='destructive' className='gap-1'>
          <TriangleAlert className='h-3.5 w-3.5' />
          Failed to load
        </Badge>
        <h3 className='text-lg font-semibold text-foreground'>
          Website integration
        </h3>
        <p className='text-sm text-muted-foreground'>
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
      </div>
      <Button size='icon' variant='outline' className='h-9 w-9'>
        <Settings2 className='h-4 w-4' />
      </Button>
    </div>
  )
}

export default WebsiteErrorContent
