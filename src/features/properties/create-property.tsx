import { useEffect } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { COUNTRIES } from '@/lib/countries'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePickerInput } from '@/components/ui/datepicker-input'
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
import { MultiSelectField } from '@/components/ui/multi-select-field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { CountryCombobox } from '@/components/country-combobox'
import { Main } from '@/components/layout/main'
import { invalidatePropertiesQuery, useCreateProperty } from './query'
import { createPropertySchema, type TCreatePropertySchema } from './types'
import {
  AMENITY_OPTIONS,
  propertyTypes,
  SALE_TYPE_OPTIONS,
} from './utils/constants'

const route = getRouteApi('/_authenticated/properties/new')

const CreateProperty = () => {
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const { mutate, isPending } = useCreateProperty()

  const handleBackRouting = () => {
    navigate({
      to: '/properties',
    })
  }

  const form = useForm<TCreatePropertySchema>({
    resolver: zodResolver(
      createPropertySchema
    ) as Resolver<TCreatePropertySchema>,
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'BR',

      property_type: 'house',

      is_available: true,
      is_furnished: false,
      is_pet_friendly: false,

      rent_price: 0,
      sale_price: 0,
      buy_price: 0,

      bedrooms: null,
      bathrooms: null,
      square_feet: null,

      amenities: [],
      sale_types: [],

      available_from: new Date(),
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const propertyType = form.watch('property_type')
  const isHouse = propertyType === 'house'
  const isApartment = propertyType === 'apartment'
  const isLand = propertyType === 'land'

  useEffect(() => {
    if (!isHouse) {
      form.setValue('rent_price', null, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.clearErrors('rent_price')
    }

    if (isApartment || isLand) {
      form.setValue('bedrooms', null, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('bathrooms', null, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.clearErrors(['bedrooms', 'bathrooms'])
    }
  }, [form, isApartment, isHouse, isLand])

  const onSubmit = (data: TCreatePropertySchema) => {
    mutate(data, {
      async onSuccess(result) {
        await invalidatePropertiesQuery(queryClient)

        navigate({
          to: '/properties/$propertySlug',
          params: {
            propertySlug: result.slug,
          },
        })
      },
    })
  }

  return (
    <Main>
      <div className='mb-4'>
        <Button
          variant='ghost'
          size='sm'
          className='w-fit px-0'
          onClick={handleBackRouting}
        >
          <ChevronLeft className='size-5' />
          Back to properties
        </Button>
      </div>
      <Card className='mx-auto'>
        <CardHeader>
          <CardTitle>Create new property</CardTitle>
          <CardDescription>
            Enter the required information. Some fields change based on property
            type.
          </CardDescription>
          <Separator />
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className='grid gap-8' onSubmit={form.handleSubmit(onSubmit)}>
              <section className='grid gap-5'>
                <FormField
                  control={form.control}
                  name='property_type'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel>Property type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className='grid gap-3 md:grid-cols-3'
                        >
                          {propertyTypes
                            .filter((i) => i.value !== 'all')
                            .map((option) => {
                              const Icon = option.icon
                              const selected = field.value === option.value

                              return (
                                <label
                                  key={option.value}
                                  className={cn(
                                    'flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors',
                                    selected && 'border-primary bg-primary/5'
                                  )}
                                >
                                  <RadioGroupItem
                                    value={option.value}
                                    className='mt-1'
                                  />
                                  <span className='grid gap-1'>
                                    <span className='flex items-center gap-2 text-sm font-medium'>
                                      <Icon className='size-4' />
                                      {option.label}
                                    </span>
                                    <span className='text-xs text-muted-foreground'>
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

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Property title' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ''}
                            placeholder='Short description of the property'
                            className='min-h-28'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name='country'
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className=''>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <CountryCombobox
                            value={field.value}
                            onChange={field.onChange}
                            options={COUNTRIES}
                          />
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
                        <FormControl>
                          <Input {...field} placeholder='Postal code' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='state'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
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
                    name='address'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Street address' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator />

              <section className='grid gap-5'>
                <div className='space-y-1'>
                  <h2 className='text-base font-semibold'>Pricing</h2>
                  <p className='text-sm text-muted-foreground'>
                    Fields shown here depend on the selected property type.
                  </p>
                </div>

                {isHouse ? (
                  <div className='grid gap-4 md:grid-cols-3'>
                    <FormField
                      control={form.control}
                      name='rent_price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rent price</FormLabel>
                          <FormControl>
                            <InputWithEndButtons
                              {...field}
                              value={field.value ?? 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='sale_price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale price</FormLabel>
                          <FormControl>
                            <InputWithEndButtons
                              {...field}
                              value={field.value ?? 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='buy_price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buy price</FormLabel>
                          <FormControl>
                            <InputWithEndButtons
                              {...field}
                              value={field.value ?? 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className='grid gap-4 md:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='sale_price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale price</FormLabel>
                          <FormControl>
                            <InputWithEndButtons
                              {...field}
                              value={field.value ?? 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='buy_price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buy price</FormLabel>
                          <FormControl>
                            <InputWithEndButtons
                              {...field}
                              value={field.value ?? 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </section>

              <Separator />

              <section className='grid gap-5'>
                <div className='space-y-1'>
                  <h2 className='text-base font-semibold'>Features</h2>
                  <p className='text-sm text-muted-foreground'>
                    Define property characteristics and availability details.
                  </p>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='square_feet'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Square feet</FormLabel>
                        <FormControl>
                          <InputWithEndButtons
                            {...field}
                            value={field.value ?? 0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isApartment && !isLand && (
                    <>
                      <FormField
                        control={form.control}
                        name='bedrooms'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bedrooms</FormLabel>
                            <FormControl>
                              <InputWithEndButtons
                                {...field}
                                value={field.value ?? 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='bathrooms'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bathrooms</FormLabel>
                            <FormControl>
                              <InputWithEndButtons
                                {...field}
                                value={field.value ?? 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className='col-span-3 grid w-full grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='is_furnished'
                      render={({ field }) => (
                        <FormItem className='w-full pt-2'>
                          <FormControl>
                            <label className='flex cursor-pointer items-start gap-3 rounded-2xl border p-4'>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) =>
                                  field.onChange(checked === true)
                                }
                                className='mt-0.5'
                              />
                              <span className='grid gap-1 leading-none'>
                                <span className='text-sm font-medium'>
                                  Furnished
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  Mark the property as furnished.
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
                        <FormItem className='pt-2'>
                          <FormControl>
                            <label className='flex cursor-pointer items-start gap-3 rounded-2xl border p-4'>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) =>
                                  field.onChange(checked === true)
                                }
                                className='mt-0.5'
                              />
                              <span className='grid gap-1 leading-none'>
                                <span className='text-sm font-medium'>
                                  Pet friendly
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  Allow pets on this property.
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
                <div className='grid w-full grid-cols-3 items-center gap-4'>
                  <FormField
                    control={form.control}
                    name='available_from'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available from date</FormLabel>
                        <FormControl>
                          <DatePickerInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <MultiSelectField
                    form={form}
                    name='amenities'
                    label='Amenities'
                    options={AMENITY_OPTIONS}
                    placeholder='Select amenities'
                  />

                  <MultiSelectField
                    form={form}
                    name='sale_types'
                    label='Sale types'
                    options={SALE_TYPE_OPTIONS}
                    placeholder='Select sale types'
                  />
                </div>
              </section>

              <div className='flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                <Button
                  type='submit'
                  disabled={isPending}
                  className='w-full sm:w-auto'
                >
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
    </Main>
  )
}

export default CreateProperty
