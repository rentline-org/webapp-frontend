import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { addDays, addYears, format, parseISO, subDays } from 'date-fns'
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
  FormDescription,
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
import { useIsMobile } from '@/hooks/use-mobile'
import { useGetContacts } from '@/features/contacts/query'
import { useGetProperties } from '@/features/properties/query'
import { useCreateLease, useRenewLease } from '../query'
import { toLeasePayload, toLeaseRenewalPayload } from '../query/dto'
import {
  createLeaseFormSchema,
  type IOperationalLease,
  type RentalGuarantee,
  type TLeaseForm,
} from '../types'

const NONE_VALUE = '__none__'

type LeaseFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  renewalOf?: IOperationalLease | null
  initialPropertyId?: number
  initialUnitId?: number
  onSaved?: (lease: IOperationalLease) => void
}

const isoDate = (date: Date) => format(date, 'yyyy-MM-dd')

const defaultValues = (
  lease?: IOperationalLease | null,
  initialPropertyId?: number,
  initialUnitId?: number
): TLeaseForm => {
  const rent = lease?.financial_terms?.find((term) => term.type === 'rent')
  const deposit = lease?.financial_terms?.find(
    (term) => term.type === 'security_deposit'
  )
  const guarantor = lease?.parties?.find((party) => party.role === 'guarantor')
  const tenant = lease?.parties?.find(
    (party) => party.role === 'primary_tenant' || party.is_primary
  )
  const renewalStarts = lease?.ends_on
    ? addDays(parseISO(lease.ends_on), 1)
    : null

  return {
    title: lease?.title ? `${lease.title} — renewal` : '',
    property_id: lease?.property_id ?? initialPropertyId ?? null,
    unit_id: lease?.unit_id ?? initialUnitId ?? null,
    primary_tenant_contact_id:
      tenant?.contact_id ?? lease?.tenant_contact_id ?? null,
    guarantor_contact_id: guarantor?.contact_id ?? null,
    starts_on: renewalStarts ? isoDate(renewalStarts) : '',
    ends_on: renewalStarts
      ? isoDate(subDays(addYears(renewalStarts, 1), 1))
      : '',
    rent_amount: rent?.amount ? Number(rent.amount) : null,
    currency: rent?.currency ?? lease?.currency ?? 'BRL',
    rent_frequency:
      rent?.frequency && rent.frequency !== 'one_time'
        ? rent.frequency
        : 'monthly',
    payment_due_day: rent?.due_day ?? null,
    guarantee_type: lease?.guarantee_type ?? null,
    guarantee_amount: deposit?.amount
      ? Number(deposit.amount)
      : lease?.security_deposit
        ? Number(lease.security_deposit)
        : null,
    notes: '',
  }
}

function NumberField({
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <Input
      {...props}
      type='number'
      value={value ?? ''}
      onChange={(event) =>
        onChange(event.target.value === '' ? null : Number(event.target.value))
      }
    />
  )
}

export function LeaseFormDrawer({
  open,
  onOpenChange,
  renewalOf,
  initialPropertyId,
  initialUnitId,
  onSaved,
}: LeaseFormDrawerProps) {
  const { t } = useTranslation('leases')
  const isMobile = useIsMobile()
  const { data: properties = [], isLoading: loadingProperties } =
    useGetProperties()
  const { data: contacts = [], isLoading: loadingContacts } = useGetContacts()
  const createMutation = useCreateLease()
  const renewMutation = useRenewLease()
  const isRenewal = Boolean(renewalOf)
  const isSaving = createMutation.isPending || renewMutation.isPending

  const form = useForm<TLeaseForm>({
    resolver: zodResolver(
      createLeaseFormSchema((key) => t(`validation.${key}`))
    ) as Resolver<TLeaseForm>,
    mode: 'onTouched',
    defaultValues: defaultValues(
      renewalOf,
      initialPropertyId,
      initialUnitId
    ),
  })

  useEffect(() => {
    if (!open) return
    form.reset(defaultValues(renewalOf, initialPropertyId, initialUnitId))
  }, [form, initialPropertyId, initialUnitId, open, renewalOf])

  const propertyId = useWatch({ control: form.control, name: 'property_id' })
  const guaranteeType = useWatch({
    control: form.control,
    name: 'guarantee_type',
  })
  const selectedProperty = properties.find(
    (property) => property.id === propertyId
  )
  const units = selectedProperty?.units ?? []
  const tenantContacts = contacts.filter(
    (contact) => contact.type === 'tenant'
  )
  const selectedTenantId = useWatch({
    control: form.control,
    name: 'primary_tenant_contact_id',
  })
  const guarantorContacts = useMemo(
    () => contacts.filter((contact) => contact.id !== selectedTenantId),
    [contacts, selectedTenantId]
  )

  const saveLease = (values: TLeaseForm) => {
    const onSuccess = (lease: IOperationalLease) => {
      toast.success(t(isRenewal ? 'form.renewed' : 'form.created'))
      onSaved?.(lease)
      onOpenChange(false)
    }

    if (renewalOf) {
      renewMutation.mutate(
        { lease: renewalOf, payload: toLeaseRenewalPayload(values) },
        { onSuccess }
      )
      return
    }

    createMutation.mutate(toLeasePayload(values), { onSuccess })
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) onOpenChange(nextOpen)
      }}
      direction={isMobile ? 'bottom' : 'right'}
    >
      <DrawerContent className='w-full p-0 data-[vaul-drawer-direction=bottom]:h-[94svh] data-[vaul-drawer-direction=bottom]:!max-h-[94svh] data-[vaul-drawer-direction=right]:w-152'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(saveLease)}
            className='flex h-full flex-col'
          >
            <DrawerHeader className='flex-row items-start gap-3 px-4 py-4 text-left sm:px-6 sm:py-5'>
              <div className='min-w-0 flex-1 space-y-1'>
                <DrawerTitle>
                  {t(isRenewal ? 'form.renewTitle' : 'form.createTitle')}
                </DrawerTitle>
                <DrawerDescription>{t('form.description')}</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button type='button' variant='ghost' size='icon'>
                  <X />
                  <span className='sr-only'>Close</span>
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <div className='flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6'>
              <section className='space-y-5 rounded-xl border p-4 sm:p-5'>
                <div className='grid gap-5 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>{t('form.reference')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('form.referencePlaceholder')}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='property_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common:fields.property')}</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : NONE_VALUE}
                          disabled={isSaving || isRenewal || loadingProperties}
                          onValueChange={(value) => {
                            const next =
                              value === NONE_VALUE ? null : Number(value)
                            field.onChange(next)
                            if (
                              !properties
                                .find((property) => property.id === next)
                                ?.units?.some(
                                  (unit) => unit.id === form.getValues('unit_id')
                                )
                            ) {
                              form.setValue('unit_id', null, {
                                shouldValidate: true,
                              })
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue
                                placeholder={t('form.propertyPlaceholder')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE} disabled>
                              {t('form.propertyPlaceholder')}
                            </SelectItem>
                            {properties.map((property) => (
                              <SelectItem
                                key={property.id}
                                value={String(property.id)}
                              >
                                {property.title}
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
                    name='unit_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common:fields.unit')}</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : NONE_VALUE}
                          disabled={isSaving || isRenewal || !propertyId}
                          onValueChange={(value) =>
                            field.onChange(
                              value === NONE_VALUE ? null : Number(value)
                            )
                          }
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue
                                placeholder={t(
                                  propertyId
                                    ? 'form.unitPlaceholder'
                                    : 'form.propertyFirst'
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE} disabled>
                              {t('form.unitPlaceholder')}
                            </SelectItem>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={String(unit.id)}>
                                {unit.name}
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
                    name='primary_tenant_contact_id'
                    render={({ field }) => (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>{t('form.primaryTenant')}</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : NONE_VALUE}
                          disabled={isSaving || loadingContacts}
                          onValueChange={(value) =>
                            field.onChange(
                              value === NONE_VALUE ? null : Number(value)
                            )
                          }
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue
                                placeholder={t('form.tenantPlaceholder')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE} disabled>
                              {t('form.tenantPlaceholder')}
                            </SelectItem>
                            {tenantContacts.map((contact) => (
                              <SelectItem
                                key={contact.id}
                                value={String(contact.id)}
                              >
                                {contact.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!loadingContacts && tenantContacts.length === 0 ? (
                          <FormDescription>{t('form.noTenants')}</FormDescription>
                        ) : null}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='starts_on'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common:fields.startsOn')}</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} disabled={isSaving} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='ends_on'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common:fields.endsOn')}</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} disabled={isSaving} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className='space-y-5 rounded-xl border p-4 sm:p-5'>
                <div className='grid gap-5 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='rent_amount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.rentAmount')}</FormLabel>
                        <FormControl>
                          <NumberField
                            value={field.value}
                            onChange={field.onChange}
                            min='0'
                            step='0.01'
                            inputMode='decimal'
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='currency'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.currency')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className='uppercase' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='rent_frequency'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.cadence')}</FormLabel>
                        <Select
                          value={field.value}
                          disabled={isSaving}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(['weekly', 'monthly', 'yearly'] as const).map(
                              (frequency) => (
                                <SelectItem key={frequency} value={frequency}>
                                  {t(`form.${frequency}`)}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='payment_due_day'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.dueDay')}</FormLabel>
                        <FormControl>
                          <NumberField
                            value={field.value}
                            onChange={field.onChange}
                            min='1'
                            max='31'
                            step='1'
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='guarantee_type'
                    render={({ field }) => (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>{t('form.guaranteeMode')}</FormLabel>
                        <Select
                          value={field.value ?? NONE_VALUE}
                          disabled={isSaving}
                          onValueChange={(value) => {
                            field.onChange(
                              value === NONE_VALUE
                                ? null
                                : (value as RentalGuarantee)
                            )
                            if (value !== 'guarantor') {
                              form.setValue('guarantor_contact_id', null)
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>
                              {t('form.guaranteeNone')}
                            </SelectItem>
                            <SelectItem value='cash_deposit'>
                              {t('form.cashDeposit')}
                            </SelectItem>
                            <SelectItem value='guarantor'>
                              {t('form.guarantor')}
                            </SelectItem>
                            <SelectItem value='rental_guarantee_insurance'>
                              {t('form.guaranteeInsurance')}
                            </SelectItem>
                            <SelectItem value='investment_fund_quotas'>
                              {t('form.investmentFund')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {guaranteeType === 'guarantor' ? (
                    <FormField
                      control={form.control}
                      name='guarantor_contact_id'
                      render={({ field }) => (
                        <FormItem className='sm:col-span-2'>
                          <FormLabel>{t('form.guarantor')}</FormLabel>
                          <Select
                            value={field.value ? String(field.value) : NONE_VALUE}
                            onValueChange={(value) =>
                              field.onChange(
                                value === NONE_VALUE ? null : Number(value)
                              )
                            }
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE} disabled>
                                {t('form.guarantor')}
                              </SelectItem>
                              {guarantorContacts.map((contact) => (
                                <SelectItem
                                  key={contact.id}
                                  value={String(contact.id)}
                                >
                                  {contact.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}

                  {guaranteeType ? (
                    <FormField
                      control={form.control}
                      name='guarantee_amount'
                      render={({ field }) => (
                        <FormItem className='sm:col-span-2'>
                          <FormLabel>{t('form.guaranteeAmount')}</FormLabel>
                          <FormControl>
                            <NumberField
                              value={field.value}
                              onChange={field.onChange}
                              min='0'
                              step='0.01'
                              inputMode='decimal'
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                </div>
              </section>

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder={t('form.notesPlaceholder')}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DrawerFooter className='flex-row justify-end gap-2 p-4 sm:p-6'>
              <Button
                type='button'
                variant='outline'
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
              >
                {t('common:actions.cancel')}
              </Button>
              <Button type='submit' disabled={isSaving}>
                {isSaving ? <Loader2 className='animate-spin' /> : null}
                {t(isRenewal ? 'form.renew' : 'form.create')}
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
