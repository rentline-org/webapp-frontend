import { useQueryClient } from '@tanstack/react-query'
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CircleDollarSign,
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
import type { IProperty, IUpdatePropertyInput } from '../../types'
import { currency, formatDate } from '../../utils'

type Props = {
  property: IProperty
}

const GeneralDetails = ({ property }: Props) => {
  const queryClient = useQueryClient()
  const { mutate } = useUpdateProperty(queryClient)

  const updateProperty = (payload: IUpdatePropertyInput) => {
    mutate({ payload: payload as never, property })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property details</CardTitle>
        <CardDescription>General information for this listing.</CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='grid gap-3 md:grid-cols-2'>
          {/* {property.rent_price && ( */}
          <EditableItem
            label='Rent Value'
            kind='number'
            icon={<CircleDollarSign />}
            value={property.rent_price ?? 0}
            editable
            isCurrency
            defaultContent={
              property.rent_price
                ? currency(property.rent_price, 'pt-BR', 'BRL')
                : '-'
            }
            onSubmit={(value) =>
              updateProperty({
                rent_price: value as number,
              })
            }
          />
          {/* )} */}
          <EditableItem
            label='Sale Value'
            kind='number'
            value={property.sale_price ?? 0}
            editable
            isCurrency
            defaultContent={
              property.sale_price
                ? currency(property.sale_price ?? 0, 'pt-BR', 'BRL')
                : '-'
            }
            onSubmit={(value) =>
              updateProperty({
                sale_price: value as number,
              })
            }
          />
        </div>
        <Separator />
        <div className='grid gap-3 sm:grid-cols-2'>
          <EditableItem
            label='Address'
            kind='text'
            value={property.address}
            editable
            icon={<MapPin className='size-4' />}
            onSubmit={(value) => updateProperty({ address: value as string })}
          />

          <EditableItem
            label='City'
            kind='text'
            value={property.city}
            editable
            icon={<Building2 className='size-4' />}
            onSubmit={(value) => updateProperty({ city: value as string })}
          />

          <EditableItem
            label='State'
            kind='text'
            value={property.state as string}
            editable
            onSubmit={(value) => updateProperty({ state: value as string })}
          />

          <EditableItem
            label='Postal code'
            kind='text'
            value={property.postal_code}
            editable
            onSubmit={(value) =>
              updateProperty({ postal_code: value as string })
            }
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
            onSubmit={(value) =>
              updateProperty({ available_from: value as Date })
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default GeneralDetails
