// import UnitsTable from '@/features/units/components/units-table'
import UnitsTable from '@/features/units/components/units-table'
import type { IProperty } from '../types'

function UnitsTab({ property }: { property: IProperty }) {
  return <UnitsTable property={property} />
}

export default UnitsTab
