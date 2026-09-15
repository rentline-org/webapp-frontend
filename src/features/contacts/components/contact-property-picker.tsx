import { Building2, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { IProperty } from '@/features/properties/types'

type ContactPropertyPickerProps = {
  properties: IProperty[]
  selectedIds: number[]
  onChange: (propertyIds: number[]) => void
  disabled?: boolean
  isLoading?: boolean
}

export function ContactPropertyPicker({
  properties,
  selectedIds,
  onChange,
  disabled,
  isLoading,
}: ContactPropertyPickerProps) {
  const selectedProperties = properties.filter((property) =>
    selectedIds.includes(property.id)
  )

  const toggleProperty = (propertyId: number) => {
    onChange(
      selectedIds.includes(propertyId)
        ? selectedIds.filter((id) => id !== propertyId)
        : [...selectedIds, propertyId]
    )
  }

  const label = (() => {
    if (isLoading) return 'Loading properties…'
    if (selectedProperties.length === 0) return 'Select properties'
    if (selectedProperties.length === 1) return selectedProperties[0].title

    return `${selectedProperties.length} properties selected`
  })()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          disabled={disabled || isLoading}
          className='w-full justify-between font-normal'
        >
          <span className='flex min-w-0 items-center gap-2 truncate'>
            <Building2 className='size-4 shrink-0 text-muted-foreground' />
            <span className='truncate'>{label}</span>
          </span>
          <ChevronsUpDown className='size-4 shrink-0 text-muted-foreground' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        className='w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] min-w-0 p-0'
      >
        <Command>
          <CommandInput placeholder='Search properties…' />
          <CommandList className='max-h-64'>
            <CommandEmpty>No properties found.</CommandEmpty>
            <CommandGroup>
              {properties.map((property) => {
                const isSelected = selectedIds.includes(property.id)

                return (
                  <CommandItem
                    key={property.id}
                    value={`${property.id} ${property.title} ${property.address}`}
                    onSelect={() => toggleProperty(property.id)}
                    className='items-start gap-3'
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'text-transparent'
                      )}
                    >
                      <Check className='size-3' />
                    </span>
                    <span className='min-w-0'>
                      <span className='block truncate text-sm font-medium'>
                        {property.title}
                      </span>
                      <span className='block truncate text-xs text-muted-foreground'>
                        {property.address}
                      </span>
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
