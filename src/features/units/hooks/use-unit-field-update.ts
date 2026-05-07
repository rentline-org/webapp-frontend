import { useCallback } from 'react'
import type { IProperty } from '@/features/properties/types'
import { useUpdateUnit } from '../query'
import type { IUnitData, IUpdateUnitInput } from '../types'

type EditableValue = string | number | boolean | Date | null

type UnitField = keyof IUpdateUnitInput

const NUMERIC_FIELDS: UnitField[] = [
  'rent_price',
  'sale_price',
  'bedrooms',
  'bathrooms',
  'square_feet',
]

function normalizeValue(
  field: UnitField,
  value: EditableValue
): string | number | boolean | null {
  if (value instanceof Date) return value.toISOString()

  if (NUMERIC_FIELDS.includes(field)) {
    return value === null ? null : Number(value)
  }

  if (typeof value === 'boolean') return value

  return value
}

/**
 * Hook that wraps the unit update mutation with field-level normalization.
 * Must only be called when property and unit are available (non-null).
 */
export function useUnitFieldUpdate(property: IProperty, unit: IUnitData) {
  const { mutate: updateUnit } = useUpdateUnit(property)

  const updateField = useCallback(
    (field: UnitField, value: EditableValue) => {
      const normalized = normalizeValue(field, value)

      updateUnit({
        unitId: unit.id,
        payload: { [field]: normalized } as IUpdateUnitInput,
      })
    },
    [unit, updateUnit]
  )

  return { updateField }
}
