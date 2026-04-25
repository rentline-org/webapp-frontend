'use client'

import { useState } from 'react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import type { CountryOption } from '@/lib/countries'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Props = {
  value?: string
  onChange: (value: string) => void
  options: CountryOption[]
  placeholder?: string
  disabled?: boolean
}

export function CountryCombobox({
  value,
  onChange,
  options,
  placeholder = 'Select country',
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)

  const selected = options.find((opt) => opt.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          disabled={disabled}
          aria-expanded={open}
          className='w-full justify-between px-3 font-normal'
        >
          {selected ? (
            <span className='flex items-center gap-2 truncate'>
              {selected.flag && (
                <img
                  src={selected.flag}
                  alt={selected.label}
                  className='h-4 w-5 rounded-sm'
                />
              )}
              <span className='truncate'>{selected.label}</span>
            </span>
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}

          <ChevronDownIcon className='ml-2 h-4 w-4 opacity-70' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='w-full min-w-(--radix-popper-anchor-width) p-0'
        align='start'
      >
        <Command>
          <CommandInput placeholder='Search country...' />

          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>

            {options.map((country) => (
              <CommandItem
                key={country.value}
                value={country.label}
                onSelect={() => {
                  onChange(country.value) // ISO code (BR, DE, etc)
                  setOpen(false)
                }}
              >
                {country.flag && (
                  <img
                    src={country.flag}
                    alt={country.label}
                    className='mr-2 h-4 w-5 rounded-sm'
                  />
                )}

                <span className='flex-1'>{country.label}</span>

                {value === country.value && (
                  <CheckIcon className='ml-auto h-4 w-4' />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
