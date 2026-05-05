// import { useNavigate } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
// import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableRow, TableCell } from '@/components/ui/table'
import { currency } from '@/features/properties/utils'
import type { IUnitData } from '../types'

type Props = {
  unit: IUnitData
  propertySlug: string
  onDelete?: () => void
}

export default function UnitTableRow({ unit, onDelete }: Props) {
  // const navigate = useNavigate()

  return (
    <TableRow
      // onClick={() => {
      //   navigate({
      //     to: '/properties/$propertySlug/units/$unitId',
      //     params: { propertySlug, unitId: String(unit.id) },
      //   })
      // }}
      className='cursor-pointer'
    >
      <TableCell className='px-4 py-3'>
        <div className='flex items-center gap-2'>
          <div>
            <div className='text-sm font-medium'>{unit.name}</div>
            <div className='text-xs text-muted-foreground'>
              {unit.description ?? '—'}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className='px-4 py-3 capitalize'>{unit.unit_type}</TableCell>

      <TableCell className='px-4 py-3'>
        {unit.rent_price
          ? currency(Number(unit.rent_price), 'pt-BR', 'BRL')
          : '—'}
      </TableCell>

      <TableCell className='px-4 py-3'>{unit.bedrooms ?? '—'}</TableCell>

      <TableCell className='px-4 py-3'>{unit.bathrooms ?? '—'}</TableCell>

      <TableCell className='px-4 py-3'>
        <div className='flex items-center gap-2'>
          {/* <Badge
            variant={unit.is_available ? 'success' : 'warning'}
            className='rounded-full capitalize'
          >
            {unit.is_available ? 'Vacant' : 'Occupied'}
          </Badge> */}
          <Button
            size='icon'
            variant='destructive'
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
