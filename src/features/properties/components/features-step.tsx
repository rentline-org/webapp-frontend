import { type UseFormReturn } from 'react-hook-form'
import { Zap } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePickerInput } from '@/components/ui/datepicker-input'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import InputWithEndButtons from '@/components/ui/input-number'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { TCreatePropertySchema } from '../types'
import { AMENITY_OPTIONS, SALE_TYPE_OPTIONS } from '../utils/constants'

interface FeaturesStepProps {
  form: UseFormReturn<TCreatePropertySchema>
  isApartment: boolean
  isLand: boolean
  isAvailable: boolean
}

function NumberField({
  form,
  name,
  label,
}: {
  form: UseFormReturn<TCreatePropertySchema>
  name: 'square_feet' | 'bedrooms' | 'bathrooms'
  label: string
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <InputWithEndButtons
              minValue={0}
              step={1}
              value={field.value ?? 1}
              onChange={(e) => field.onChange(e)}
              onBlur={field.onBlur}
              name={field.name}
              locale='pt-BR'
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function MultiSelectField({
  form,
  name,
  label,
  options,
  placeholder,
  description,
}: {
  form: UseFormReturn<TCreatePropertySchema>
  name: 'amenities' | 'sale_types'
  label: string
  options: readonly { label: string; value: string }[]
  placeholder: string
  description?: string
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
          field.onChange(
            selected.includes(value)
              ? selected.filter((item) => item !== value)
              : [...selected, value]
          )
        }

        return (
          <FormItem className='grid gap-2'>
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
                    <ChevronRight className='ml-2 size-4 shrink-0 opacity-50' />
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

export const FeaturesStep = ({
  form,
  isApartment,
  isLand,
  isAvailable,
}: FeaturesStepProps) => {
  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-2'>
        <Zap className='size-5 text-muted-foreground' />
        <h3 className='text-lg font-semibold'>Features & characteristics</h3>
      </div>

      {/* Basic Features */}
      <div className='space-y-4'>
        <div>
          <h4 className='font-medium'>Property dimensions</h4>
          <p className='text-sm text-muted-foreground'>
            Specify the size and layout of the property.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <NumberField form={form} name='square_feet' label='Square feet' />

          {!isApartment && !isLand && (
            <>
              <NumberField form={form} name='bedrooms' label='Bedrooms' />
              <NumberField form={form} name='bathrooms' label='Bathrooms' />
            </>
          )}
        </div>

        {(isApartment || isLand) && (
          <div className='rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground'>
            Bedroom and bathroom counts are managed at the unit level for
            apartments and are not applicable for land.
          </div>
        )}
      </div>

      {/* Amenities & Conditions */}
      <div className='space-y-4'>
        <div>
          <h4 className='font-medium'>Amenities & conditions</h4>
          <p className='text-sm text-muted-foreground'>
            Describe what's available and how the property can be used.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='is_furnished'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <label className='flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50'>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      className='mt-0.5'
                    />
                    <span className='grid gap-0.5 leading-none'>
                      <span className='text-sm font-medium'>Furnished</span>
                      <span className='text-xs text-muted-foreground'>
                        Includes furniture & appliances
                      </span>
                    </span>
                  </label>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='is_pet_friendly'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <label className='flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50'>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      className='mt-0.5'
                    />
                    <span className='grid gap-0.5 leading-none'>
                      <span className='text-sm font-medium'>Pet friendly</span>
                      <span className='text-xs text-muted-foreground'>
                        Allows dogs and cats
                      </span>
                    </span>
                  </label>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Availability */}
      <div className='space-y-4'>
        <div>
          <h4 className='font-medium'>Availability</h4>
          <p className='text-sm text-muted-foreground'>
            When is this property available for use?
          </p>
        </div>

        <FormField
          control={form.control}
          name='is_available'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <label className='flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50'>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    className='mt-0.5'
                  />
                  <span className='grid gap-0.5 leading-none'>
                    <span className='text-sm font-medium'>Available now</span>
                    <span className='text-xs text-muted-foreground'>
                      This property is ready for occupancy
                    </span>
                  </span>
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isAvailable && (
          <FormField
            control={form.control}
            name='available_from'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available from</FormLabel>
                <FormControl>
                  <DatePickerInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Pricing & Preferences */}
      <div className='space-y-4'>
        <div>
          <h4 className='font-medium'>Pricing & preferences</h4>
          <p className='text-sm text-muted-foreground'>
            How would you like this property to be sold or rented?
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <MultiSelectField
            form={form}
            name='amenities'
            label='Amenities'
            options={AMENITY_OPTIONS}
            placeholder='Select amenities'
            description='Features and conveniences available at the property.'
          />

          <MultiSelectField
            form={form}
            name='sale_types'
            label='Sale types'
            options={SALE_TYPE_OPTIONS}
            placeholder='Select sale types'
            description='How this property can be purchased or rented.'
          />
        </div>
      </div>
    </div>
  )
}
