import { Skeleton } from '@/components/ui/skeleton.tsx'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { getInitials } from '@/features/custom-listing/utils'
import type { IProperty } from '@/features/properties/types'
import { useMemo } from 'react'


type PropertyPreview = {
  id?: string;
  url?: string;
  name: string;
}

function PropertyThumbnail({ property }: { property: PropertyPreview }) {
  if (property.url) {
    return (
      <Avatar className='h-10 w-10 border-2 border-white shadow-sm dark:border-gray-800'>
        <AvatarImage src={property.url} alt={property.name} />
        <AvatarFallback>{getInitials(property.name)}</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Skeleton className='h-10 w-10 rounded-full border-2 border-white shadow-sm dark:border-gray-800' />
  )
}

function PropertyThumbnailList({
  properties = [],
}: {
  properties?: IProperty[] | null
}) {
  const propertyMedia = useMemo((): PropertyPreview[] => {
    if (!properties?.length) return []

    return [...properties]
      .sort((a, b) => {
        const aHasThumbnail = a.thumbnail !== null
        const bHasThumbnail = b.thumbnail !== null

        if (aHasThumbnail === bHasThumbnail) return 0
        return aHasThumbnail ? -1 : 1
      })
      .slice(0, 5)
      .map((p): PropertyPreview => ({
        ...p.thumbnail,
        name: p.title,
      }))
  }, [properties])

  if (!propertyMedia.length) {
    return (
      <div className='flex -space-x-2 overflow-hidden'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className='h-10 w-10 rounded-full border-2 border-white shadow-sm dark:border-gray-800'
          />
        ))}
      </div>
    )
  }

  return (
    <div className='flex -space-x-2 overflow-hidden'>
      {propertyMedia.map((property) => (
        <TooltipProvider key={property.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <PropertyThumbnail property={property} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{property.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

export default PropertyThumbnailList;