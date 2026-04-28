// import { Popover, Checkbox } from "radix-ui";
import { useForm } from 'react-hook-form'
// import { PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { ChevronDown } from 'lucide-react'
import { TCreatePropertySchema } from '@/features/properties/types'
import { Button } from './button'
import { Checkbox } from './checkbox'
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormControl,
  FormMessage,
} from './form'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export function MultiSelectField({
  name,
  label,
  description,
  options,
  placeholder,
  form,
}: {
  name: 'amenities' | 'sale_types'
  label: string
  description?: string
  options: readonly { label: string; value: string }[]
  placeholder: string
  form: ReturnType<typeof useForm<TCreatePropertySchema>>
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selected = (field.value ?? []) as string[]
        const selectedLabels = options
          .filter((option) => selected.includes(option.value))
          .map((option) => option.label)

        const toggle = (value: string) => {
          const next = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value]

          field.onChange(next)
        }

        return (
          <FormItem className='grid w-full gap-2'>
            <FormLabel>{label}</FormLabel>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full justify-between font-normal'
                  >
                    <span className='truncate text-left'>
                      {selectedLabels.length
                        ? `${selectedLabels.slice(0, 2).join(', ')}${
                            selectedLabels.length > 2
                              ? ` +${selectedLabels.length - 2}`
                              : ''
                          }`
                        : placeholder}
                    </span>
                    <ChevronDown className='ml-2 size-4 shrink-0 opacity-50' />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className='w-80 p-3' align='start'>
                <div className='mb-3 flex items-center justify-between gap-3'>
                  <p className='text-sm font-medium'>{label}</p>
                  {selected.length ? (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-8 px-2'
                      onClick={() => field.onChange([])}
                    >
                      Clear
                    </Button>
                  ) : null}
                </div>

                <div className='max-h-64 space-y-2 overflow-y-auto pr-1'>
                  {options.map((option) => {
                    const checked = selected.includes(option.value)

                    return (
                      <label
                        key={option.value}
                        className='flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted'
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(option.value)}
                        />
                        <span className='text-sm'>{option.label}</span>
                      </label>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
