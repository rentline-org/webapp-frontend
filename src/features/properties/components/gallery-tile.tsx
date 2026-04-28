import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const GalleryTile = ({ large = false }: { large?: boolean }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-muted/20',
        large ? 'aspect-[16/10]' : 'aspect-[4/3]'
      )}
    >
      <Skeleton className='h-full w-full rounded-none' />
      <ImageIcon className='pointer-events-none absolute inset-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-muted-foreground' />
    </div>
  )
}

export default GalleryTile
