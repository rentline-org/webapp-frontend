import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useFieldArray,
  useForm,
  useWatch,
  type Resolver,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LockKeyhole, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError } from '@/api/errors'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useIsMobile } from '@/hooks/use-mobile'
import { useGetContacts } from '@/features/contacts/query'
import { useGetLeases } from '@/features/leases/query'
import { useGetProperties } from '@/features/properties/query'
import {
  useCreateDocument,
  useGetDocumentKinds,
  useUpdateDocument,
} from '../query'
import { toDocumentFormData, toDocumentUpdatePayload } from '../query/dto'
import {
  createDocumentFormSchema,
  documentPartyRoleValues,
  type DocumentPartyRole,
  type DocumentType,
  type IDocument,
  type IDocumentKindField,
  type TDocumentForm,
} from '../types'
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_KIND_I18N_KEYS,
  DOCUMENT_TYPE_OPTIONS,
  SIGNED_DOCUMENT_ACCEPT,
} from '../utils/constants'
import { DocumentFileField } from './document-file-field'
import { DocumentSupportingFilesField } from './document-supporting-files-field'

type DocumentFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: IDocument | null
  initialType?: DocumentType
  initialPropertyId?: number
  initialUnitId?: number
  onSaved?: (document: IDocument) => void
}

type FormSectionProps = {
  title: string
  description: string
  children: React.ReactNode
}

const NONE_VALUE = '__none__'

const emptyDetails: TDocumentForm['details'] = {
  change_summary: '',
  management_fee_type: null,
  management_fee_value: null,
  exclusive: false,
  commission_type: null,
  commission_value: null,
  calculation_basis: '',
  advertising_permitted: false,
  creci_reference: '',
  inspection_type: null,
  inspected_on: '',
  outcome: '',
  provider: '',
  policy_number: '',
  coverage_amount: null,
  premium_amount: null,
  deductible_amount: null,
  currency: 'BRL',
  service_scope: '',
  recurring_cost: null,
  frequency: null,
  issuer: '',
  certificate_number: '',
  registry_office: '',
  registration_number: '',
  acquisition_date: '',
}

const systemKindFields: Partial<Record<DocumentType, IDocumentKindField[]>> = {
  lease_addendum: [{ key: 'change_summary', type: 'textarea', required: true }],
  property_management_agreement: [
    {
      key: 'management_fee_type',
      type: 'select',
      options: ['fixed', 'percentage'],
    },
    { key: 'management_fee_value', type: 'decimal' },
  ],
  brokerage_authorization: [
    { key: 'exclusive', type: 'boolean' },
    {
      key: 'commission_type',
      type: 'select',
      options: ['fixed', 'percentage'],
    },
    { key: 'commission_value', type: 'decimal' },
    { key: 'calculation_basis', type: 'text' },
    { key: 'advertising_permitted', type: 'boolean' },
    { key: 'creci_reference', type: 'text' },
  ],
  inspection_report: [
    {
      key: 'inspection_type',
      type: 'select',
      options: ['move_in', 'move_out', 'routine'],
      required: true,
    },
    { key: 'inspected_on', type: 'date', required: true },
    { key: 'outcome', type: 'textarea' },
  ],
  insurance_policy: [
    { key: 'provider', type: 'text' },
    { key: 'policy_number', type: 'text' },
    { key: 'coverage_amount', type: 'decimal' },
    { key: 'premium_amount', type: 'decimal' },
    { key: 'deductible_amount', type: 'decimal' },
    { key: 'currency', type: 'currency' },
  ],
  service_contract: [
    { key: 'service_scope', type: 'textarea' },
    { key: 'recurring_cost', type: 'decimal' },
    { key: 'currency', type: 'currency' },
    {
      key: 'frequency',
      type: 'select',
      options: ['one_time', 'monthly', 'quarterly', 'yearly'],
    },
  ],
  compliance_certificate: [
    { key: 'issuer', type: 'text' },
    { key: 'certificate_number', type: 'text' },
  ],
  ownership_record: [
    { key: 'registry_office', type: 'text' },
    { key: 'registration_number', type: 'text' },
    { key: 'acquisition_date', type: 'date' },
  ],
}

const getDefaultValues = (
  document: IDocument | null | undefined,
  initialType: DocumentType,
  initialPropertyId?: number,
  initialUnitId?: number
): TDocumentForm => {
  const type = document?.type ?? initialType
  const leaseId =
    document?.contexts?.leases?.[0]?.id ??
    document?.lease_links?.[0]?.lease_id ??
    null

  return {
    type,
    custom_kind_id: document?.custom_kind_id ?? null,
    title: document?.title ?? '',
    purpose: document?.purpose ?? '',
    description: document?.description ?? '',
    reference_number: document?.reference_number ?? '',
    issued_on: document?.issued_on ?? '',
    effective_on: document?.effective_on ?? '',
    expires_on: document?.expires_on ?? '',
    lifecycle: document?.lifecycle ?? 'draft',
    property_id: document?.property_id ?? initialPropertyId ?? null,
    unit_id: document?.unit_id ?? initialUnitId ?? null,
    lease_id: leaseId,
    requires_signature:
      type === 'lease' ? true : (document?.requires_signature ?? false),
    is_signed: false,
    file: null,
    signed_file: null,
    supporting_files: [],
    parties:
      document?.parties?.map((party) => ({
        contact_id: party.contact_id,
        role: party.role as DocumentPartyRole,
        is_primary: party.is_primary,
      })) ?? [],
    signer_contact_ids:
      document?.signers?.flatMap((signer) =>
        signer.contact_id ? [signer.contact_id] : []
      ) ?? [],
    details: {
      ...emptyDetails,
      ...(document?.details ?? {}),
    } as TDocumentForm['details'],
  }
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className='space-y-5 rounded-xl border bg-card/40 p-4 sm:p-5'>
      <div className='space-y-1'>
        <h3 className='text-sm font-semibold'>{title}</h3>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

const detailLabelKeys: Record<string, string> = {
  change_summary: 'changeSummary',
  management_fee_type: 'managementFeeType',
  management_fee_value: 'managementFeeValue',
  exclusive: 'exclusive',
  commission_type: 'commissionType',
  commission_value: 'commissionValue',
  calculation_basis: 'calculationBasis',
  advertising_permitted: 'advertisingAllowed',
  creci_reference: 'creciNumber',
  inspection_type: 'inspectionType',
  inspected_on: 'inspectionDate',
  outcome: 'inspectionOutcome',
  provider: 'providerName',
  policy_number: 'policyNumber',
  coverage_amount: 'coverageAmount',
  premium_amount: 'premiumAmount',
  deductible_amount: 'deductibleAmount',
  currency: 'currency',
  service_scope: 'serviceScope',
  recurring_cost: 'recurringCost',
  frequency: 'frequency',
  issuer: 'issuer',
  certificate_number: 'certificateNumber',
  registry_office: 'registryOffice',
  registration_number: 'registryNumber',
  acquisition_date: 'acquisitionDate',
}

function normalizeOption(option: string | { value: string; label: string }) {
  return typeof option === 'string' ? { value: option, label: option } : option
}

export function DocumentFormDrawer({
  open,
  ...props
}: DocumentFormDrawerProps) {
  if (!open) return null

  const instanceKey = [
    props.document?.id ?? 'new',
    props.initialType ?? 'generic',
    props.initialPropertyId ?? 'organization',
    props.initialUnitId ?? 'all-units',
  ].join(':')

  return <DocumentFormDrawerContent key={instanceKey} {...props} open={open} />
}

function DocumentFormDrawerContent({
  open,
  onOpenChange,
  document,
  initialType = 'generic',
  initialPropertyId,
  initialUnitId,
  onSaved,
}: DocumentFormDrawerProps) {
  const { t } = useTranslation(['documents', 'common'])
  const isMobile = useIsMobile()
  const { data: properties = [], isLoading: isLoadingProperties } =
    useGetProperties()
  const { data: contacts = [], isLoading: isLoadingContacts } = useGetContacts()
  const leasesQuery = useGetLeases({ per_page: 100, sort: 'starts_on:desc' })
  const kindsQuery = useGetDocumentKinds()
  const createMutation = useCreateDocument()
  const updateMutation = useUpdateDocument()
  const abortController = useRef<AbortController | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const isEditing = Boolean(document)
  const isSaving = createMutation.isPending || updateMutation.isPending
  const isContextLocked = Boolean(
    document?.is_signed || document?.lifecycle === 'active'
  )

  const schema = useMemo(
    () =>
      createDocumentFormSchema(!isEditing, (key) =>
        t(`documents:validation.${key}`)
      ),
    [isEditing, t]
  )
  const form = useForm<TDocumentForm>({
    resolver: zodResolver(schema) as Resolver<TDocumentForm>,
    mode: 'onTouched',
    defaultValues: getDefaultValues(
      document,
      initialType,
      initialPropertyId,
      initialUnitId
    ),
  })
  const {
    fields: partyFields,
    append: appendParty,
    remove: removeParty,
  } = useFieldArray({
    control: form.control,
    name: 'parties',
  })

  useEffect(
    () => () => {
      abortController.current?.abort()
    },
    []
  )

  const selectedType = useWatch({ control: form.control, name: 'type' })
  const customKindId = useWatch({
    control: form.control,
    name: 'custom_kind_id',
  })
  const selectedPropertyId = useWatch({
    control: form.control,
    name: 'property_id',
  })
  const requiresSignature = useWatch({
    control: form.control,
    name: 'requires_signature',
  })
  const isSignedOnCreate = useWatch({
    control: form.control,
    name: 'is_signed',
  })
  const selectedSignerIds = useWatch({
    control: form.control,
    name: 'signer_contact_ids',
  })
  const selectedParties = useWatch({
    control: form.control,
    name: 'parties',
  })
  const details = useWatch({ control: form.control, name: 'details' })

  const catalogKinds = kindsQuery.data ?? []
  const selectedKind = catalogKinds.find((kind) =>
    selectedType === 'custom'
      ? kind.type === 'custom' && kind.custom_kind_id === customKindId
      : kind.type === selectedType
  )
  const selectedKindValue =
    selectedKind?.key ??
    (selectedType === 'custom' && customKindId
      ? `custom:${customKindId}`
      : selectedType)
  const structuredFields =
    selectedKind?.fields ?? systemKindFields[selectedType] ?? []
  const requiredPartyRoles = selectedKind?.required_parties ?? []
  const supportsLeaseContext =
    selectedKind?.allowed_scopes.includes('lease') ??
    [
      'lease',
      'lease_addendum',
      'inspection_report',
      'insurance_policy',
    ].includes(selectedType)

  const selectedProperty = properties.find(
    (property) => property.id === selectedPropertyId
  )
  const units = useMemo(() => {
    const options = (selectedProperty?.units ?? []).map((unit) => ({
      id: unit.id,
      name: unit.name,
    }))

    if (
      document?.unit &&
      document.property_id === selectedPropertyId &&
      !options.some((unit) => unit.id === document.unit?.id)
    ) {
      options.push({ id: document.unit.id, name: document.unit.name })
    }

    return options
  }, [document, selectedProperty, selectedPropertyId])

  useEffect(() => {
    if (isEditing || !selectedKind) return

    const currentParties = form.getValues('parties')
    const missingParties = selectedKind.required_parties.filter(
      (role) => !currentParties.some((party) => party.role === role)
    )
    if (missingParties.length === 0) return

    form.setValue(
      'parties',
      [
        ...currentParties,
        ...missingParties.map((role) => ({
          contact_id: null,
          role,
          is_primary: true,
        })),
      ],
      { shouldDirty: false }
    )
  }, [form, isEditing, selectedKind])

  const mapServerErrors = (error: unknown) => {
    if (!(error instanceof ApiError) || !error.errors) return
    const aliases: Record<string, string> = {
      document_kind_id: 'custom_kind_id',
      'lease_links.0.lease_id': 'lease_id',
      supporting_files: 'supporting_files',
    }

    Object.entries(error.errors).forEach(([serverPath, messages]) => {
      form.setError((aliases[serverPath] ?? serverPath) as never, {
        type: 'server',
        message: messages[0] ?? error.message,
      })
    })
  }

  const handleSuccess = (savedDocument: IDocument) => {
    toast.success(
      isEditing
        ? t('documents:form.updateSuccess')
        : t('documents:form.addSuccess', { title: savedDocument.title })
    )
    abortController.current = null
    setUploadProgress(0)
    onSaved?.(savedDocument)
    onOpenChange(false)
  }

  const saveDocument = (values: TDocumentForm) => {
    const missingParty = requiredPartyRoles.find(
      (role) =>
        !values.parties.some(
          (party) => party.role === role && party.contact_id !== null
        )
    )
    if (missingParty) {
      form.setError('parties', {
        type: 'required',
        message: t('documents:validation.requiredParties'),
      })
      return
    }

    if (document) {
      updateMutation.mutate(
        { document, payload: toDocumentUpdatePayload(values, document) },
        { onSuccess: handleSuccess, onError: mapServerErrors }
      )
      return
    }

    const controller = new AbortController()
    abortController.current = controller
    setUploadProgress(0)
    createMutation.mutate(
      {
        payload: toDocumentFormData(values),
        signal: controller.signal,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: handleSuccess,
        onError: (error) => {
          abortController.current = null
          mapServerErrors(error)
        },
      }
    )
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(saveDocument)(event)
  }

  const cancelUpload = () => {
    abortController.current?.abort()
    abortController.current = null
    createMutation.reset()
    setUploadProgress(0)
    toast.info(t('documents:form.uploadCancelled'))
  }

  const setDetail = (key: string, value: unknown) => {
    form.setValue(
      'details',
      { ...details, [key]: value } as TDocumentForm['details'],
      { shouldDirty: true, shouldValidate: true }
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) onOpenChange(nextOpen)
      }}
      direction={isMobile ? 'bottom' : 'right'}
    >
      <DrawerContent className='w-full p-0 data-[vaul-drawer-direction=bottom]:h-[94svh] data-[vaul-drawer-direction=bottom]:!max-h-[94svh] data-[vaul-drawer-direction=right]:w-[min(46rem,100vw)]'>
        <Form {...form}>
          <form onSubmit={submit} className='flex h-full min-h-0 flex-col'>
            <DrawerHeader className='flex-row items-start gap-3 px-4 py-4 text-left sm:px-6 sm:py-5'>
              <div className='min-w-0 flex-1 space-y-1'>
                <DrawerTitle>
                  {t(
                    isEditing
                      ? 'documents:form.editTitle'
                      : 'documents:form.addTitle'
                  )}
                </DrawerTitle>
                <DrawerDescription>
                  {t(
                    isEditing
                      ? 'documents:form.editDescription'
                      : 'documents:form.addDescription'
                  )}
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
                  <span className='sr-only'>{t('documents:form.close')}</span>
                </Button>
              </DrawerClose>
            </DrawerHeader>

            <div className='min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6'>
              <div className='space-y-5'>
                {isContextLocked ? (
                  <Alert>
                    <LockKeyhole />
                    <AlertTitle>{t('documents:form.lockedTitle')}</AlertTitle>
                    <AlertDescription>
                      {t('documents:form.lockedDescription')}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <FormSection
                  title={t('documents:form.detailsTitle')}
                  description={t('documents:form.detailsDescription')}
                >
                  <div className='grid gap-5 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='type'
                      render={({ field }) => (
                        <FormItem className='sm:col-span-2'>
                          <FormLabel>{t('documents:form.kind')}</FormLabel>
                          <Select
                            value={selectedKindValue}
                            disabled={
                              isEditing || isSaving || kindsQuery.isLoading
                            }
                            onValueChange={(value) => {
                              const kind = catalogKinds.find(
                                (item) => item.key === value
                              )
                              const nextType =
                                kind?.type ?? (value as DocumentType)
                              field.onChange(nextType)
                              form.setValue(
                                'custom_kind_id',
                                kind?.custom_kind_id ?? null,
                                { shouldDirty: true, shouldValidate: true }
                              )
                              form.setValue(
                                'requires_signature',
                                nextType === 'lease' ||
                                  Boolean(kind?.default_requires_signature),
                                { shouldDirty: true, shouldValidate: true }
                              )
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue
                                  placeholder={t(
                                    'documents:form.kindPlaceholder'
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(catalogKinds.length
                                ? catalogKinds
                                : DOCUMENT_TYPE_OPTIONS
                              ).map((kind) => {
                                const isCatalogKind = 'key' in kind
                                const value = isCatalogKind
                                  ? kind.key
                                  : kind.value
                                const type = isCatalogKind
                                  ? kind.type
                                  : kind.value
                                const label = isCatalogKind
                                  ? kind.label
                                  : t(
                                      `documents:kinds.${DOCUMENT_KIND_I18N_KEYS[type]}.label`
                                    )
                                const description = isCatalogKind
                                  ? ''
                                  : t(
                                      `documents:kinds.${DOCUMENT_KIND_I18N_KEYS[type]}.description`
                                    )

                                return (
                                  <SelectItem
                                    key={value}
                                    value={value}
                                    textValue={label}
                                  >
                                    <span className='flex flex-col items-start'>
                                      <span>{label}</span>
                                      {description ? (
                                        <span className='text-xs text-muted-foreground'>
                                          {description}
                                        </span>
                                      ) : null}
                                    </span>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          {isEditing ? (
                            <FormDescription>
                              {t('documents:form.kindLocked')}
                            </FormDescription>
                          ) : null}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='title'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common:fields.title')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t('documents:form.titlePlaceholder')}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='purpose'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('documents:form.purpose')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t(
                                'documents:form.purposePlaceholder'
                              )}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem className='sm:col-span-2'>
                          <FormLabel>
                            {t('common:fields.description')}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder={t(
                                'documents:form.descriptionPlaceholder'
                              )}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='reference_number'
                      render={({ field }) => (
                        <FormItem className='sm:col-span-2'>
                          <FormLabel>
                            {t('documents:form.referenceNumber')}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSaving} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {(
                      [
                        ['issued_on', 'issuedOn'],
                        ['effective_on', 'effectiveOn'],
                        ['expires_on', 'expiresOn'],
                      ] as const
                    ).map(([name, label]) => (
                      <FormField
                        key={name}
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(`documents:form.${label}`)}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='date'
                                {...field}
                                disabled={isSaving}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormSection>

                <FormSection
                  title={t('documents:form.contextTitle')}
                  description={t(
                    supportsLeaseContext
                      ? 'documents:form.contextLease'
                      : 'documents:form.contextGeneric'
                  )}
                >
                  <div className='grid gap-5 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='property_id'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common:fields.property')}</FormLabel>
                          <Select
                            value={
                              field.value ? String(field.value) : NONE_VALUE
                            }
                            disabled={
                              isSaving || isContextLocked || isLoadingProperties
                            }
                            onValueChange={(value) => {
                              const propertyId =
                                value === NONE_VALUE ? null : Number(value)
                              field.onChange(propertyId)
                              const unitId = form.getValues('unit_id')
                              const belongs = properties
                                .find((item) => item.id === propertyId)
                                ?.units?.some((unit) => unit.id === unitId)
                              if (!belongs) form.setValue('unit_id', null)
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue
                                  placeholder={t(
                                    'documents:form.propertyPlaceholder'
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>
                                {t('documents:form.organizationOnly')}
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
                            value={
                              field.value ? String(field.value) : NONE_VALUE
                            }
                            disabled={
                              isSaving ||
                              isContextLocked ||
                              !selectedPropertyId ||
                              isLoadingProperties
                            }
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
                                    selectedPropertyId
                                      ? 'documents:form.unitPlaceholder'
                                      : 'documents:form.propertyFirst'
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>
                                {t('documents:form.noSpecificUnit')}
                              </SelectItem>
                              {units.map((unit) => (
                                <SelectItem
                                  key={unit.id}
                                  value={String(unit.id)}
                                >
                                  {unit.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {supportsLeaseContext ? (
                      <FormField
                        control={form.control}
                        name='lease_id'
                        render={({ field }) => (
                          <FormItem className='sm:col-span-2'>
                            <FormLabel>
                              {t('documents:form.linkedLease')}
                            </FormLabel>
                            <Select
                              value={
                                field.value ? String(field.value) : NONE_VALUE
                              }
                              disabled={
                                isSaving ||
                                isContextLocked ||
                                leasesQuery.isLoading
                              }
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
                                      'documents:form.linkedLeasePlaceholder'
                                    )}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={NONE_VALUE}>
                                  {t('common:optional')}
                                </SelectItem>
                                {(leasesQuery.data?.items ?? []).map(
                                  (lease) => (
                                    <SelectItem
                                      key={lease.id}
                                      value={String(lease.id)}
                                    >
                                      {lease.title || `#${lease.id}`}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : null}
                  </div>
                </FormSection>

                <FormSection
                  title={t('documents:form.partiesTitle')}
                  description={t('documents:form.partiesDescription')}
                >
                  <div className='space-y-3'>
                    {partyFields.length === 0 ? (
                      <p className='text-sm text-muted-foreground'>
                        {t('documents:form.noParties')}
                      </p>
                    ) : null}
                    {partyFields.map((partyField, index) => {
                      const role =
                        selectedParties[index]?.role ?? partyField.role
                      const isRequired = requiredPartyRoles.includes(role)

                      return (
                        <div
                          key={partyField.id}
                          className='grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-end'
                        >
                          <FormField
                            control={form.control}
                            name={`parties.${index}.role`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t('documents:form.partyRole')}
                                </FormLabel>
                                <Select
                                  value={field.value}
                                  disabled={
                                    isSaving || isContextLocked || isRequired
                                  }
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger className='w-full'>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {documentPartyRoleValues.map(
                                      (partyRole) => (
                                        <SelectItem
                                          key={partyRole}
                                          value={partyRole}
                                        >
                                          {t(
                                            `documents:parties.roles.${partyRole}`,
                                            {
                                              defaultValue: partyRole.replace(
                                                /_/g,
                                                ' '
                                              ),
                                            }
                                          )}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                {isRequired ? (
                                  <FormDescription>
                                    {t('documents:form.requiredParty')}
                                  </FormDescription>
                                ) : null}
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`parties.${index}.contact_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t('documents:form.partyContact')}
                                </FormLabel>
                                <Select
                                  value={
                                    field.value
                                      ? String(field.value)
                                      : NONE_VALUE
                                  }
                                  disabled={
                                    isSaving ||
                                    isContextLocked ||
                                    isLoadingContacts
                                  }
                                  onValueChange={(value) =>
                                    field.onChange(
                                      value === NONE_VALUE
                                        ? null
                                        : Number(value)
                                    )
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger className='w-full'>
                                      <SelectValue
                                        placeholder={t(
                                          'documents:form.partyContactPlaceholder'
                                        )}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value={NONE_VALUE}>
                                      {t(
                                        'documents:form.partyContactPlaceholder'
                                      )}
                                    </SelectItem>
                                    {contacts.map((contact) => (
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

                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            disabled={isSaving || isContextLocked || isRequired}
                            aria-label={t('documents:form.removeParty')}
                            onClick={() => removeParty(index)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )
                    })}

                    <FormField
                      control={form.control}
                      name='parties'
                      render={() => (
                        <FormItem>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      disabled={isSaving || isContextLocked}
                      onClick={() =>
                        appendParty({
                          contact_id: null,
                          role: 'other',
                          is_primary: false,
                        })
                      }
                    >
                      <Plus />
                      {t('documents:form.addParty')}
                    </Button>
                  </div>
                </FormSection>

                {structuredFields.length ? (
                  <FormSection
                    title={t('documents:form.typeDetailsTitle')}
                    description={t('documents:form.typeDetailsDescription')}
                  >
                    <div className='grid gap-5 sm:grid-cols-2'>
                      {structuredFields.map((definition) => {
                        const key =
                          definition.key as keyof TDocumentForm['details']
                        const value = details[key]
                        const label =
                          definition.label ??
                          t(
                            `documents:form.${detailLabelKeys[definition.key] ?? definition.key}`
                          )

                        if (definition.type === 'boolean') {
                          return (
                            <div
                              key={definition.key}
                              className='flex items-center justify-between gap-4 rounded-lg border px-4 py-3 sm:col-span-2'
                            >
                              <Label>{label}</Label>
                              <Switch
                                checked={Boolean(value)}
                                disabled={isSaving || isContextLocked}
                                onCheckedChange={(checked) =>
                                  setDetail(definition.key, checked)
                                }
                              />
                            </div>
                          )
                        }

                        if (definition.type === 'select') {
                          return (
                            <div key={definition.key} className='space-y-2'>
                              <Label>{label}</Label>
                              <Select
                                value={
                                  typeof value === 'string' && value
                                    ? value
                                    : NONE_VALUE
                                }
                                disabled={isSaving || isContextLocked}
                                onValueChange={(next) =>
                                  setDetail(
                                    definition.key,
                                    next === NONE_VALUE ? null : next
                                  )
                                }
                              >
                                <SelectTrigger className='w-full'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NONE_VALUE}>
                                    {t('common:optional')}
                                  </SelectItem>
                                  {(definition.options ?? []).map((item) => {
                                    const option = normalizeOption(item)
                                    return (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {t(
                                          `documents:form.option_${option.value}`,
                                          {
                                            defaultValue: option.label.replace(
                                              /_/g,
                                              ' '
                                            ),
                                          }
                                        )}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          )
                        }

                        const isNumeric = ['number', 'decimal'].includes(
                          definition.type
                        )

                        return (
                          <div
                            key={definition.key}
                            className={
                              definition.type === 'textarea'
                                ? 'space-y-2 sm:col-span-2'
                                : 'space-y-2'
                            }
                          >
                            <Label>{label}</Label>
                            {definition.type === 'textarea' ? (
                              <Textarea
                                disabled={isSaving || isContextLocked}
                                value={typeof value === 'string' ? value : ''}
                                rows={3}
                                onChange={(event) =>
                                  setDetail(definition.key, event.target.value)
                                }
                              />
                            ) : (
                              <Input
                                disabled={isSaving || isContextLocked}
                                value={
                                  typeof value === 'string' ||
                                  typeof value === 'number'
                                    ? value
                                    : ''
                                }
                                type={
                                  definition.type === 'date'
                                    ? 'date'
                                    : isNumeric
                                      ? 'number'
                                      : 'text'
                                }
                                min={isNumeric ? '0' : undefined}
                                step={isNumeric ? '0.01' : undefined}
                                inputMode={isNumeric ? 'decimal' : undefined}
                                onChange={(event) =>
                                  setDetail(
                                    definition.key,
                                    isNumeric
                                      ? event.target.value === ''
                                        ? null
                                        : Number(event.target.value)
                                      : event.target.value
                                  )
                                }
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </FormSection>
                ) : null}

                <FormSection
                  title={t('documents:form.filesTitle')}
                  description={t('documents:form.filesDescription')}
                >
                  <div className='space-y-5'>
                    <FormField
                      control={form.control}
                      name='file'
                      render={({ field, fieldState }) => (
                        <DocumentFileField
                          ref={field.ref}
                          value={field.value}
                          onChange={field.onChange}
                          label={t('documents:form.primaryFile')}
                          accept={DOCUMENT_ACCEPT}
                          required={!isEditing}
                          disabled={isEditing || isSaving}
                          currentFile={document?.files.original ?? null}
                          description={t('documents:form.primaryDescription')}
                          error={fieldState.error?.message}
                        />
                      )}
                    />

                    {!isEditing ? (
                      <FormField
                        control={form.control}
                        name='supporting_files'
                        render={({ field, fieldState }) => (
                          <DocumentSupportingFilesField
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isSaving}
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                    ) : null}

                    <FormField
                      control={form.control}
                      name='requires_signature'
                      render={({ field }) => (
                        <FormItem className='flex items-start justify-between gap-4 rounded-lg border px-4 py-3'>
                          <div className='space-y-1'>
                            <FormLabel className='cursor-pointer'>
                              {t('documents:form.requiresSignature')}
                            </FormLabel>
                            <FormDescription>
                              {t('documents:form.requiresSignatureDescription')}
                            </FormDescription>
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              disabled={
                                isSaving ||
                                selectedType === 'lease' ||
                                isContextLocked
                              }
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                if (!checked) {
                                  form.setValue('is_signed', false)
                                  form.setValue('signed_file', null)
                                  form.setValue('signer_contact_ids', [])
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!isEditing && requiresSignature ? (
                      <div className='space-y-3'>
                        <Label>{t('documents:form.requiredSigners')}</Label>
                        <div className='max-h-48 divide-y overflow-y-auto rounded-lg border'>
                          {isLoadingContacts ? (
                            <p className='p-4 text-sm text-muted-foreground'>
                              {t('documents:form.loadingContacts')}
                            </p>
                          ) : contacts.length ? (
                            contacts.map((contact) => {
                              const selected = selectedSignerIds.includes(
                                contact.id
                              )
                              return (
                                <Label
                                  key={contact.id}
                                  className='flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/40'
                                >
                                  <Checkbox
                                    checked={selected}
                                    disabled={isSaving}
                                    onCheckedChange={(checked) =>
                                      form.setValue(
                                        'signer_contact_ids',
                                        checked
                                          ? [...selectedSignerIds, contact.id]
                                          : selectedSignerIds.filter(
                                              (id) => id !== contact.id
                                            ),
                                        { shouldDirty: true }
                                      )
                                    }
                                  />
                                  <span className='min-w-0'>
                                    <span className='block truncate text-sm font-medium'>
                                      {contact.name}
                                    </span>
                                    {contact.email ? (
                                      <span className='block truncate text-xs text-muted-foreground'>
                                        {contact.email}
                                      </span>
                                    ) : null}
                                  </span>
                                </Label>
                              )
                            })
                          ) : (
                            <p className='p-4 text-sm text-muted-foreground'>
                              {t('documents:form.noContacts')}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {!isEditing && requiresSignature ? (
                      <FormField
                        control={form.control}
                        name='is_signed'
                        render={({ field }) => (
                          <FormItem className='flex items-start justify-between gap-4 rounded-lg border px-4 py-3'>
                            <div className='space-y-1'>
                              <FormLabel className='cursor-pointer'>
                                {t('documents:form.alreadySigned')}
                              </FormLabel>
                              <FormDescription>
                                {t('documents:form.alreadySignedDescription')}
                              </FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                disabled={isSaving}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked)
                                  if (!checked)
                                    form.setValue('signed_file', null)
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ) : null}

                    {!isEditing && isSignedOnCreate ? (
                      <FormField
                        control={form.control}
                        name='signed_file'
                        render={({ field, fieldState }) => (
                          <DocumentFileField
                            ref={field.ref}
                            value={field.value}
                            onChange={field.onChange}
                            label={t('documents:form.signedFile')}
                            accept={SIGNED_DOCUMENT_ACCEPT}
                            required
                            disabled={isSaving}
                            description={t('documents:form.signedDescription')}
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                    ) : null}

                    {createMutation.isPending ? (
                      <div className='space-y-2 rounded-lg border bg-muted/30 p-3'>
                        <div className='flex items-center justify-between gap-3 text-sm'>
                          <span>
                            {t('documents:form.uploadProgress', {
                              progress: uploadProgress,
                            })}
                          </span>
                          <span className='tabular-nums'>
                            {uploadProgress}%
                          </span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    ) : null}
                  </div>
                </FormSection>
              </div>
            </div>

            <DrawerFooter className='flex-row justify-end gap-2 border-t p-4 sm:p-6'>
              {createMutation.isPending ? (
                <Button type='button' variant='outline' onClick={cancelUpload}>
                  {t('documents:form.cancelUpload')}
                </Button>
              ) : (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  {t('common:actions.cancel')}
                </Button>
              )}
              <Button type='submit' disabled={isSaving}>
                {isSaving ? <Loader2 className='animate-spin' /> : null}
                {t(isEditing ? 'common:actions.save' : 'documents:page.add')}
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
