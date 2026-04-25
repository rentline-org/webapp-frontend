'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// import { useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
// import { toast } from 'sonner'
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
// import { invalidateUserProfile } from '@/features/settings/profile/query'
import type { IUserProfileData } from '../profile/types'
// import { useHandleUpdateOrganization } from '../query'
import {
  type TUpdateOrganizationSchema,
  updateOrganizationSchema,
} from './types'

// import {
//   updateOrganizationSchema,
//   type TUpdateOrganizationSchema,
// } from '../types'

type Props = {
  user: IUserProfileData
}

const isBrazil = (country?: string | null) => country?.toUpperCase() === 'BR'

const EditOrganizationForm = ({ user }: Props) => {
  //   const queryClient = useQueryClient()
  //   const { mutate, isPending } = useHandleUpdateOrganization()

  const organization = user.active_organization ?? null

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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
      avatar: null,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const country = form.watch('country')
  const isBR = isBrazil(country)
  const avatarFile = form.watch('avatar')

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
      avatar: null,
    })

    setAvatarPreview(
      (organization as { avatar?: string | null }).avatar ?? null
    )
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

  useEffect(() => {
    if (!(avatarFile instanceof File)) return

    const nextUrl = URL.createObjectURL(avatarFile)
    setAvatarPreview(nextUrl)

    return () => URL.revokeObjectURL(nextUrl)
  }, [avatarFile])

  const onSubmit = (data: TUpdateOrganizationSchema) => {
    if (!organization?.id) return

    const formData = new FormData()

    formData.append('title', data.title)
    formData.append('description', data.description ?? '')
    formData.append('email', data.email)
    formData.append('phone', data.phone ?? '')
    formData.append('website', data.website ?? '')
    formData.append('country', data.country)
    formData.append('state', data.state ?? '')
    formData.append('city', data.city)
    formData.append('postal_code', data.postal_code)
    formData.append('address_line', data.address_line)
    formData.append('tax_id', data.tax_id ?? '')
    formData.append('tax_id_type', data.tax_id_type ?? '')

    if (data.avatar instanceof File) {
      formData.append('avatar', data.avatar)
    }

    // mutate(
    //   { id: organization.id, data: formData },
    //   {
    //     async onSuccess() {
    //       await invalidateUserProfile(queryClient)
    //       toast.success('Organization updated!')
    //     },
    //   }
    // )
  }

  if (!organization) {
    return (
      <div className='rounded-2xl border border-border/50 p-6 text-sm text-muted-foreground'>
        No active organization found.
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        className='grid w-full gap-6'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className='grid gap-6 lg:grid-cols-5 lg:gap-10'>
          <div className='col-span-3 grid gap-6'>
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

          <div className='col-span-2 space-y-4'>
            <div className='rounded-2xl border border-border/50 p-4'>
              <div className='mb-3 text-sm font-medium'>Logo</div>

              <div className='mb-4 aspect-square overflow-hidden rounded-2xl border bg-muted'>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt='Organization avatar preview'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
                    No avatar
                  </div>
                )}
              </div>

              <FormField
                name='avatar'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className='flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:bg-muted/50'>
                        <Upload className='h-4 w-4' />
                        <span>
                          {avatarFile ? 'Change Logo' : 'Upload Logo'}
                        </span>
                        <input
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null
                            field.onChange(file)
                          }}
                        />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className='flex justify-start border-t pt-4'>
          <Button type='submit' disabled={false} className='min-w-36'>
            {/* {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} */}
            Update Organization
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default EditOrganizationForm
