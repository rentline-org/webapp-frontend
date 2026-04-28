'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Field } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

function formatDate(date: Date | undefined) {
  if (!date) return ''

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) return false
  return !isNaN(date.getTime())
}

type Props = {
  value?: Date
  onChange?: (date?: Date) => void
  label?: string
  placeholder?: string
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'June 01, 2025',
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date | undefined>(value)
  const [inputValue, setInputValue] = React.useState(formatDate(value))

  // sync external value → internal input
  React.useEffect(() => {
    setInputValue(formatDate(value))
    setMonth(value)
  }, [value])

  return (
    <Field>
      <InputGroup>
        <InputGroupInput
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value
            setInputValue(raw)

            const parsed = new Date(raw)
            if (isValidDate(parsed)) {
              onChange?.(parsed)
              setMonth(parsed)
            } else {
              onChange?.(undefined)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />

        <InputGroupAddon align='inline-end'>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                variant='ghost'
                size='icon-xs'
                aria-label='Select date'
              >
                <CalendarIcon />
                <span className='sr-only'>Select date</span>
              </InputGroupButton>
            </PopoverTrigger>

            <PopoverContent
              className='w-auto overflow-hidden p-0'
              align='end'
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode='single'
                selected={value}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  onChange?.(date)
                  setInputValue(formatDate(date))
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
