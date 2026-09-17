import { useEffect } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
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
import { useIsMobile } from '@/hooks/use-mobile'
import { useGetProperties } from '@/features/properties/query'
import { useCreateContact, useUpdateContact } from '../query'
import { toContactPayload } from '../query/dto'
import { contactFormSchema, type IContact, type TContactForm } from '../types'
import { CONTACT_TYPE_OPTIONS } from '../utils/constants'
import { ContactPropertyPicker } from './contact-property-picker'

type ContactFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: IContact | null
  initialPropertyIds?: number[]
  onSaved?: (contact: IContact) => void
}

const EMPTY_PROPERTY_IDS: number[] = []

const getDefaultValues = (
  contact?: IContact | null,
  initialPropertyIds: number[] = []
): TContactForm => ({
  name: contact?.name ?? '',
  type: contact?.type ?? 'tenant',
  identity_kind: contact?.identity_kind ?? 'person',
  preferred_locale: contact?.preferred_locale ?? 'en',
  tax_id_type: contact?.tax_id_type ?? null,
  tax_id: '',
  email: contact?.email ?? '',
  phone: contact?.phone ?? '',
  property_ids: contact?.property_ids ?? initialPropertyIds,
})

export function ContactFormDrawer({
  open,
  onOpenChange,
  contact,
  initialPropertyIds = EMPTY_PROPERTY_IDS,
  onSaved,
}: ContactFormDrawerProps) {
  const isMobile = useIsMobile()
  const { data: properties = [], isLoading: isLoadingProperties } =
    useGetProperties()
  const createMutation = useCreateContact()
  const updateMutation = useUpdateContact()
  const isEditing = Boolean(contact)
  const isSaving = createMutation.isPending || updateMutation.isPending

  const form = useForm<TContactForm>({
    resolver: zodResolver(contactFormSchema) as Resolver<TContactForm>,
    mode: 'onTouched',
    defaultValues: getDefaultValues(contact, initialPropertyIds),
  })

  useEffect(() => {
    if (!open) return

    form.reset(getDefaultValues(contact, initialPropertyIds))
  }, [contact, form, initialPropertyIds, open])

  const selectedPropertyIds =
    useWatch({ control: form.control, name: 'property_ids' }) ?? []
  const identityKind = useWatch({
    control: form.control,
    name: 'identity_kind',
  })
  const taxIdType = useWatch({ control: form.control, name: 'tax_id_type' })

  const submit = form.handleSubmit((values) => {
    const payload = toContactPayload(values, contact)
    const mutationOptions = {
      onSuccess: (savedContact: IContact) => {
        toast.success(
          isEditing ? 'Contact updated.' : `${savedContact.name} was added.`
        )
        onSaved?.(savedContact)
        onOpenChange(false)
      },
    }

    if (contact) {
      updateMutation.mutate({ contact, payload }, mutationOptions)
      return
    }

    createMutation.mutate(payload, mutationOptions)
  })

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) onOpenChange(nextOpen)
      }}
      direction={isMobile ? 'bottom' : 'right'}
    >
      <DrawerContent className='w-full p-0 data-[vaul-drawer-direction=bottom]:h-[92svh] data-[vaul-drawer-direction=bottom]:!max-h-[92svh] data-[vaul-drawer-direction=right]:w-130'>
        <Form {...form}>
          <form onSubmit={submit} className='flex h-full flex-col'>
            <DrawerHeader className='flex-row items-start gap-3 px-4 py-4 text-left sm:px-6 sm:py-5'>
              <div className='min-w-0 flex-1 space-y-1'>
                <DrawerTitle>
                  {isEditing ? 'Edit contact' : 'Add contact'}
                </DrawerTitle>
                <DrawerDescription>
                  Save an individual or company and connect it to properties.
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  disabled={isSaving}
                  className='shrink-0'
                >
                  <X />
                  <span className='sr-only'>Close</span>
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <div className='flex-1 overflow-y-auto px-4 py-5 sm:px-6'>
              <div className='space-y-6'>
                <div className='grid gap-5 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='identity_kind'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identity</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            if (!form.getValues('tax_id')) {
                              form.setValue(
                                'tax_id_type',
                                value === 'company' ? 'cnpj' : 'cpf'
                              )
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='person'>Person</SelectItem>
                            <SelectItem value='company'>Company</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='preferred_locale'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred language</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='en'>English</SelectItem>
                            <SelectItem value='pt-BR'>Português (Brasil)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              identityKind === 'company'
                                ? 'Legal or trading name'
                                : 'Full name'
                            }
                            autoComplete={
                              identityKind === 'company'
                                ? 'organization'
                                : 'name'
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>Primary relationship</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select a contact type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTACT_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                textValue={option.label}
                              >
                                <span className='flex flex-col items-start'>
                                  <span>{option.label}</span>
                                  <span className='text-xs text-muted-foreground'>
                                    {option.description}
                                  </span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='tax_id_type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brazilian tax ID type</FormLabel>
                        <Select
                          value={field.value ?? 'none'}
                          onValueChange={(value) =>
                            field.onChange(value === 'none' ? null : value)
                          }
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='none'>Not provided</SelectItem>
                            <SelectItem value='cpf'>CPF</SelectItem>
                            <SelectItem value='cnpj'>CNPJ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='tax_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{taxIdType?.toUpperCase() ?? 'Tax ID'}</FormLabel>
                        <FormControl>
                          <Input
                            inputMode='numeric'
                            placeholder={
                              contact?.tax_id_masked ??
                              (taxIdType === 'cnpj'
                                ? '00.000.000/0000-00'
                                : '000.000.000-00')
                            }
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        {contact?.tax_id_masked && !field.value && (
                          <p className='text-xs text-muted-foreground'>
                            Stored as {contact.tax_id_masked}. Leave blank to keep
                            it unchanged.
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='name@example.com'
                            autoComplete='email'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            type='tel'
                            placeholder='+55 11 99999-9999'
                            autoComplete='tel'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='property_ids'
                    render={({ field }) => (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>Properties</FormLabel>
                        <ContactPropertyPicker
                          properties={properties}
                          selectedIds={selectedPropertyIds}
                          onChange={field.onChange}
                          isLoading={isLoadingProperties}
                          disabled={isSaving}
                        />
                        <p className='text-xs text-muted-foreground'>
                          Optional. A contact can be connected to more than one
                          property.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DrawerFooter className='flex-row justify-end gap-2 p-4 sm:p-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSaving}>
                {isSaving && <Loader2 className='animate-spin' />}
                {isEditing ? 'Save changes' : 'Add contact'}
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
