import { useQueryClient } from '@tanstack/react-query'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import EditableItem from '@/components/editable-item'
import { useUpdateProperty } from '../../query'
import type { IProperty } from '../../types'
import { formatDate } from '../../utils'

type Props = {
  property: IProperty
}

const GeneralDetails = ({ property }: Props) => {
  const queryClient = useQueryClient()
  const { mutate } = useUpdateProperty(queryClient)

  const updateProperty = (payload: Record<string, unknown>) => {
    mutate({ payload: payload as never, property })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property details</CardTitle>
        <CardDescription>General information for this listing.</CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='grid gap-3 sm:grid-cols-2'>
          <EditableItem
            label='Address'
            kind='text'
            value={property.address}
            editable
            icon={<MapPin className='size-4' />}
            onSubmit={(value) => updateProperty({ address: value })}
          />

          <EditableItem
            label='City'
            kind='text'
            value={property.city}
            editable
            icon={<Building2 className='size-4' />}
            onSubmit={(value) => updateProperty({ city: value })}
          />

          <EditableItem
            label='State'
            kind='text'
            value={property.state as string}
            editable
            onSubmit={(value) => updateProperty({ state: value })}
          />

          <EditableItem
            label='Postal code'
            kind='text'
            value={property.postal_code}
            editable
            onSubmit={(value) => updateProperty({ postal_code: value })}
          />
        </div>

        <Separator />

        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          <EditableItem
            label='Furnished'
            kind='checkbox'
            value={property.is_furnished}
            editable
            icon={<Settings2 className='size-4' />}
            onSubmit={(value) =>
              updateProperty({ is_furnished: Boolean(value) })
            }
          />

          <EditableItem
            label='Bedrooms'
            kind='number'
            value={property.bedrooms ?? null}
            editable
            icon={<BedDouble className='size-4' />}
            onSubmit={(value) =>
              updateProperty({
                bedrooms: value === null ? null : Number(value),
              })
            }
          />

          <EditableItem
            label='Bathrooms'
            kind='number'
            value={property.bathrooms ?? null}
            editable
            icon={<Bath className='size-4' />}
            onSubmit={(value) =>
              updateProperty({
                bathrooms: value === null ? null : Number(value),
              })
            }
          />

          <EditableItem
            label='Size'
            kind='number'
            value={property.square_feet ?? null}
            editable
            icon={<Ruler className='size-4' />}
            onSubmit={(value) =>
              updateProperty({
                square_feet: value === null ? null : Number(value),
              })
            }
          />

          {property.property_type === 'apartment' && (
            <EditableItem
              label='Units'
              kind='number'
              value={property.units_count ?? null}
              icon={<Layers3 className='size-4' />}
              onSubmit={(value) =>
                updateProperty({
                  units_count: value === null ? null : Number(value),
                })
              }
              editable={false}
            />
          )}

          <EditableItem
            label='Available from'
            kind='date'
            value={property.available_from ?? null}
            editable
            defaultContent={<span>{formatDate(property.available_from)}</span>}
            icon={<CalendarDays className='size-4' />}
            onSubmit={(value) => updateProperty({ available_from: value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default GeneralDetails
