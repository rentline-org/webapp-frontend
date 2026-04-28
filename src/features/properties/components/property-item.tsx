import { Link } from '@tanstack/react-router'
import { Image } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { IProperty } from '../types'
import { currency, statusStyles, typeIcon } from '../utils'

type PropertyCardProps = {
  property: IProperty
}

const PropertyItem = ({ property }: PropertyCardProps) => {
  return (
    <Link
      to='/properties/$propertySlug'
      params={{ propertySlug: property.slug }}
      className='block'
    >
      <Card className='h-full overflow-hidden rounded-3xl border bg-background p-0 shadow-sm transition-shadow hover:shadow-md'>
        <CardContent className='h-full p-0 hover:bg-secondary'>
          <div className='grid min-h-55 grid-cols-1 md:grid-cols-[180px_1fr]'>
            <div className='relative min-h-48 border-b md:min-h-55 md:border-r md:border-b-0'>
              {property.thumbnail_url ? (
                <>
                  <img
                    src={property.thumbnail_url}
                    alt={property.title}
                    className='h-full w-full object-cover'
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-black/20 to-transparent' />
                </>
              ) : (
                <div className='relative h-full w-full'>
                  <Skeleton className='h-full w-full rounded-none' />
                  <Image className='absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 transform' />
                </div>
              )}
            </div>

            <div className='flex flex-col justify-between gap-5 p-4 sm:p-5'>
              <div className='space-y-2'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0'>
                    <h2 className='text-lg leading-tight font-semibold wrap-break-word'>
                      {property.title}
                    </h2>
                    <p className='text-sm wrap-break-word text-muted-foreground'>
                      {property.address}
                    </p>
                  </div>

                  <Badge
                    variant={statusStyles(
                      property.is_available ? 'vacant' : 'occupied'
                    )}
                    className='self-start'
                  >
                    {property.is_available ? 'Vacant' : 'Occupied'}
                  </Badge>
                </div>

                <div className='flex flex-wrap gap-2 pt-2'>
                  <Badge variant='outline'>
                    {typeIcon(property.property_type)}
                    <span className='capitalize'>{property.property_type}</span>
                  </Badge>

                  <Badge variant='outline'>{property.units_count} units</Badge>
                </div>
              </div>

              <div className='mt-2 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-end sm:justify-between'>
                {property.rent_price && (
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Monthly rent
                    </p>
                    <p className='text-lg font-semibold sm:text-xl'>
                      {currency(property.rent_price, 'pt-BR', 'BRL')}
                      <span className='text-sm font-normal text-muted-foreground'>
                        /mo
                      </span>
                    </p>
                  </div>
                )}
                {property.sale_price && (
                  <div>
                    <p className='text-sm text-muted-foreground'>Sale price</p>
                    <p className='text-lg font-semibold sm:text-xl'>
                      {currency(property.sale_price, 'pt-BR', 'BRL')}
                      {/* <span className='text-sm font-normal text-muted-foreground'>
                        /mo
                      </span> */}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default PropertyItem
