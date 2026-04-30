import { useEffect, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import InputWithEndButtons from '@/components/ui/input-number'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Main } from '@/components/layout/main'
import { invalidatePropertiesQuery, useCreateProperty } from './query'
import { createPropertySchema, type TCreatePropertySchema } from './types'
import {
  AMENITY_OPTIONS,
  propertyTypes,
  SALE_TYPE_OPTIONS,
} from './utils/constants'

const route = getRouteApi('/_authenticated/properties/new')

const steps = [
  { key: 'general', label: 'General' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'features', label: 'Features' },
] as const

function NumberField({
  form,
  name,
  label,
  disabled = false,
  showCurrency = false,
}: {
  form: ReturnType<typeof useForm<TCreatePropertySchema>>
  name:
    | 'rent_price'
    | 'sale_price'
    | 'buy_price'
    | 'bedrooms'
    | 'bathrooms'
    | 'square_feet'
  label: string
  placeholder?: string
  disabled?: boolean
  showCurrency?: boolean
}) {
  const isPriceField = ['rent_price', 'sale_price', 'buy_price'].includes(name)

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
              step={showCurrency && isPriceField ? 0.01 : 1}
              isDisabled={disabled}
              value={field.value ?? (isPriceField ? 0 : 1)}
              onChange={(e) => field.onChange(e)}
              onBlur={field.onBlur}
              name={field.name}
              currency={showCurrency && isPriceField ? 'BRL' : undefined}
              autoFormat={showCurrency && isPriceField}
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
  form: ReturnType<typeof useForm<TCreatePropertySchema>>
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

const CreateProperty = () => {
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const { mutate, isPending } = useCreateProperty()

  const [step, setStep] = useState(0)

  const handleBackRouting = () => {
    navigate({ to: '/properties' })
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
      rent_price: null,
      sale_price: null,
      buy_price: null,
      bedrooms: null,
      bathrooms: null,
      square_feet: null,
      amenities: [],
      sale_types: [],
      available_from: undefined,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const propertyType = form.watch('property_type')
  const isHouse = propertyType === 'house'
  const isApartment = propertyType === 'apartment'
  const isLand = propertyType === 'land'

  const isAvailable = form.watch('is_available')

  useEffect(() => {
    if (!isAvailable) {
      form.setValue('available_from', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      })

      form.clearErrors('available_from')
    }
  }, [form, isAvailable])

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

  const stepFields = [
    [
      'property_type',
      'title',
      'description',
      'country',
      'postal_code',
      'state',
      'city',
      'address',
    ],
    isHouse
      ? ['rent_price', 'sale_price', 'buy_price']
      : ['sale_price', 'buy_price'],
    isApartment || isLand
      ? [
          'square_feet',
          'is_furnished',
          'is_pet_friendly',
          'available_from',
          'amenities',
          'sale_types',
        ]
      : [
          'square_feet',
          'bedrooms',
          'bathrooms',
          'is_furnished',
          'is_pet_friendly',
          'available_from',
          'amenities',
          'sale_types',
        ],
  ] as const

  const validateStep = async () => {
    const fields = stepFields[
      step
    ] as unknown as (keyof TCreatePropertySchema)[]
    return form.trigger(fields, { shouldFocus: true })
  }

  const next = async () => {
    const valid = await validateStep()
    if (valid && step < steps.length - 1) {
      setStep((current) => current + 1)
    }
  }

  const prev = () => setStep((current) => Math.max(current - 1, 0))

  const onSubmit = (data: TCreatePropertySchema) => {
    mutate(data, {
      async onSuccess(result) {
        await invalidatePropertiesQuery(queryClient)
        navigate({
          to: '/properties/$propertySlug',
          params: { propertySlug: result.slug },
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

      <Card className='mx-auto w-full max-w-6xl'>
        <CardHeader>
          <CardTitle>Create new property</CardTitle>
          <CardDescription>
            Enter the required information. Some fields change based on property
            type.
          </CardDescription>

          <div className='space-y-3 pt-2'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium tracking-wider text-muted-foreground uppercase'>
                {steps[step].label}
              </span>
              <span className='text-xs font-medium text-muted-foreground'>
                Step {step + 1} of {steps.length}
              </span>
            </div>

            <div className='flex gap-2'>
              {steps.map((item, index) => (
                <div
                  key={item.key}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors duration-300',
                    index <= step ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>

          <Separator className='mt-2' />
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className='grid gap-8' onSubmit={form.handleSubmit(onSubmit)}>
              {step === 0 && (
                <section className='grid gap-5'>
                  <div className='space-y-1'>
                    <h2 className='text-base font-semibold'>
                      General information
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                      Basic identity and location data for the property.
                    </p>
                  </div>

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
                              .filter((item) => item.value !== 'all')
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
                      control={form.control}
                      name='country'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='Country' />
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
              )}

              {step === 1 && (
                <section className='grid gap-5'>
                  <div className='space-y-1'>
                    <h2 className='text-base font-semibold'>Pricing</h2>
                    <p className='text-sm text-muted-foreground'>
                      Fields shown here depend on the selected property type.
                    </p>
                  </div>

                  {isHouse ? (
                    <div className='grid gap-4 md:grid-cols-3'>
                      {/* <InputWithEndButtons  /> */}
                      <NumberField
                        form={form}
                        name='rent_price'
                        label='Rent price'
                        showCurrency
                      />

                      <NumberField
                        form={form}
                        name='sale_price'
                        label='Sale price'
                        showCurrency
                      />
                      <NumberField
                        form={form}
                        name='buy_price'
                        label='Buy price'
                        showCurrency
                      />
                    </div>
                  ) : (
                    <div className='grid gap-4 md:grid-cols-2'>
                      <NumberField
                        form={form}
                        name='sale_price'
                        label='Sale price'
                        showCurrency
                      />
                      <NumberField
                        form={form}
                        name='buy_price'
                        label='Buy price'
                        showCurrency
                      />
                    </div>
                  )}

                  <div className='rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground'>
                    {isApartment
                      ? 'Apartments do not use rent price here. Unit pricing lives on the unit itself.'
                      : isLand
                        ? 'Land cannot be rented. Only sale or buy pricing applies.'
                        : 'Houses can use rent, sale, or buy pricing.'}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className='grid gap-5'>
                  <div className='space-y-1'>
                    <h2 className='text-base font-semibold'>Features</h2>
                    <p className='text-sm text-muted-foreground'>
                      Define property characteristics and availability details.
                    </p>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <NumberField
                      form={form}
                      name='square_feet'
                      label='Square feet'
                    />

                    {!isApartment && !isLand ? (
                      <>
                        <NumberField
                          form={form}
                          name='bedrooms'
                          label='Bedrooms'
                        />
                        <NumberField
                          form={form}
                          name='bathrooms'
                          label='Bathrooms'
                        />
                      </>
                    ) : (
                      <div className='rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground md:col-span-2'>
                        Bedrooms and bathrooms are hidden for apartments and
                        land.
                      </div>
                    )}

                    <div className='grid gap-4 md:col-span-2 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='is_furnished'
                        render={({ field }) => (
                          <FormItem>
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
                          <FormItem>
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

                    <div className='grid gap-4 md:col-span-2 md:grid-cols-2'>
                      {/* <DateField
                        form={form}
                        name='available_from'
                        label='Available from'
                        description='Optional release date for this property.'
                      /> */}

                      <FormField
                        control={form.control}
                        name='is_available'
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <label className='flex cursor-pointer items-start gap-3 rounded-2xl p-4'>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked === true)
                                  }
                                  className='mt-0.5'
                                />
                                <span className='grid gap-1 leading-none'>
                                  <span className='text-sm font-medium'>
                                    Available
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    Mark the property as available now.
                                  </span>
                                </span>
                              </label>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isAvailable && (
                        <FormField
                          control={form.control}
                          name='available_from'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Available From</FormLabel>
                              <FormControl>
                                <DatePickerInput {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className='grid gap-4 md:col-span-2 md:grid-cols-2'>
                      <MultiSelectField
                        form={form}
                        name='amenities'
                        label='Amenities'
                        options={AMENITY_OPTIONS}
                        placeholder='Select amenities'
                        description='Select the features attached to the property.'
                      />

                      <MultiSelectField
                        form={form}
                        name='sale_types'
                        label='Sale types'
                        options={SALE_TYPE_OPTIONS}
                        placeholder='Select sale types'
                        description='Choose the ways this property can be sold.'
                      />
                    </div>
                  </div>
                </section>
              )}

              <div className='flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-between'>
                {step > 0 ? (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={prev}
                    className='w-full sm:w-auto'
                  >
                    Back
                  </Button>
                ) : (
                  <div className='hidden sm:block' />
                )}

                <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
                  {step < steps.length - 1 ? (
                    <Button
                      type='button'
                      onClick={next}
                      className='w-full sm:w-auto'
                    >
                      Next
                      <ChevronRight className='ml-2 size-4' />
                    </Button>
                  ) : (
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
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Main>
  )
}

export default CreateProperty
