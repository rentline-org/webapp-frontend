import { getRouteApi } from '@tanstack/react-router'
import { Image, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableRow, TableCell } from '@/components/ui/table'
import { currency } from '@/features/properties/utils'
import type { IUnitData } from '../types'

type Props = {
  unit: IUnitData
  onDelete?: () => void
}

const routeApi = getRouteApi('/_authenticated/properties/$propertySlug/')

export default function UnitTableRow({ unit, onDelete }: Props) {
  const navigate = routeApi.useNavigate()
  const handleViewUnit = () => {
    navigate({
      to: '/properties/$propertySlug/units/$unitSlug',
      params: {
        unitSlug: unit.slug,
      },
      search: {
        id: unit.id,
      },
    })
  }

  return (
    <TableRow className='group cursor-pointer' onClick={handleViewUnit}>
      <TableCell className='px-4 py-3'>
        <div className='relative aspect-4/3 w-20 overflow-hidden rounded-2xl bg-secondary'>
          {unit?.thumbnail?.url ? (
            <img
              src={unit.thumbnail.url}
              alt='Thumbnail'
              className='h-full w-full object-cover'
            />
          ) : (
            <>
              <div className='flex h-full w-full items-center justify-center'>
                {/* <ImagePlus className='h-5 w-5 text-muted-foreground' /> */}
                <Image className='h-5 w-5 text-muted-foreground' />
              </div>
            </>
          )}
        </div>
      </TableCell>
      <TableCell className='px-4 py-3'>
        <div className='flex items-center gap-2'>
          <div>
            <div className='text-sm font-medium'>{unit.name}</div>
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
      </TableCell>
    </TableRow>
  )
}
