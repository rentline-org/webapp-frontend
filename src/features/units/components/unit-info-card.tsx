import {
  Bath,
  BedDouble,
  CircleDollarSign,
  Dog,
  Ruler,
  Settings2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { formatMoney } from '@/lib/countries'
import EditableItem from '@/components/editable-item'
import type { IUnitData, IUpdateUnitInput } from '../types'

type EditableValue = string | number | boolean | Date | null

type UnitInfoCardProps = {
  unit: IUnitData
  onFieldUpdate: (field: keyof IUpdateUnitInput, value: EditableValue) => void
}

/**
 * Shared unit details grid used by both single-unit property overview
 * and the individual unit details page.
 */
const UnitInfoCard = ({ unit, onFieldUpdate }: UnitInfoCardProps) => {
  const { user } = useAuthStore((s) => s.auth)

  const items = [
    {
      label: 'Rent Value',
      kind: 'number' as const,
      icon: <CircleDollarSign />,
      value: unit.rent_price ?? 0,
      defaultContent: unit.rent_price
        ? formatMoney(
            unit.rent_price,
            user?.active_organization.country ?? 'US'
          )
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
        ? formatMoney(
            unit.sale_price,
            user?.active_organization.country ?? 'US'
          )
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
          onSubmit={(value) => onFieldUpdate(item.field, value)}
        />
      ))}
    </div>
  )
}

export default UnitInfoCard
