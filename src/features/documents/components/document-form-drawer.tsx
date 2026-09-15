import { useEffect, useMemo, type FormEvent } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileLock2, Loader2, LockKeyhole, X } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useIsMobile } from '@/hooks/use-mobile'
import { useGetContacts } from '@/features/contacts/query'
import { useGetProperties } from '@/features/properties/query'
import { useCreateDocument, useUpdateDocument } from '../query'
import { toDocumentFormData, toDocumentUpdatePayload } from '../query/dto'
import {
  createDocumentFormSchema,
  type DocumentType,
  type IDocument,
  type TDocumentForm,
} from '../types'
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_TYPE_OPTIONS,
  SIGNED_DOCUMENT_ACCEPT,
} from '../utils/constants'
import { DocumentFileField } from './document-file-field'

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

const getDefaultValues = (
  document: IDocument | null | undefined,
  initialType: DocumentType,
  initialPropertyId?: number,
  initialUnitId?: number
): TDocumentForm => {
  const type = document?.type ?? initialType

  return {
    type,
    title: document?.title ?? '',
    purpose: document?.purpose ?? '',
    description: document?.description ?? '',
    property_id: document?.property_id ?? initialPropertyId ?? null,
    unit_id: document?.unit_id ?? initialUnitId ?? null,
    requires_signature:
      type === 'lease' ? true : (document?.requires_signature ?? false),
    // Existing signature state is managed by its dedicated action, not PATCH.
    is_signed: false,
    file: null,
    signed_file: null,
    lease: {
      tenant_contact_id: document?.lease?.tenant_contact_id ?? null,
      starts_on: document?.lease?.starts_on ?? '',
      ends_on: document?.lease?.ends_on ?? '',
      rent_amount: document?.lease?.rent_amount ?? null,
      security_deposit: document?.lease?.security_deposit ?? null,
      notes: document?.lease?.notes ?? '',
    },
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

export function DocumentFormDrawer({
  open,
  onOpenChange,
  document,
  initialType = 'generic',
  initialPropertyId,
  initialUnitId,
  onSaved,
}: DocumentFormDrawerProps) {
  const isMobile = useIsMobile()
  const { data: properties = [], isLoading: isLoadingProperties } =
    useGetProperties()
  const { data: contacts = [], isLoading: isLoadingContacts } =
    useGetContacts()
  const createMutation = useCreateDocument()
  const updateMutation = useUpdateDocument()
  const isEditing = Boolean(document)
  const isSaving = createMutation.isPending || updateMutation.isPending
  const isContextLocked = Boolean(document?.is_signed)

  const form = useForm<TDocumentForm>({
    resolver: zodResolver(
      createDocumentFormSchema(!isEditing)
    ) as Resolver<TDocumentForm>,
    mode: 'onTouched',
    defaultValues: getDefaultValues(
      document,
      initialType,
      initialPropertyId,
      initialUnitId
    ),
  })

  useEffect(() => {
    if (!open) return

    form.reset(
      getDefaultValues(
        document,
        initialType,
        initialPropertyId,
        initialUnitId
      )
    )
  }, [
    document,
    form,
    initialPropertyId,
    initialType,
    initialUnitId,
    open,
  ])

  const selectedType = useWatch({ control: form.control, name: 'type' })
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
  const tenants = contacts.filter((contact) => contact.type === 'tenant')
  const currentTenantMissing = Boolean(
    document?.lease?.tenant_contact_id &&
      !tenants.some(
        (tenant) => tenant.id === document.lease?.tenant_contact_id
      )
  )

  const saveDocument = (values: TDocumentForm) => {
    const mutationOptions = {
      onSuccess: (savedDocument: IDocument) => {
        toast.success(
          isEditing ? 'Document updated.' : `${savedDocument.title} was added.`
        )
        onSaved?.(savedDocument)
        onOpenChange(false)
      },
    }

    if (document) {
      updateMutation.mutate(
        {
          document,
          payload: toDocumentUpdatePayload(values, document),
        },
        mutationOptions
      )
      return
    }

    createMutation.mutate(toDocumentFormData(values), mutationOptions)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (!isContextLocked) {
      void form.handleSubmit(saveDocument)(event)
      return
    }

    event.preventDefault()
    void form
      .trigger(['title', 'purpose', 'description'], { shouldFocus: true })
      .then((isValid) => {
        if (isValid) saveDocument(form.getValues())
      })
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSaving) onOpenChange(nextOpen)
      }}
      direction={isMobile ? 'bottom' : 'right'}
    >
      <DrawerContent className='w-full p-0 data-[vaul-drawer-direction=bottom]:h-[94svh] data-[vaul-drawer-direction=bottom]:!max-h-[94svh] data-[vaul-drawer-direction=right]:w-160'>
        <Form {...form}>
          <form onSubmit={submit} className='flex h-full flex-col'>
            <DrawerHeader className='flex-row items-start gap-3 px-4 py-4 text-left sm:px-6 sm:py-5'>
              <div className='min-w-0 flex-1 space-y-1'>
                <DrawerTitle>
                  {isEditing ? 'Edit document' : 'Add document'}
                </DrawerTitle>
                <DrawerDescription>
                  {isEditing
                    ? 'Update how this document is described and where it is used.'
                    : 'Upload a file and record exactly what it is used for.'}
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
              <div className='space-y-5'>
                {isContextLocked ? (
                  <Alert>
                    <LockKeyhole />
                    <AlertTitle>Signed agreement details are locked</AlertTitle>
                    <AlertDescription>
                      You can still edit the title, purpose, and description.
                      Remove the signed status before changing its property,
                      unit, tenant, or lease terms.
                    </AlertDescription>
                  </Alert>
                ) : null}

                <FormSection
                  title='Document details'
                  description='Give the file a clear name and explain why the organization keeps it.'
                >
                  <div className='grid gap-5 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='type'
                      render={({ field }) => (
                        <FormItem className='sm:col-span-2'>
                          <FormLabel>Document type</FormLabel>
                          <Select
                            value={field.value}
                            disabled={isEditing || isSaving}
                            onValueChange={(value) => {
                              const nextType = value as DocumentType
                              field.onChange(nextType)
                              if (nextType === 'lease') {
                                form.setValue('requires_signature', true, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select a document type' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DOCUMENT_TYPE_OPTIONS.map((option) => (
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
                          {isEditing ? (
                            <FormDescription>
                              The document type cannot be changed after upload.
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
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g. Lease — Apartment 4B'
                              disabled={isSaving}
                              {...field}
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
                          <FormLabel>Used for</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g. Current residential tenancy'
                              disabled={isSaving}
                              {...field}
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Optional internal context or notes about this file.'
                              rows={3}
                              disabled={isSaving}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSection>

                <FormSection
                  title='Used for'
                  description={
                    selectedType === 'lease'
                      ? 'Connect the agreement to the property and unit it governs.'
                      : 'Optionally connect the file to a property or unit. Leave both empty for organization-wide safekeeping.'
                  }
                >
                  <div className='grid gap-5 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='property_id'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property</FormLabel>
                          <Select
                            value={field.value ? String(field.value) : NONE_VALUE}
                            disabled={
                              isSaving || isContextLocked || isLoadingProperties
                            }
                            onValueChange={(value) => {
                              const nextPropertyId =
                                value === NONE_VALUE ? null : Number(value)
                              field.onChange(nextPropertyId)

                              const currentUnitId = form.getValues('unit_id')
                              const unitBelongsToProperty = properties
                                .find(
                                  (property) =>
                                    property.id === nextPropertyId
                                )
                                ?.units?.some(
                                  (unit) => unit.id === currentUnitId
                                )

                              if (!unitBelongsToProperty) {
                                form.setValue('unit_id', null, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select a property' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>
                                Organization only
                              </SelectItem>
                              {document?.property &&
                              !properties.some(
                                (property) =>
                                  property.id === document.property?.id
                              ) ? (
                                <SelectItem value={String(document.property.id)}>
                                  {document.property.title}
                                </SelectItem>
                              ) : null}
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
                          <FormLabel>Unit</FormLabel>
                          <Select
                            value={field.value ? String(field.value) : NONE_VALUE}
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
                                  placeholder={
                                    selectedPropertyId
                                      ? 'Select a unit'
                                      : 'Select a property first'
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={NONE_VALUE}>
                                No specific unit
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
                  </div>
                </FormSection>

                {selectedType === 'lease' ? (
                  <FormSection
                    title='Lease terms'
                    description='Record the tenant, agreement period, and financial terms alongside the uploaded lease.'
                  >
                    <div className='grid gap-5 sm:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='lease.tenant_contact_id'
                        render={({ field }) => (
                          <FormItem className='sm:col-span-2'>
                            <FormLabel>Tenant</FormLabel>
                            <Select
                              value={
                                field.value
                                  ? String(field.value)
                                  : NONE_VALUE
                              }
                              disabled={
                                isSaving || isContextLocked || isLoadingContacts
                              }
                              onValueChange={(value) =>
                                field.onChange(
                                  value === NONE_VALUE ? null : Number(value)
                                )
                              }
                            >
                              <FormControl>
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder='Select a tenant' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={NONE_VALUE}>
                                  Select a tenant
                                </SelectItem>
                                {currentTenantMissing &&
                                document?.lease?.tenant_contact_id ? (
                                  <SelectItem
                                    value={String(
                                      document.lease.tenant_contact_id
                                    )}
                                  >
                                    {document.lease.tenant.name}
                                  </SelectItem>
                                ) : null}
                                {tenants.map((tenant) => (
                                  <SelectItem
                                    key={tenant.id}
                                    value={String(tenant.id)}
                                  >
                                    {tenant.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {tenants.length === 0 && !isLoadingContacts ? (
                              <FormDescription>
                                Add a tenant contact before creating a lease.
                              </FormDescription>
                            ) : null}
                            {document?.lease &&
                            !document.lease.tenant_contact_id ? (
                              <FormDescription>
                                Original tenant: {document.lease.tenant.name}
                              </FormDescription>
                            ) : null}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='lease.starts_on'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starts on</FormLabel>
                            <FormControl>
                              <Input
                                type='date'
                                disabled={isSaving || isContextLocked}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='lease.ends_on'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ends on</FormLabel>
                            <FormControl>
                              <Input
                                type='date'
                                disabled={isSaving || isContextLocked}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='lease.rent_amount'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rent amount</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min='0'
                                step='0.01'
                                inputMode='decimal'
                                placeholder='0.00'
                                disabled={isSaving || isContextLocked}
                                value={field.value ?? ''}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                                onChange={(event) =>
                                  field.onChange(
                                    event.target.value === ''
                                      ? null
                                      : Number(event.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='lease.security_deposit'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security deposit</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min='0'
                                step='0.01'
                                inputMode='decimal'
                                placeholder='Optional'
                                disabled={isSaving || isContextLocked}
                                value={field.value ?? ''}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                                onChange={(event) =>
                                  field.onChange(
                                    event.target.value === ''
                                      ? null
                                      : Number(event.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='lease.notes'
                        render={({ field }) => (
                          <FormItem className='sm:col-span-2'>
                            <FormLabel>Lease notes</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder='Optional renewal, payment, or tenancy notes.'
                                disabled={isSaving || isContextLocked}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormSection>
                ) : null}

                <FormSection
                  title='File and signature'
                  description='Keep the original file private and record whether a separate signed copy is required.'
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
                          label='Original document'
                          accept={DOCUMENT_ACCEPT}
                          required={!isEditing}
                          disabled={isEditing || isSaving}
                          currentFile={document?.files.original ?? null}
                          description={
                            isEditing
                              ? 'The original file is preserved and cannot be replaced while editing this record.'
                              : 'PDF, Word, spreadsheet, text, or image. Maximum 10 MB.'
                          }
                          error={fieldState.error?.message}
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='requires_signature'
                      render={({ field }) => (
                        <FormItem className='flex items-start justify-between gap-4 rounded-lg border px-4 py-3'>
                          <div className='space-y-1'>
                            <FormLabel className='cursor-pointer'>
                              Requires signature
                            </FormLabel>
                            <FormDescription>
                              {selectedType === 'lease'
                                ? 'Leases always require a signature record.'
                                : 'Track whether a separate signed copy has been received.'}
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
                                  form.setValue('is_signed', false, {
                                    shouldDirty: true,
                                  })
                                  form.setValue('signed_file', null, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  })
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!isEditing && requiresSignature ? (
                      <FormField
                        control={form.control}
                        name='is_signed'
                        render={({ field }) => (
                          <FormItem className='flex items-start justify-between gap-4 rounded-lg border px-4 py-3'>
                            <div className='space-y-1'>
                              <FormLabel className='cursor-pointer'>
                                Already signed
                              </FormLabel>
                              <FormDescription>
                                Turn this on only when you can upload the signed
                                copy now.
                              </FormDescription>
                              <FormMessage />
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                disabled={isSaving}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked)
                                  if (!checked) {
                                    form.setValue('signed_file', null, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    })
                                  }
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
                            label='Signed copy'
                            accept={SIGNED_DOCUMENT_ACCEPT}
                            required
                            disabled={isSaving}
                            description='Upload the completed signed copy separately from the original.'
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                    ) : null}

                    {isEditing ? (
                      <Alert>
                        <FileLock2 />
                        <AlertTitle>Files are managed separately</AlertTitle>
                        <AlertDescription>
                          The original stays unchanged. Use the document actions
                          to add or remove its signed copy.
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </div>
                </FormSection>
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
                {isEditing ? 'Save changes' : 'Add document'}
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
