/* eslint-disable react-hooks/incompatible-library */
import { useEffect } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
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
import CreateUnitsBlock from './components/create-property/create-units-block'
import { GeneralStep } from './components/general-step'
import { useCreateProperty, invalidatePropertiesQuery } from './query'
import { createPropertySchema, type TCreatePropertySchema } from './types'
import { createEmptyUnit } from './utils'

const route = getRouteApi('/_authenticated/properties/new')

const CreateProperty = () => {
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore((s) => s.auth)
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
      country: user?.active_organization.country ?? 'BR',
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
    <Main className='flex flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 lg:px-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Button
          variant='ghost'
          size='sm'
          className='w-fit px-0 sm:px-2'
          onClick={() => navigate({ to: '/properties' })}
        >
          <ChevronLeft className='size-5' />
          Back to properties
        </Button>
      </div>

      <div className='w-full'>
        <Card className='mx-auto w-full max-w-5xl'>
          <CardHeader className='space-y-2'>
            <CardTitle className='text-xl sm:text-2xl'>
              Create new property
            </CardTitle>
            <CardDescription className='text-sm sm:text-base'>
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

                <CreateUnitsBlock form={form} />

                <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() => navigate({ to: '/properties' })}
                    className='w-full sm:w-auto'
                  >
                    Cancel
                  </Button>

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
      </div>
    </Main>
  )
}

export default CreateProperty
