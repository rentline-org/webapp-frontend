import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import GalleryTile from './gallery-tile'

function PropertyGallery({
  title = 'Image gallery',
  description = 'Add interior, exterior, floorplan, and amenity photos here.',
  onUploadImages,
  compact = false,
}: {
  title?: string
  description?: string
  onUploadImages: () => void
  compact?: boolean
}) {
  return (
    <Card className='overflow-hidden rounded-3xl border bg-card shadow-sm'>
      <CardContent className='space-y-4 p-5 sm:p-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1'>
            <h2 className='text-base font-semibold sm:text-lg'>{title}</h2>
            <p className='text-sm text-muted-foreground'>{description}</p>
          </div>

          <Button
            variant='outline'
            onClick={onUploadImages}
            className='shrink-0'
          >
            <Upload className='mr-2 size-4' />
            Upload images
          </Button>
        </div>

        <div
          className={cn(
            'grid gap-3',
            compact
              ? 'md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'
              : 'sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
          )}
        >
          <GalleryTile large />
          {Array.from({ length: compact ? 4 : 7 }).map((_, index) => (
            <GalleryTile key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PropertyGallery
