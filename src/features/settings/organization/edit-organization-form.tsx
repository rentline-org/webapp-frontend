import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { COUNTRIES } from '@/lib/countries'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CountryCombobox } from '@/components/country-combobox'
import { invalidateUserProfile } from '../profile/query'
import type { IUserProfileData } from '../profile/types'
import UploadOrganizationLogo from './components/upload-organization-logo'
import { useUpdateOrganization } from './query'
import {
  type TUpdateOrganizationSchema,
  updateOrganizationSchema,
} from './types'

type Props = {
  user: IUserProfileData
}

const isBrazil = (country?: string | null) => country?.toUpperCase() === 'BR'

const EditOrganizationForm = ({ user }: Props) => {
  const queryClient = useQueryClient()
  const { mutate: updateOrganization, isPending: isUpdating } =
    useUpdateOrganization()
  const organization = user.active_organization ?? null

  const form = useForm<TUpdateOrganizationSchema>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    shouldFocusError: false,
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      title: '',
      description: '',
      email: '',
      phone: '',
      website: '',
      country: '',
      state: '',
      city: '',
      postal_code: '',
      address_line: '',
      tax_id: '',
      tax_id_type: undefined,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const country = form.watch('country')
  const isBR = isBrazil(country)

  useEffect(() => {
    if (!organization) return

    form.reset({
      title: organization.title ?? '',
      description: organization.description ?? '',
      email: organization.email ?? '',
      phone: organization.phone ?? '',
      website: organization.website ?? '',
      country: organization.country ?? '',
      state: organization.state ?? '',
      city: organization.city ?? '',
      postal_code: organization.postal_code ?? '',
      address_line: organization.address_line ?? '',
      tax_id: organization.tax_id ?? '',
      tax_id_type: organization.tax_id_type ?? undefined,
    })
  }, [organization, form])

  useEffect(() => {
    if (!country) return

    if (isBR) {
      const current = form.getValues('tax_id_type')
      if (current !== 'cpf' && current !== 'cnpj') {
        form.setValue('tax_id_type', 'cpf', { shouldValidate: false })
      }
    } else {
      form.setValue('tax_id_type', 'vat', { shouldValidate: false })
      form.clearErrors(['state', 'tax_id_type'])
    }
  }, [country, isBR, form])

  const onSubmit = (data: TUpdateOrganizationSchema) => {
    if (!organization?.id) return

    const payload = {
      ...data,
    } as TUpdateOrganizationSchema

    updateOrganization(
      {
        payload,
        organizationId: organization.id,
      },
      {
        async onSuccess() {
          toast.success('Organization updated')
          await invalidateUserProfile(queryClient)
        },
      }
    )

    // const formData = new FormData()

    // formData.append('title', data.title)
    // formData.append('description', data.description ?? '')
    // formData.append('email', data.email)
    // formData.append('phone', data.phone ?? '')
    // formData.append('website', data.website ?? '')
    // formData.append('country', data.country)
    // formData.append('state', data.state ?? '')
    // formData.append('city', data.city)
    // formData.append('postal_code', data.postal_code)
    // formData.append('address_line', data.address_line)
    // formData.append('tax_id', data.tax_id ?? '')
    // formData.append('tax_id_type', data.tax_id_type ?? '')
  }

  if (!organization) {
    return (
      <div className='rounded-2xl border border-border/50 p-6 text-sm text-muted-foreground'>
        No active organization found.
      </div>
    )
  }

  return (
    <div className='grid w-full gap-6 lg:grid-cols-5 lg:gap-10'>
      <div className='col-span-3'>
        <Form {...form}>
          <form
            className='grid w-full gap-6'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className='grid gap-6 lg:gap-10'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  name='title'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='My Organization' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name='email'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          {...field}
                          placeholder='my@organization.com'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name='description'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='About my organization...'
                        className='min-h-28'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  name='country'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem
                      className={cn(!isBR ? 'md:col-span-2' : 'md:col-span-1')}
                    >
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
                  name='city'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name='postal_code'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name='address_line'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  name='phone'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name='website'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {isBR && (
                  <FormField
                    name='tax_id_type'
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ''}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='cpf'>CPF</SelectItem>
                            <SelectItem value='cnpj'>CNPJ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  name='tax_id'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className={cn(!isBR && 'md:col-span-2')}>
                      <FormLabel>{isBR ? 'CPF / CNPJ' : 'VAT'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex justify-start border-t pt-4'>
              <Button type='submit' disabled={isUpdating} className='min-w-36'>
                {isUpdating ? (
                  <>
                    <Loader2 className='animate-spin' />
                    Updating...
                  </>
                ) : (
                  <>Update Organization</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className='col-span-2 space-y-4'>
        <UploadOrganizationLogo organization={organization} />
      </div>
    </div>
  )
}

export default EditOrganizationForm
