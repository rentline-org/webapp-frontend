import { Bed, Bath, Ruler, DollarSign, Check, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import EditableItem from '@/components/editable-item'
import InlineText from '@/components/inline-text'
import type { IUnitData, IUpdateUnitInput } from '../types'
import { getUnitTypes } from '../types/constants'

type FieldUpdateHandler = (
  field: keyof IUpdateUnitInput,
  value: string | number | boolean | null
) => void

type Props = {
  unit: IUnitData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onFieldUpdate: FieldUpdateHandler
  onDelete: () => void
}

const unitTypeMap: Record<string, string> = {
  residential: '🏠 Residential',
  commercial: '🏢 Commercial',
  industrial: '🏭 Industrial',
  mixed_use: '🏗️ Mixed Use',
}

const formatPrice = (price: string | number | null | undefined): string => {
  if (price == null) return '—'
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

const formatSize = (size: string | number | null | undefined): string => {
  if (size == null) return '—'
  const num = typeof size === 'string' ? parseFloat(size) : size
  if (isNaN(num)) return '—'
  return `${num.toLocaleString('pt-BR')} ft²`
}

export default function UnitDetailsDrawer({
  unit,
  open,
  onOpenChange,
  onFieldUpdate,
  onDelete,
}: Props) {
  if (!unit) return null

  const displayUnitType = unitTypeMap[unit.unit_type] || unit.unit_type

  const isAvailable = unit.is_available
  const isFurnished = unit.is_furnished
  const isPetFriendly = unit.is_pet_friendly

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
      <DrawerContent className='flex flex-col data-[vaul-drawer-direction=right]:w-1/2 data-[vaul-drawer-direction=right]:max-w-none'>
        {/* Header */}
        <DrawerHeader className='border-b pb-4'>
          <div className='space-y-3'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0 flex-1'>
                <DrawerTitle className='text-2xl'>
                  <InlineText
                    value={unit.name}
                    editable
                    onSubmit={(v) => onFieldUpdate('name', v)}
                    className='!gap-2'
                  />
                </DrawerTitle>
              </div>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onOpenChange(false)}
              >
                ✕
              </Button>
            </div>

            {/* Status badges */}
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='outline' className='text-xs'>
                {displayUnitType}
              </Badge>

              {isAvailable ? (
                <Badge variant='default' className='gap-1 text-xs'>
                  <Check className='size-3' />
                  Available
                </Badge>
              ) : (
                <Badge variant='secondary' className='gap-1 text-xs'>
                  <AlertCircle className='size-3' />
                  Unavailable
                </Badge>
              )}

              {isFurnished && (
                <Badge variant='outline' className='text-xs'>
                  Furnished
                </Badge>
              )}

              {isPetFriendly && (
                <Badge variant='outline' className='text-xs'>
                  🐾 Pet Friendly
                </Badge>
              )}
            </div>
          </div>
        </DrawerHeader>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          <div className='space-y-8 p-6'>
            {/* Key Metrics Section */}
            <div>
              <h3 className='mb-4 text-sm font-semibold text-muted-foreground'>
                Unit Details
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                {/* Rent */}
                <div className='rounded-lg border border-border/50 bg-muted/30 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <DollarSign className='size-4 text-muted-foreground' />
                    <span className='text-xs font-medium text-muted-foreground'>
                      Monthly Rent
                    </span>
                  </div>
                  <EditableItem
                    label=''
                    value={
                      unit.rent_price == null ? null : Number(unit.rent_price)
                    }
                    kind='number'
                    isCurrency
                    editable
                    defaultContent={
                      <div className='text-lg font-semibold'>
                        {formatPrice(unit.rent_price)}
                      </div>
                    }
                    onSubmit={(v) => {
                      if (typeof v === 'number' || v === null) {
                        onFieldUpdate('rent_price', v)
                      }
                    }}
                  />
                </div>

                {/* Size */}
                <div className='rounded-lg border border-border/50 bg-muted/30 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Ruler className='size-4 text-muted-foreground' />
                    <span className='text-xs font-medium text-muted-foreground'>
                      Size
                    </span>
                  </div>
                  <EditableItem
                    label=''
                    value={
                      unit.square_feet == null ? null : Number(unit.square_feet)
                    }
                    kind='number'
                    editable
                    defaultContent={
                      <div className='text-lg font-semibold'>
                        {formatSize(unit.square_feet)}
                      </div>
                    }
                    onSubmit={(v) => {
                      if (typeof v === 'number' || v === null) {
                        onFieldUpdate('square_feet', v)
                      }
                    }}
                  />
                </div>

                {/* Bedrooms */}
                <div className='rounded-lg border border-border/50 bg-muted/30 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Bed className='size-4 text-muted-foreground' />
                    <span className='text-xs font-medium text-muted-foreground'>
                      Bedrooms
                    </span>
                  </div>
                  <EditableItem
                    label=''
                    value={unit.bedrooms ?? null}
                    kind='number'
                    editable
                    defaultContent={
                      <div className='text-lg font-semibold'>
                        {unit.bedrooms ?? '—'}
                      </div>
                    }
                    onSubmit={(v) => {
                      if (typeof v === 'number' || v === null) {
                        onFieldUpdate('bedrooms', v)
                      }
                    }}
                  />
                </div>

                {/* Bathrooms */}
                <div className='rounded-lg border border-border/50 bg-muted/30 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Bath className='size-4 text-muted-foreground' />
                    <span className='text-xs font-medium text-muted-foreground'>
                      Bathrooms
                    </span>
                  </div>
                  <EditableItem
                    label=''
                    value={unit.bathrooms ?? null}
                    kind='number'
                    editable
                    defaultContent={
                      <div className='text-lg font-semibold'>
                        {unit.bathrooms ?? '—'}
                      </div>
                    }
                    onSubmit={(v) => {
                      if (typeof v === 'number' || v === null) {
                        onFieldUpdate('bathrooms', v)
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Unit Type */}
            <EditableItem
              label='Unit Type'
              value={unit.unit_type}
              kind='select'
              editable
              options={getUnitTypes().map((t) => ({
                label: t.label ?? t.value,
                value: t.value,
              }))}
              onSubmit={(v) => {
                if (typeof v === 'string') {
                  onFieldUpdate('unit_type', v)
                }
              }}
            />

            {/* Description */}
            <div>
              <h3 className='mb-3 text-sm font-semibold text-muted-foreground'>
                Description
              </h3>
              <div className='group relative rounded-lg border border-border/50 bg-muted/20 p-4'>
                <InlineText
                  value={unit.description || ''}
                  editable
                  placeholder='Add a description...'
                  multiline
                  onSubmit={(v) => onFieldUpdate('description', v || null)}
                  textClassName='text-sm text-foreground/90'
                  inputClassName='text-sm'
                />
              </div>
            </div>

            {/* Availability Toggles */}
            <div>
              <h3 className='mb-3 text-sm font-semibold text-muted-foreground'>
                Features
              </h3>
              <div className='space-y-3'>
                <EditableItem
                  label='Available'
                  value={unit.is_available}
                  kind='checkbox'
                  editable
                  onSubmit={(v) => onFieldUpdate('is_available', Boolean(v))}
                />

                <EditableItem
                  label='Furnished'
                  value={unit.is_furnished}
                  kind='checkbox'
                  editable
                  onSubmit={(v) => onFieldUpdate('is_furnished', Boolean(v))}
                />

                <EditableItem
                  label='Pet Friendly'
                  value={unit.is_pet_friendly}
                  kind='checkbox'
                  editable
                  onSubmit={(v) => onFieldUpdate('is_pet_friendly', Boolean(v))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DrawerFooter className='border-t'>
          <div className='flex w-full gap-2'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='flex-1'
            >
              Close
            </Button>
            <Button variant='destructive' onClick={onDelete}>
              Delete
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
