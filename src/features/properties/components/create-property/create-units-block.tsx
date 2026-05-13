import { useEffect, useMemo } from 'react'
import { type useForm, useWatch, useFieldArray } from 'react-hook-form'
import { Trash2, Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { getMoneyFormatConfig } from '@/lib/countries'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import InputWithEndButtons from '@/components/ui/input-number'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TCreatePropertySchema } from '../../types'
import { createEmptyUnit } from '../../utils'
import {
  allowedUnitTypesByProperty,
  defaultUnitTypeByProperty,
} from '../../utils/constants'

function CreateUnitsBlock({
  form,
}: {
  form: ReturnType<typeof useForm<TCreatePropertySchema>>
}) {
  const { user } = useAuthStore((s) => s.auth)
  const propertyType = useWatch({
    control: form.control,
    name: 'property_type',
  })

  const isMultiUnit = propertyType === 'multi_unit'

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'units',
  })

  const currencyConfig = useMemo(
    () => getMoneyFormatConfig(user?.active_organization.country ?? 'USD'),
    [user?.active_organization.country]
  )

  useEffect(() => {
    const currentUnits = form.getValues('units') ?? []
    const defaultUnitType = defaultUnitTypeByProperty[propertyType]

    if (propertyType === 'multi_unit') {
      if (currentUnits.length === 0) {
        replace([createEmptyUnit(propertyType)])
        return
      }

      const first = currentUnits[0]
      if (first && first.unit_type === 'house') {
        form.setValue('units.0.unit_type', defaultUnitType, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }

      return
    }

    const first =
      currentUnits[0] ?? createEmptyUnit(propertyType, form.getValues('title'))

    replace([
      {
        ...first,
        unit_type: defaultUnitType,
      },
    ])
  }, [form, propertyType, replace])

  return (
    <div className='space-y-6'>
      <div className='space-y-1'>
        <h3 className='text-lg font-semibold sm:text-xl'>Units</h3>
        <p className='text-sm text-muted-foreground'>
          Add the unit data that belongs to this property.
        </p>
      </div>

      <div className='space-y-4'>
        {fields.map((field, index) => (
          <Card key={field.id} className='border-dashed'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  {isMultiUnit && (
                    <CardTitle className='text-base sm:text-lg'>
                      Unit {index + 1}
                    </CardTitle>
                  )}
                </div>

                {isMultiUnit && fields.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => remove(index)}
                    className='shrink-0'
                  >
                    <Trash2 className='size-4' />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent
              className={cn(
                'grid gap-4',
                'sm:grid-cols-2 lg:grid-cols-4',
                propertyType === 'single_unit' && 'lg:grid-cols-3'
              )}
            >
              {isMultiUnit && (
                <FormField
                  control={form.control}
                  name={`units.${index}.name`}
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2 lg:col-span-1'>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Main unit, Apt 2B...' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name={`units.${index}.unit_type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className='w-full capitalize'>
                          <SelectValue placeholder='What will this unit be?' />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedUnitTypesByProperty[propertyType].map((u) => (
                            <SelectItem
                              key={u.value}
                              value={u.value}
                              className='capitalize'
                            >
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`units.${index}.rent_price`}
                defaultValue={0}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent price</FormLabel>
                    <FormControl>
                      <InputWithEndButtons
                        {...field}
                        value={field.value ?? 0}
                        aria-label={field.name}
                        aria-labelledby={field.name}
                        autoFormat
                        currency={currencyConfig.currency}
                        locale={currencyConfig.locale}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`units.${index}.sale_price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale price (Optional)</FormLabel>
                    <FormControl>
                      <InputWithEndButtons
                        {...field}
                        value={field.value ?? 0}
                        autoFormat
                        currency={currencyConfig.currency}
                        locale={currencyConfig.locale}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div
                className={cn(
                  'grid grid-cols-1 gap-4 sm:grid-cols-3',
                  propertyType === 'single_unit'
                    ? 'sm:col-span-2 lg:col-span-3'
                    : 'sm:col-span-2 lg:col-span-4'
                )}
              >
                <FormField
                  control={form.control}
                  name={`units.${index}.bedrooms`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rooms</FormLabel>
                      <FormControl>
                        <InputWithEndButtons
                          {...field}
                          value={field.value ?? 0}
                          onChange={(value) =>
                            field.onChange(value === 0 ? null : value)
                          }
                          step={1}
                          locale={currencyConfig.locale}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`units.${index}.bathrooms`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <InputWithEndButtons
                          {...field}
                          value={field.value ?? 0}
                          onChange={(value) =>
                            field.onChange(value === 0 ? null : value)
                          }
                          step={1}
                          locale={currencyConfig.locale}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`units.${index}.square_feet`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square feet</FormLabel>
                      <FormControl>
                        <InputWithEndButtons
                          {...field}
                          value={field.value ?? 0}
                          onChange={(value) =>
                            field.onChange(value === 0 ? null : value)
                          }
                          locale={currencyConfig.locale}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isMultiUnit && (
        <Button
          type='button'
          variant='outline'
          onClick={() => append(createEmptyUnit('multi_unit'))}
          className='w-full sm:w-auto'
        >
          <Plus className='mr-2 size-4' />
          Add unit
        </Button>
      )}
    </div>
  )
}

export default CreateUnitsBlock
