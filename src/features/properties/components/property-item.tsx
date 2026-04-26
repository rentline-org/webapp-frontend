import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Property } from '../types'
import { currency, occupancyLabel, statusStyles, typeIcon } from '../utils'

type PropertyCardProps = {
  property: Property
}

const PropertyItem = ({ property }: PropertyCardProps) => {
  return (
    <Link
      to='/properties'
      params={{ id: String(property.id) }}
      className='block'
    >
      <Card className='h-full overflow-hidden rounded-3xl border bg-background p-0 shadow-sm transition-shadow hover:shadow-md'>
        <CardContent className='h-full p-0 hover:bg-secondary'>
          <div className='grid min-h-55 grid-cols-1 md:grid-cols-[180px_1fr]'>
            <div className='relative min-h-48 border-b md:min-h-55 md:border-r md:border-b-0'>
              <img
                src={property.image}
                alt={property.name}
                className='h-full w-full object-cover'
              />
              <div className='absolute inset-0 bg-linear-to-t from-black/20 to-transparent' />
            </div>

            <div className='flex flex-col justify-between gap-5 p-4 sm:p-5'>
              <div className='space-y-2'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0'>
                    <h2 className='text-lg leading-tight font-semibold break-words'>
                      {property.name}
                    </h2>
                    <p className='text-sm break-words text-muted-foreground'>
                      {property.address}
                    </p>
                  </div>

                  <Badge
                    variant={statusStyles(property.status)}
                    className='self-start'
                  >
                    {property.status}
                  </Badge>
                </div>

                <div className='flex flex-wrap gap-2 pt-2'>
                  <div className='inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm'>
                    {typeIcon(property.type)}
                    <span className='capitalize'>{property.type}</span>
                  </div>

                  <div className='inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm'>
                    <span>{property.units} units</span>
                  </div>
                </div>
              </div>

              <div className='mt-2 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-end sm:justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Monthly rent</p>
                  <p className='text-lg font-semibold sm:text-xl'>
                    {currency(property.monthlyRent)}
                    <span className='text-sm font-normal text-muted-foreground'>
                      /mo
                    </span>
                  </p>
                </div>

                <Badge variant='default' className='self-start sm:self-auto'>
                  {occupancyLabel(property.occupancy)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default PropertyItem
