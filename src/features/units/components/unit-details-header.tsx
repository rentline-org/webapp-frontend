import { ChevronLeft, ImageIcon } from 'lucide-react'
import { cleanSnakecase } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import InlineText from '@/components/inline-text'
import type { IProperty } from '@/features/properties/types'
import type { IUnitData, IUpdateUnitInput } from '../types'

type UnitDetailsHeaderProps = {
  property: IProperty
  unit: IUnitData
  onFieldUpdate: (
    field: keyof IUpdateUnitInput,
    value: string | number | boolean | null
  ) => void
  onNavigateBack: () => void
}

const UnitDetailsHeader = ({
  property,
  unit,
  onFieldUpdate,
  onNavigateBack,
}: UnitDetailsHeaderProps) => {
  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
      <div className='space-y-4'>
        <Button
          variant='ghost'
          size='sm'
          className='w-fit px-0'
          onClick={onNavigateBack}
        >
          <ChevronLeft className='size-5' />
          Back to {property.title}
        </Button>

        <div className='flex items-start gap-4'>
          <div className='relative aspect-4/3 w-28 overflow-hidden rounded-2xl bg-secondary'>
            <Skeleton className='h-full w-full rounded-none bg-secondary' />
            <ImageIcon className='absolute inset-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground' />
          </div>

          <div className='max-w-4xl space-y-4'>
            <div className='w-full space-y-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <InlineText
                  className='text-2xl font-semibold tracking-tight sm:text-3xl'
                  value={unit.name}
                  onSubmit={(value) => onFieldUpdate('name', value)}
                  inputClassName='text-2xl! sm:text-3xl!'
                  editable
                />
              </div>

              <div className='w-full text-sm text-muted-foreground'>
                <InlineText
                  value={unit.description ?? ''}
                  editable
                  multiline
                  className='w-full'
                  textClassName='w-full text-sm text-muted-foreground'
                  inputClassName='w-full md:min-w-60 text-sm leading-6'
                  placeholder='Add a description'
                  onSubmit={(value) =>
                    onFieldUpdate('description', value || null)
                  }
                />
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='outline' className='capitalize'>
                {cleanSnakecase(unit.unit_type)}
              </Badge>

              <Badge variant='outline'>
                {unit.is_furnished ? 'Furnished' : 'Unfurnished'}
              </Badge>

              <Badge variant='outline'>
                {unit.is_pet_friendly ? 'Pet friendly' : 'No pets'}
              </Badge>

              <Badge variant={unit.is_available ? 'success' : 'secondary'}>
                {unit.is_available ? 'Available' : 'Occupied'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnitDetailsHeader
