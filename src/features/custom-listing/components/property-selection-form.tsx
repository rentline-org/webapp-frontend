import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useGetProperties } from '@/features/properties/query'
import type { IProperty } from '@/features/properties/types'
import { useSingleUnit } from '@/features/properties/hooks/use-single-unit'

function PropertySelectionForm({
  selectedIds,
  onSelect,
  onBack,
}: {
  selectedIds: number[]
  onSelect: (propertyIds: number[]) => void
  onBack: () => void
}) {
  const { data: properties, isLoading, isError, error } = useGetProperties()

  const [value, setValue] = useState<number[]>(selectedIds)

  const toggleProperty = (propertyId: number) => {
    setValue((current) =>
      current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId]
    )
  }

  return (
    <motion.div
      key='properties-screen'
      className='flex h-full flex-col'
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 48, opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className='border-b px-4 py-4 sm:px-6 sm:py-5'>
        <div className='flex flex-col items-start gap-4'>
          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={onBack}
          >
            <ArrowLeft className='h-4 w-4' />
            Back
          </Button>
          <div>
            <div className='mb-2 flex items-center gap-2 text-sm font-medium tracking-wide text-foreground'>
              <Building2 className='h-4 w-4' />
              Properties
            </div>
            <p className='mt-1 text-sm text-muted-foreground'>
              Select one or more properties to be visible on your website
            </p>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5'>
        {isLoading ? (
          <PropertyPickerSkeleton />
        ) : isError ? (
          <div className='rounded-xl border border-dashed p-4 text-sm text-muted-foreground'>
            {error instanceof Error
              ? error.message
              : 'Could not load properties.'}
            <div className='mt-3'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </div>
          </div>
        ) : properties?.length === 0 ? (
          <div className='rounded-xl border border-dashed p-6 text-center'>
            <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
              <Building2 className='h-5 w-5 text-muted-foreground' />
            </div>
            <h4 className='text-sm font-medium text-foreground'>
              No properties found
            </h4>
            <p className='mt-1 text-sm text-muted-foreground'>
              Create a property first, then come back here to connect it.
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {properties?.map((property) => {
              const selected = value.includes(property.id)

              return (
                <button
                  key={property.id}
                  type='button'
                  onClick={() => toggleProperty(property.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-3 text-left',
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <PropertyThumbnail property={property} />

                  <div className='min-w-0 flex-1'>
                    <div className='truncate text-sm font-medium text-foreground'>
                      {property.title}
                    </div>
                    <div className='mt-1 text-xs text-muted-foreground'>
                      {formatPropertyUnits(property.units_count)}
                    </div>
                  </div>

                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleProperty(property.id)}
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className='border-t px-4 py-4 sm:px-6'>
        <Button
          className='w-full gap-2 sm:w-auto'
          disabled={!value.length}
          onClick={() => onSelect(value)}
        >
          <CheckCircle2 className='h-4 w-4' />
          Use properties
        </Button>
      </div>
    </motion.div>
  )
}

function PropertyPickerSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className='flex items-center gap-3 rounded-xl border p-3'
        >
          <Skeleton className='h-14 w-14 rounded-xl' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-4 w-44' />
            <Skeleton className='h-3 w-24' />
          </div>
          <Skeleton className='h-5 w-5 rounded-full' />
        </div>
      ))}
    </div>
  )
}

function formatPropertyUnits(count?: number | null) {
  if (typeof count !== 'number') return '—'
  return `${count} ${count === 1 ? 'unit' : 'units'}`
}

function PropertyThumbnail({ property }: { property: IProperty }) {
  const { isSingleUnit, unit } = useSingleUnit(property)

  const thumbnailUrl = isSingleUnit
    ? unit?.thumbnail?.url
    : property?.thumbnail?.url

  if (!thumbnailUrl) {
    return <Skeleton className='h-14 w-14 rounded-xl' />
  }

  return (
    <Avatar className='h-14 w-14 rounded-xl'>
      <AvatarImage
        src={thumbnailUrl}
        alt={property.title}
        className='object-cover'
      />
      <AvatarFallback className='rounded-xl'>
        {property.title.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  )
}

export default PropertySelectionForm
