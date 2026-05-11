import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Building2,
  Image as ImageIcon,
  Landmark,
  House,
  Layers3,
} from 'lucide-react'
import { cleanSnakecase } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { IProperty } from '../types'
import { currency } from '../utils'

type PropertyCardProps = {
  property: IProperty
}

const PropertyItem = ({ property }: PropertyCardProps) => {
  const isApartment = property.property_type === 'multi_unit'

  const unitData = useMemo(() => {
    if (property.property_type === 'single_unit') {
      return property.units?.[0]
    }

    return null
  }, [property.property_type, property.units])

  const typeIcon =
    property.property_type === 'single_unit' ? (
      <House className='size-3.5' />
    ) : property.property_type === 'multi_unit' ? (
      <Building2 className='size-3.5' />
    ) : (
      <Landmark className='size-3.5' />
    )

  const thumbnail = useMemo(() => {
    if (property.property_type === 'multi_unit') {
      return property?.thumbnail ?? null
    }

    return property?.units?.[0]?.thumbnail?.url ?? null
  }, [property.property_type, property?.thumbnail, property?.units])

  return (
    <Link
      to='/properties/$propertySlug'
      params={{ propertySlug: property.slug }}
      className='block'
    >
      <Card className='group h-full overflow-hidden bg-card/80 py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-md'>
        <CardContent className='p-0 md:h-full'>
          <div className='grid grid-cols-1 md:h-full md:grid-cols-[180px_1fr]'>
            <div className='relative h-full overflow-hidden border-b md:h-full md:border-r md:border-b-0'>
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={property.title}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-transparent text-muted-foreground'>
                  <div className='flex h-full flex-col items-center justify-center gap-2'>
                    <ImageIcon className='size-10' />
                    <span className='text-xs'>No image</span>
                  </div>
                </div>
              )}
            </div>

            <div className='flex flex-col gap-4 p-4 sm:p-5'>
              <div className='space-y-3'>
                <div className='flex items-start gap-3'>
                  <div className='min-w-0 flex-1'>
                    <h2 className='text-base font-semibold tracking-tight sm:text-lg'>
                      {property.title}
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                      {property.address}
                    </p>
                  </div>
                </div>

                <div className='flex flex-wrap gap-2'>
                  <Badge variant='default'>
                    {typeIcon} {cleanSnakecase(property.property_type)}
                  </Badge>

                  {isApartment && (
                    <Badge variant='outline'>
                      <Layers3 className='mr-1 size-3.5' />
                      {property.units_count} units
                    </Badge>
                  )}
                </div>
              </div>

              {unitData && (
                <div className='grid gap-3 sm:grid-cols-2'>
                  <div className='p-3'>
                    <p className='text-xs text-muted-foreground'>
                      Monthly rent
                    </p>
                    <p className='mt-1 text-base font-semibold'>
                      {unitData.rent_price
                        ? `${currency(unitData.rent_price, 'pt-BR', 'BRL')}`
                        : '—'}
                    </p>
                  </div>

                  {/* <div className='p-3'>
                    <p className='text-xs text-muted-foreground'>Sale price</p>
                    <p className='mt-1 text-base font-semibold'>
                      {unitData.sale_price
                        ? currency(unitData.sale_price, 'pt-BR', 'BRL')
                        : '—'}
                    </p>
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default PropertyItem
