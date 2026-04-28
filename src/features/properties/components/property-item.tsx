import { Link } from '@tanstack/react-router'
import type { VariantProps } from 'class-variance-authority'
import {
  Building2,
  Image as ImageIcon,
  Landmark,
  House,
  Layers3,
} from 'lucide-react'
import { Badge, type badgeVariants } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { IProperty } from '../types'
import { currency, statusStyles } from '../utils'

type PropertyCardProps = {
  property: IProperty
}

const PropertyItem = ({ property }: PropertyCardProps) => {
  const isApartment = property.property_type === 'apartment'

  const typeLabel =
    property.property_type === 'house'
      ? 'House'
      : property.property_type === 'apartment'
        ? 'Apartment'
        : 'Land'

  const typeVariant: VariantProps<typeof badgeVariants>['variant'] =
    property.property_type === 'house'
      ? 'info'
      : property.property_type === 'apartment'
        ? 'success'
        : 'outline'

  const typeIcon =
    property.property_type === 'house' ? (
      <House className='size-3.5' />
    ) : property.property_type === 'apartment' ? (
      <Building2 className='size-3.5' />
    ) : (
      <Landmark className='size-3.5' />
    )

  return (
    <Link
      to='/properties/$propertySlug'
      params={{ propertySlug: property.slug }}
      className='block'
    >
      <Card className='group h-full overflow-hidden rounded-3xl border bg-card/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-md'>
        <CardContent className='p-0'>
          <div className='grid grid-cols-1 md:grid-cols-[180px_1fr]'>
            <div className='relative h-52 overflow-hidden border-b md:h-full md:border-r md:border-b-0'>
              {property.thumbnail_url ? (
                <img
                  src={property.thumbnail_url}
                  alt={property.title}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-transparent text-muted-foreground'>
                  <div className='flex flex-col items-center gap-2'>
                    <ImageIcon className='size-10' />
                    <span className='text-xs'>No image</span>
                  </div>
                </div>
              )}
            </div>

            <div className='flex flex-col gap-4 p-4 sm:p-5'>
              <div className='space-y-3'>
                <div className='flex items-start gap-3'>
                  {/* <div className='mt-0.5 rounded-full border bg-muted/40 p-2 text-muted-foreground'>
                    {typeIcon}
                  </div> */}

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
                  <Badge variant={typeVariant}>
                    {typeIcon} {typeLabel}
                  </Badge>

                  {isApartment && (
                    <Badge variant='outline'>
                      <Layers3 className='mr-1 size-3.5' />
                      {property.units_count} units
                    </Badge>
                  )}

                  <Badge
                    variant={statusStyles(
                      property.is_available ? 'vacant' : 'occupied'
                    )}
                  >
                    {property.is_available ? 'Vacant' : 'Occupied'}
                  </Badge>
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='p-3'>
                  <p className='text-xs text-muted-foreground'>Monthly rent</p>
                  <p className='mt-1 text-base font-semibold'>
                    {property.rent_price
                      ? `${currency(property.rent_price, 'pt-BR', 'BRL')}`
                      : '—'}
                  </p>
                </div>

                <div className='p-3'>
                  <p className='text-xs text-muted-foreground'>Sale price</p>
                  <p className='mt-1 text-base font-semibold'>
                    {property.sale_price
                      ? currency(property.sale_price, 'pt-BR', 'BRL')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default PropertyItem
