import { type UseFormReturn } from 'react-hook-form'
import { MapPin, Search } from 'lucide-react'
import { COUNTRIES } from '@/lib/countries'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { CountryCombobox } from '@/components/country-combobox'
import type { TCreatePropertySchema } from '../types'
import { propertyTypes } from '../utils/constants'

interface GeneralStepProps {
  form: UseFormReturn<TCreatePropertySchema>
}

const isBrazil = (country?: string) => country?.toUpperCase() === 'BR'

export const GeneralStep = ({ form }: GeneralStepProps) => {
  const country = form.watch('country')
  const isBR = isBrazil(country!)

  return (
    <div className='space-y-8 sm:space-y-6'>
      <div className='space-y-4'>
        <FormField
          control={form.control}
          name='property_type'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
                >
                  {propertyTypes
                    .filter((item) => item.value !== 'all')
                    .map((option) => {
                      const Icon = option.icon
                      const selected = field.value === option.value

                      return (
                        <label
                          key={option.value}
                          className={cn(
                            'flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-all',
                            'min-h-24 items-start',
                            selected
                              ? 'border-primary bg-primary/5'
                              : 'border-input hover:border-primary/50'
                          )}
                        >
                          <RadioGroupItem
                            value={option.value}
                            className='mt-1 shrink-0'
                          />
                          <span className='grid min-w-0 gap-1'>
                            <span className='flex items-center gap-2 text-sm font-semibold'>
                              <Icon className='size-5 shrink-0' />
                              <span className='truncate'>{option.label}</span>
                            </span>
                            <span className='text-xs leading-5 text-muted-foreground sm:text-sm'>
                              {option.description}
                            </span>
                          </span>
                        </label>
                      )
                    })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold sm:text-xl'>Property details</h3>
          <p className='text-sm text-muted-foreground'>
            Basic information about the property.
          </p>
        </div>

        <div className='grid gap-4'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='e.g., Modern apartment in Zona Norte'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ''}
                    placeholder='Describe the property, its features, and any special characteristics.'
                    className='min-h-28 sm:min-h-24'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <MapPin className='size-5 text-muted-foreground' />
          <h3 className='text-lg font-semibold sm:text-xl'>Location</h3>
        </div>
        <p className='text-sm text-muted-foreground'>
          Where is this property located?
        </p>

        <div className='grid gap-4 md:grid-cols-2'>
          <FormField
            name='country'
            control={form.control}
            render={({ field }) => (
              <FormItem className='col-span-1 md:col-span-2'>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <CountryCombobox
                    value={field.value ?? 'BR'}
                    onChange={field.onChange}
                    options={COUNTRIES}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isBR && (
            <FormField
              name='state'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name='state'
            render={({ field }) => (
              <FormItem>
                <FormLabel>State / Province</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='State' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='City' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='postal_code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <div className='flex flex-col gap-2 sm:flex-row'>
                  <FormControl className='flex-1'>
                    <Input {...field} placeholder='00000-000' />
                  </FormControl>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    title='Look up address from postal code'
                    className='shrink-0'
                  >
                    <Search className='size-4' />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem className='md:col-span-2'>
                <FormLabel>Street address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Street, number, and complement'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
