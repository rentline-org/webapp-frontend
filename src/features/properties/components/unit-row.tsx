import { Badge } from '@/components/ui/badge'
import type { IUnitData } from '../types'
import { currency } from '../utils'
import DetailRow from './detail-row'

function UnitRow({ unit }: { unit: IUnitData }) {
  return (
    <div className='rounded-2xl border bg-muted/20 p-4'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='text-sm font-semibold'>{unit.name}</h3>
            <Badge
              variant={unit.is_available ? 'success' : 'warning'}
              className='rounded-full capitalize'
            >
              {unit.is_available ? 'Vacant' : 'Occupied'}
            </Badge>
            <Badge variant='outline' className='rounded-full capitalize'>
              {unit.unit_type}
            </Badge>
          </div>

          <p className='text-sm text-muted-foreground'>
            {unit.description ?? 'No description added yet.'}
          </p>
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:min-w-[360px]'>
          <DetailRow
            label='Rent'
            value={currency(Number(unit.rent_price ?? null))}
          />
          <DetailRow
            label='Sale'
            value={currency(Number(unit.sale_price ?? null))}
          />
          <DetailRow label='Bedrooms' value={String(unit.bedrooms ?? '—')} />
          <DetailRow label='Bathrooms' value={String(unit.bathrooms ?? '—')} />
          <DetailRow
            label='Size'
            value={unit.square_feet ? `${unit.square_feet} ft²` : '—'}
          />
          <DetailRow
            label='Pet friendly'
            value={unit.is_pet_friendly ? 'Yes' : 'No'}
          />
        </div>
      </div>
    </div>
  )
}

export default UnitRow
