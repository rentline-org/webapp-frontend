/* eslint-disable react-hooks/incompatible-library */
import { useEffect } from 'react'
import {
  type Resolver,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ChevronLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import type { TUnitType } from '../units/types'
import { GeneralStep } from './components/general-step'
import { useCreateProperty, invalidatePropertiesQuery } from './query'
import {
  createPropertySchema,
  type TPropertyType,
  type TCreatePropertySchema,
  type TCreatePropertyUnitSchema,
} from './types'

const route = getRouteApi('/_authenticated/properties/new')

const defaultUnitTypeByProperty: Record<TPropertyType, TUnitType> = {
  single_unit: 'house',
  multi_unit: 'apartment',
  land: 'other',
} as const

const allowedUnitTypesByProperty = {
  single_unit: [
    { value: 'house', label: 'House' },
    { value: 'studio', label: 'Studio' },
    { value: 'office', label: 'Office' },
  ],
  multi_unit: [
    { value: 'apartment', label: 'Apartment' },
    { value: 'studio', label: 'Studio' },
    { value: 'room', label: 'Room' },
    { value: 'office', label: 'Office' },
    { value: 'retail', label: 'Retail' },
    { value: 'warehouse', label: 'Warehouse' },
  ],
  land: [{ value: 'land', label: 'Land' }],
} as const

function createEmptyUnit(
  propertyType: TCreatePropertySchema['property_type'],
  name: string = ''
): TCreatePropertyUnitSchema {
  return {
    name,
    unit_type: defaultUnitTypeByProperty[propertyType],
    rent_price: null,
    sale_price: null,
    bedrooms: null,
    bathrooms: null,
    square_feet: null,
  }
}

function UnitsSection({
  form,
}: {
  form: ReturnType<typeof useForm<TCreatePropertySchema>>
}) {
  const propertyType = useWatch({
    control: form.control,
    name: 'property_type',
  })

  const isMultiUnit = propertyType === 'multi_unit'

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'units',
  })

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
      <div>
        <h3 className='text-lg font-semibold'>Units</h3>
        <p className='text-sm text-muted-foreground'>
          Add the unit data that belongs to this property.
        </p>
      </div>

      <div className='space-y-4'>
        {fields.map((field, index) => (
          <Card key={field.id} className='border-dashed'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between gap-3'>
                {isMultiUnit && (
                  <div>
                    <CardTitle className='text-base'>
                      Unit {index + 1}
                    </CardTitle>
                  </div>
                )}

                {isMultiUnit && fields.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => remove(index)}
                  >
                    <Trash2 className='size-4' />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent
              className={cn(
                'grid gap-4',
                propertyType === 'single_unit'
                  ? 'md:grid-cols-3'
                  : 'md:grid-cols-4'
              )}
            >
              {isMultiUnit && (
                <FormField
                  control={form.control}
                  name={`units.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
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
                        {...field}
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
                  </FormItem>
                )}
              />

              {/* {isMultiUnit ? (
                <FormField
                  control={form.control}
                  name={`units.${index}.unit_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit type</FormLabel>
                      <Select
                        {...field}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedUnitTypesByProperty.multi_unit.map(
                            (option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null} */}

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
                        value={field.value!}
                        aria-label={field.name}
                        aria-labelledby={field.name}
                        // onChange={field.onChange}
                        currency='BRL'
                        autoFormat
                        locale='pt-BR'
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
                        value={field.value!}
                        currency='BRL'
                        autoFormat
                        locale='pt-BR'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div
                className={cn(
                  'grid grid-cols-3 gap-4',
                  propertyType === 'single_unit' ? 'col-span-3' : 'col-span-4'
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
                          locale='pt-BR'
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
                          locale='pt-BR'
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
                          locale='pt-BR'
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
        >
          <Plus className='mr-2 size-4' />
          Add unit
        </Button>
      )}
    </div>
  )
}

const CreateProperty = () => {
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const { mutate, isPending } = useCreateProperty()

  const form = useForm<TCreatePropertySchema>({
    resolver: zodResolver(
      createPropertySchema
    ) as Resolver<TCreatePropertySchema>,
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'BR',
      property_type: 'single_unit',
      slug: '',
      units: [createEmptyUnit('single_unit')],
    },
  })

  const propertyTitle = form.watch('title')

  useEffect(() => {
    const type = form.getValues('property_type')

    if (type !== 'multi_unit') {
      form.setValue('units.0.name', propertyTitle)
    }
  }, [form, propertyTitle])

  const onSubmit = async (data: TCreatePropertySchema) => {
    mutate(data, {
      onSuccess: async (result) => {
        await invalidatePropertiesQuery(queryClient)
        navigate({
          to: '/properties/$propertySlug',
          params: { propertySlug: result.slug },
        })
      },
    })
  }

  return (
    <Main className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          size='sm'
          className='w-fit px-0'
          onClick={() => navigate({ to: '/properties' })}
        >
          <ChevronLeft className='size-5' />
          Back to properties
        </Button>
      </div>

      <div className='flex items-center'>
        <div className='lg:col-span-8'>
          <Card>
            <CardHeader>
              <CardTitle>Create new property</CardTitle>
              <CardDescription>
                Property is now only structural. Units handle everything else.
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6'
                >
                  <GeneralStep form={form} />

                  <Separator />

                  <UnitsSection form={form} />

                  <div className='flex justify-end gap-2'>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => navigate({ to: '/properties' })}
                    >
                      Cancel
                    </Button>

                    <Button type='submit' disabled={isPending}>
                      {isPending && (
                        <Loader2 className='mr-2 size-4 animate-spin' />
                      )}
                      Create property
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Main>
  )
}

export default CreateProperty
