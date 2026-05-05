import {
  Bath,
  BedDouble,
  CircleDollarSign,
  Dog,
  Ruler,
  Settings2,
} from 'lucide-react'
import EditableItem from '@/components/editable-item'
import { useUpdateUnit } from '@/features/units/query'
import type { useSingleUnit } from '../../hooks/use-single-unit'
import type { IProperty } from '../../types'
import { currency } from '../../utils'

type SingleUnitDetailsProps = {
  property: IProperty
  unit: NonNullable<ReturnType<typeof useSingleUnit>['unit']>
}

type UnitField =
  | 'rent_price'
  | 'sale_price'
  | 'is_furnished'
  | 'is_pet_friendly'
  | 'bedrooms'
  | 'bathrooms'
  | 'square_feet'

type EditableValue = string | number | boolean | Date | null

const SingleUnitDetails = ({ property, unit }: SingleUnitDetailsProps) => {
  const { mutate: updateUnit } = useUpdateUnit(property)

  const updateField = (field: UnitField, value: EditableValue) => {
    let normalized: string | number | boolean | null

    if (value instanceof Date) {
      normalized = value.toISOString()
    } else {
      normalized = value
    }

    updateUnit({
      unitId: unit.id,
      payload: {
        [field]:
          field === 'rent_price' ||
          field === 'sale_price' ||
          field === 'bedrooms' ||
          field === 'bathrooms' ||
          field === 'square_feet'
            ? normalized === null
              ? null
              : Number(normalized)
            : typeof normalized === 'boolean'
              ? normalized
              : normalized,
      } as never,
    })
  }

  const items = [
    {
      label: 'Rent Value',
      kind: 'number' as const,
      icon: <CircleDollarSign />,
      value: unit.rent_price ?? 0,
      defaultContent: unit.rent_price
        ? currency(unit.rent_price, 'pt-BR', 'BRL')
        : '-',
      field: 'rent_price' as const,
      isCurrency: true,
    },
    {
      label: 'Sale Value',
      kind: 'number' as const,
      icon: undefined,
      value: unit.sale_price ?? 0,
      defaultContent: unit.sale_price
        ? currency(unit.sale_price, 'pt-BR', 'BRL')
        : '-',
      field: 'sale_price' as const,
      isCurrency: true,
    },
    {
      label: 'Furnished',
      kind: 'checkbox' as const,
      icon: <Settings2 className='size-4' />,
      value: unit.is_furnished ?? false,
      field: 'is_furnished' as const,
    },
    {
      label: 'Pet Friendly',
      kind: 'checkbox' as const,
      icon: <Dog className='size-4' />,
      value: unit.is_pet_friendly ?? false,
      field: 'is_pet_friendly' as const,
    },
    {
      label: 'Bedrooms',
      kind: 'number' as const,
      icon: <BedDouble className='size-4' />,
      value: unit.bedrooms ?? null,
      field: 'bedrooms' as const,
    },
    {
      label: 'Bathrooms',
      kind: 'number' as const,
      icon: <Bath className='size-4' />,
      value: unit.bathrooms ?? null,
      field: 'bathrooms' as const,
    },
    {
      label: 'Size',
      kind: 'number' as const,
      icon: <Ruler className='size-4' />,
      value: unit.square_feet ?? null,
      field: 'square_feet' as const,
    },
  ]

  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      {items.map((item) => (
        <EditableItem
          key={item.field}
          label={item.label}
          kind={item.kind}
          icon={item.icon}
          value={item.value}
          editable
          isCurrency={item.isCurrency}
          defaultContent={item.defaultContent}
          onSubmit={(value) => updateField(item.field, value)}
        />
      ))}
    </div>
  )
}

export default SingleUnitDetails
