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
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { ApartmentsStep } from './components/apartments-step'
import { FeaturesStep } from './components/features-step'
import { GeneralStep } from './components/general-step'
import { PricingStep } from './components/pricing-step'
import { invalidatePropertiesQuery, useCreateProperty } from './query'
import { createPropertySchema, type TCreatePropertySchema } from './types'

const route = getRouteApi('/_authenticated/properties/new')

const CreateProperty = () => {
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const { mutate, isPending } = useCreateProperty()

  const [step, setStep] = useState(0)

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

  const propertyType = form.watch('property_type')
  const isHouse = propertyType === 'house'
  const isApartment = propertyType === 'apartment'
  const isLand = propertyType === 'land'
  const isAvailable = form.watch('is_available')

  // Determine total steps based on property type
  const totalSteps = isApartment ? 4 : 3

  // Step field validation mapping
  const stepFields: Record<number, (keyof TCreatePropertySchema)[]> = {
    0: [
      'property_type',
      'title',
      'description',
      'country',
      'postal_code',
      'state',
      'city',
      'address',
    ],
    1: isHouse
      ? ['rent_price', 'sale_price', 'buy_price']
      : ['sale_price', 'buy_price'],
    2:
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
    3: [],
  }

  useEffect(() => {
    if (!isHouse) {
      form.setValue('rent_price', null, {
        shouldDirty: true,
        shouldValidate: false,
      })
      form.clearErrors('rent_price')
    }
  }, [isHouse, form])

  useEffect(() => {
    if (isApartment || isLand) {
      form.setValue('bedrooms', null, {
        shouldDirty: true,
        shouldValidate: false,
      })
      form.setValue('bathrooms', null, {
        shouldDirty: true,
        shouldValidate: false,
      })
      form.clearErrors(['bedrooms', 'bathrooms'])
    }
  }, [isApartment, isLand, form])

  // Reset available_from when is_available changes
  useEffect(() => {
    if (!isAvailable) {
      form.setValue('available_from', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      })
      form.clearErrors('available_from')
    }
  }, [isAvailable, form])

  const validateStep = async () => {
    const fields = stepFields[step] as (keyof TCreatePropertySchema)[]
    return await form.trigger(fields, { shouldFocus: true })
  }

  const next = async () => {
    const valid = await validateStep()
    if (valid && step < totalSteps - 1) {
      setStep((s) => s + 1)
    }
  }

  const prev = () => {
    setStep((current) => Math.max(current - 1, 0))
  }

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

  const getStepLabel = (): string => {
    if (step === 0) return 'General information'
    if (step === 1) return 'Pricing'
    if (step === 2) return 'Features & characteristics'
    if (step === 3) return 'Building units'
    return ''
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

      <div className='w-full'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Main Form */}
          <div className='lg:col-span-8'>
            <Card className='h-full'>
              <CardHeader className='pb-4'>
                <div className='space-y-4'>
                  <div>
                    <CardTitle className='text-2xl'>
                      Create new property
                    </CardTitle>
                    <CardDescription className='mt-1'>
                      {step === 0 &&
                        'Start by describing your property and its location.'}
                      {step === 1 &&
                        'Set the pricing for your property based on its type.'}
                      {step === 2 &&
                        'Add features and details about your property.'}
                      {step === 3 && 'Manage the units in your building.'}
                    </CardDescription>
                  </div>

                  {/* Progress Bar */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-xs font-medium text-muted-foreground'>
                      <span className='tracking-wide uppercase'>
                        {getStepLabel()}
                      </span>
                      <span>
                        {step + 1} / {totalSteps}
                      </span>
                    </div>
                    <div className='flex gap-1.5'>
                      {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            'h-1.5 flex-1 rounded-full transition-all duration-300',
                            index <= step ? 'bg-primary' : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className='mt-4' />
              </CardHeader>

              <CardContent className='pb-6'>
                <Form {...form}>
                  <form className='space-y-8'>
                    {/* Step 0: General */}
                    {step === 0 && <GeneralStep form={form} />}

                    {/* Step 1: Pricing */}
                    {step === 1 && (
                      <PricingStep
                        form={form}
                        isHouse={isHouse}
                        isApartment={isApartment}
                        isLand={isLand}
                      />
                    )}

                    {/* Step 2: Features */}
                    {step === 2 && (
                      <FeaturesStep
                        form={form}
                        isApartment={isApartment}
                        isLand={isLand}
                        isAvailable={isAvailable}
                      />
                    )}

                    {/* Step 3: Apartments (only for apartments) */}
                    {step === 3 && isApartment && (
                      <ApartmentsStep form={form} />
                    )}
                  </form>
                </Form>
              </CardContent>

              <div className='border-t bg-muted/30 px-6 py-4'>
                <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-between'>
                  {step > 0 ? (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={prev}
                      className='w-full sm:w-auto'
                    >
                      <ChevronLeft className='mr-2 size-4' />
                      Back
                    </Button>
                  ) : (
                    <div className='hidden sm:block' />
                  )}

                  <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
                    {step < totalSteps - 1 ? (
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
                        type='button'
                        disabled={isPending}
                        className='w-full sm:w-auto'
                        onClick={form.handleSubmit(onSubmit)}
                      >
                        {isPending && (
                          <Loader2 className='mr-2 size-4 animate-spin' />
                        )}
                        Create property
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className='hidden space-y-4 lg:col-span-4 lg:flex lg:flex-col'>
            {/* Step Summary */}
            <Card className='bg-gradient-to-br from-primary/5 to-primary/10 p-4'>
              <div className='space-y-3'>
                <h3 className='font-semibold'>Step Summary</h3>
                <div className='space-y-2 text-sm'>
                  {step === 0 && (
                    <>
                      <p className='text-muted-foreground'>
                        Tell us about your property basics:
                      </p>
                      <ul className='space-y-1 pl-4'>
                        <li className='list-disc text-xs'>
                          Property type (House, Apartment, Land)
                        </li>
                        <li className='list-disc text-xs'>
                          Title and description
                        </li>
                        <li className='list-disc text-xs'>Location details</li>
                      </ul>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <p className='text-muted-foreground'>
                        Set pricing for your property:
                      </p>
                      <ul className='space-y-1 pl-4'>
                        <li className='list-disc text-xs'>
                          Rent pricing (houses only)
                        </li>
                        <li className='list-disc text-xs'>Sale pricing</li>
                        <li className='list-disc text-xs'>Purchase pricing</li>
                      </ul>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <p className='text-muted-foreground'>
                        Add property features:
                      </p>
                      <ul className='space-y-1 pl-4'>
                        <li className='list-disc text-xs'>Size and layout</li>
                        <li className='list-disc text-xs'>Amenities</li>
                        <li className='list-disc text-xs'>Availability</li>
                      </ul>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <p className='text-muted-foreground'>
                        Manage building units:
                      </p>
                      <ul className='space-y-1 pl-4'>
                        <li className='list-disc text-xs'>
                          Individual unit details
                        </li>
                        <li className='list-disc text-xs'>
                          Unit-specific pricing
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <Card className='p-4'>
              <div className='space-y-3'>
                <h3 className='text-sm font-semibold'>💡 Tips</h3>
                <ul className='space-y-2 text-xs text-muted-foreground'>
                  <li>
                    • Fill in all required fields before moving to the next step
                  </li>
                  <li>• You can edit your property details after creation</li>
                  <li>
                    • Adding clear descriptions helps attract potential tenants
                  </li>
                  <li>
                    • Use the postal code lookup for quick location filling
                  </li>
                </ul>
              </div>
            </Card>

            {/* Progress Details */}
            <Card className='border-dashed p-4'>
              <div className='space-y-3 text-xs'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Progress</span>
                  <span className='font-semibold'>
                    {Math.round((step / totalSteps) * 100)}%
                  </span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                  <div
                    className={cn(
                      'h-full rounded-full bg-primary transition-all duration-300',
                      `w-[${(step / totalSteps) * 100}%]`
                    )}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Main>
  )
}

export default CreateProperty
