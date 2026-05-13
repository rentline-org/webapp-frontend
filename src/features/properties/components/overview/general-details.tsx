import { useQueryClient } from '@tanstack/react-query'
import { Building2, Layers3, MapPin } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import EditableItem from '@/components/editable-item'
import { useSingleUnit } from '../../hooks/use-single-unit'
import { useUpdateProperty } from '../../query'
import type { IProperty, IUpdatePropertyInput } from '../../types'
import SingleUnitDetails from './single-unit-details'

type Props = {
  property: IProperty
}

const GeneralDetails = ({ property }: Props) => {
  const { isSingleUnit, unit } = useSingleUnit(property)
  const queryClient = useQueryClient()
  const { mutate } = useUpdateProperty(queryClient, property.slug)

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
          {property.property_type === 'multi_unit' && (
            <EditableItem
              label='Units'
              kind='number'
              value={property.units_count ?? null}
              icon={<Layers3 className='size-4' />}
              editable={false}
            />
          )}
        </div>

        {isSingleUnit && unit && (
          <SingleUnitDetails property={property} unit={unit} />
        )}

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
      </CardContent>
    </Card>
  )
}

export default GeneralDetails
