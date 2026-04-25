'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { COUNTRIES } from '@/lib/countries'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'
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
import { invalidateUserProfile } from '@/features/settings/profile/query'
import { useHandleCreationOrganization } from '../query'
import {
  createOrganizationSchema,
  type TCreateOrganizationSchema,
} from '../types'

type OrganizationField = keyof TCreateOrganizationSchema

type Props = {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
}

const steps = ['Basic', 'Address', 'Optional'] as const

const isBrazil = (country?: string) => country?.toUpperCase() === 'BR'

const CreateOrganizationForm = ({ modalOpen = false, setModalOpen }: Props) => {
  const [step, setStep] = useState(0)

  const queryClient = useQueryClient()
  const { useNavigate } = getRouteApi('/(auth)/onboarding')
  const navigate = useNavigate()

  const { mutate, isPending } = useHandleCreationOrganization()

  const form = useForm<TCreateOrganizationSchema>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    shouldFocusError: false,
    resolver: zodResolver(createOrganizationSchema),
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
      is_active: true,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const country = form.watch('country')
  const isBR = isBrazil(country)

  const stepFields = [
    ['title', 'email', 'description'],
    isBR
      ? ['country', 'state', 'city', 'postal_code', 'address_line']
      : ['country', 'city', 'postal_code', 'address_line'],
    isBR
      ? ['phone', 'website', 'tax_id', 'tax_id_type', 'is_active']
      : ['phone', 'website', 'tax_id', 'is_active'],
  ] as const

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

  const next = async () => {
    const fields = stepFields[step] as readonly OrganizationField[]
    const valid = await form.trigger([...fields], { shouldFocus: false })

    if (valid && step < steps.length - 1) {
      setStep((s) => s + 1)
    }
  }

  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = (data: TCreateOrganizationSchema) => {
    mutate(data, {
      async onSuccess() {
        await invalidateUserProfile(queryClient)
        toast.success('Organization created!')

        if (data.is_active) {
          navigate({ to: '/' })
        }

        if (setModalOpen && modalOpen) {
          setModalOpen(false)
        }
      },
    })
  }

  return (
    <Form {...form}>
      <form className='grid gap-4' onSubmit={form.handleSubmit(onSubmit)}>
        {/* Progress */}
        <div className='flex gap-2'>
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* STEP 1 */}
        {step === 0 && (
          <>
            <div className='grid grid-cols-2 gap-4'>
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
                  <FormLabel>Description (Optional) </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='About my organization...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              name='country'
              control={form.control}
              render={({ field }) => (
                <FormItem>
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
                <FormItem className={cn(isBR ? 'col-span-2' : '')}>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                name='phone'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
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
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isBR ? (
              <div className='grid grid-cols-2 gap-4'>
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
                            <SelectValue />
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
                <FormField
                  name='tax_id'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF / CPNJ</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <FormField
                name='tax_id'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              name='is_active'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Field orientation='horizontal'>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(c) => field.onChange(c === true)}
                      />
                      <FieldContent>
                        <FieldLabel>Set as active</FieldLabel>
                        <FieldDescription>
                          Enables the organization by default
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}

        {/* Actions */}
        <div className='flex justify-between'>
          {step > 0 ? (
            <Button type='button' variant='outline' onClick={prev}>
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < steps.length - 1 ? (
            <Button type='button' onClick={next}>
              Next
            </Button>
          ) : (
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save Changes
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

export default CreateOrganizationForm
