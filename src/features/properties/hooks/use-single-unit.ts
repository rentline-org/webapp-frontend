import { useMemo } from 'react'
import type { IUnitData } from '@/features/units/types'
import type { IProperty } from '../types'
import { PROPERTY_TYPES } from '../utils/constants'

export function useSingleUnit(property?: IProperty | null) {
  const isSingleUnit = property?.property_type === PROPERTY_TYPES.SINGLE_UNIT

  const unit = useMemo<IUnitData | null>(() => {
    if (!property || !isSingleUnit) return null
    return property.units?.[0] ?? null
  }, [property, isSingleUnit])

  return {
    isSingleUnit,
    unit,
    hasUnit: !!unit,
    isReady: !!property,
  }
}
