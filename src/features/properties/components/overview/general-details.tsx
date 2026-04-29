import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Layers3,
  MapPin,
  Ruler,
  Settings2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { IProperty } from '../../types'
import { formatDate } from '../../utils'
import DetailRow from '../detail-row'

type Props = {
  property: IProperty
}

const GeneralDetails = ({ property }: Props) => {
  return (
    <Card className='overflow-hidden rounded-3xl border bg-card shadow-sm'>
      <CardContent className='space-y-6 p-6'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Property details</h2>
            <p className='text-sm text-muted-foreground'>
              General information for this listing.
            </p>
          </div>
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          <DetailRow
            label='Address'
            value={property.address}
            icon={<MapPin className='size-4' />}
            editable
          />
          <DetailRow
            label='City'
            value={property.city}
            icon={<Building2 className='size-4' />}
            editable
          />
          <DetailRow label='State' value={property.state ?? '—'} editable />
          <DetailRow
            label='Postal code'
            value={property.postal_code}
            editable
          />
        </div>

        <Separator />

        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          <DetailRow
            label='Furnished'
            value={property.is_furnished ? 'Yes' : 'No'}
            icon={<Settings2 className='size-4' />}
          />

          <DetailRow
            label='Bedrooms'
            value={String(property.bedrooms ?? '—')}
            icon={<BedDouble className='size-4' />}
          />
          <DetailRow
            label='Bathrooms'
            value={String(property.bathrooms ?? '—')}
            icon={<Bath className='size-4' />}
          />
          <DetailRow
            label='Size'
            value={property.square_feet ? `${property.square_feet} ft²` : '—'}
            icon={<Ruler className='size-4' />}
          />
          {property.property_type === 'apartment' && property?.units_count && (
            <DetailRow
              label='Units'
              value={property.units_count?.toFixed(2)}
              icon={<Layers3 className='size-4' />}
            />
          )}
          <DetailRow
            label='Available from'
            value={formatDate(property.available_from)}
            icon={<CalendarDays className='size-4' />}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default GeneralDetails
