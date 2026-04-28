import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { IProperty } from '../types'
import ModulePlaceholder from './module-placeholder'
import UnitRow from './unit-row'

function UnitsTab({ property }: { property: IProperty }) {
  const units = property.units ?? []

  if (!units.length) {
    return (
      <ModulePlaceholder
        title='Units'
        description='Units for this property will appear here once they are loaded.'
        items={[
          { label: 'Units count', value: String(property.units_count ?? '—') },
          { label: 'Property type', value: property.property_type },
          {
            label: 'Availability',
            value: property.is_available ? 'Vacant' : 'Occupied',
          },
        ]}
      />
    )
  }

  return (
    <Card className='overflow-hidden rounded-3xl border bg-card shadow-sm'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Units</h2>
            <p className='text-sm text-muted-foreground'>
              {units.length} unit{units.length === 1 ? '' : 's'} linked to this
              property.
            </p>
          </div>

          <Badge variant='outline' className='rounded-full px-3 py-1'>
            {units.length} total
          </Badge>
        </div>

        <div className='mt-6 space-y-3'>
          {units.map((unit) => (
            <UnitRow key={unit.id} unit={unit} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default UnitsTab
