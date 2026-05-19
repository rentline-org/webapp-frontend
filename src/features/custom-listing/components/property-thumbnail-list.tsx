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
import { useSingleUnit } from '@/features/properties/hooks/use-single-unit'

function PropertyThumbnail({ property }: { property: IProperty }) {
  const { isSingleUnit, unit } = useSingleUnit(property)

  const thumbnailUrl = isSingleUnit
    ? unit?.thumbnail?.url
    : property?.thumbnail?.url

  if (thumbnailUrl) {
    return (
      <Avatar className='h-10 w-10 border-2 border-white shadow-sm dark:border-gray-800'>
        <AvatarImage src={thumbnailUrl} alt={property.title} />
        <AvatarFallback>{getInitials(property.title)}</AvatarFallback>
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
  if (!properties?.length) {
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
      {properties.map((property) => (
        <TooltipProvider key={property.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <PropertyThumbnail property={property} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{property.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

export default PropertyThumbnailList
