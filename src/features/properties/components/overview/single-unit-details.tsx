import UnitInfoCard from '@/features/units/components/unit-info-card'
import { useUnitFieldUpdate } from '@/features/units/hooks/use-unit-field-update'
import type { useSingleUnit } from '../../hooks/use-single-unit'
import type { IProperty } from '../../types'

type SingleUnitDetailsProps = {
  property: IProperty
  unit: NonNullable<ReturnType<typeof useSingleUnit>['unit']>
}

const SingleUnitDetails = ({ property, unit }: SingleUnitDetailsProps) => {
  const { updateField } = useUnitFieldUpdate(property, unit)

  return <UnitInfoCard unit={unit} onFieldUpdate={updateField} />
}

export default SingleUnitDetails
