import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { type Resolver, useForm } from 'react-hook-form'
import { CheckCircle2, ChevronRight, Loader2, XIcon } from 'lucide-react'

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
  type TWebsiteIntegrationSchema,
  websiteIntegrationSchema,
} from '@/features/custom-listing/types'

import PropertySelectionScreen from '@/features/custom-listing/components/property-selection-form'
import SelectedPropertiesPreview from '@/features/custom-listing/components/selected-properties-preview'
import InputDomainAddons from '@/components/ui/input-domain-addons'
import { useAuthStore } from '@/stores/auth-store'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateWebsiteIntegration } from '../query'
import { invalidateListing } from '@/features/listing/query'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type DrawerMode = 'create' | 'edit'
type DrawerScreen = 'form' | 'properties'

type WebsiteIntegrationDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: DrawerMode
  initialValues?: Partial<TWebsiteIntegrationSchema>
  initialPropertyIds?: number[]
  onSubmit?: () => void
  listingId: number
}

function WebsiteIntegrationDrawer({
  open,
  onOpenChange,
  mode,
  initialValues,
  initialPropertyIds,
  onSubmit,
  listingId,
}: WebsiteIntegrationDrawerProps) {
  const [screen, setScreen] = useState<DrawerScreen>('form')
  const { user } = useAuthStore((s) => s.auth)

  const queryClient = useQueryClient()
  const { mutate, isPending: isSaving } = useCreateWebsiteIntegration()

  const orgDomainSlug = useMemo(() => {
    if (user?.active_organization) {
      return user?.active_organization.title.split(' ').join('-')
    }

    return ''
  }, [user?.active_organization])

  const form = useForm<TWebsiteIntegrationSchema>({
    resolver: zodResolver(
      websiteIntegrationSchema
    ) as Resolver<TWebsiteIntegrationSchema>,
    defaultValues: {
      headline: '',
      subdomain: orgDomainSlug,
      contact_email: '',
      contact_phone: '',
      is_published: true,
      property_ids: initialPropertyIds ?? initialValues?.property_ids ?? [],
      ...initialValues,
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      headline: initialValues?.headline ?? '',
      subdomain: initialValues?.subdomain ?? orgDomainSlug,
      contact_email: initialValues?.contact_email ?? '',
      contact_phone: initialValues?.contact_phone ?? '',
      is_published: initialValues?.is_published ?? true,
      property_ids: initialPropertyIds ?? initialValues?.property_ids ?? [],
      ...initialValues,
    })

    setScreen('form')
  }, [open, initialValues, initialPropertyIds, form, orgDomainSlug])

  // eslint-disable-next-line react-hooks/incompatible-library
  const propertyIds = form.watch('property_ids') ?? []

  const submit = form.handleSubmit((payload) => {
    mutate(
      {
        listingId,
        payload,
      },
      {
        async onSuccess() {
          await invalidateListing(queryClient)
          toast.success('Website listing!')
          onSubmit?.()
        },
      }
    )
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
      <DrawerContent className='w-full p-0 data-[vaul-drawer-direction=right]:w-150'>
        <div className='flex h-full flex-col overflow-hidden'>
          <DrawerHeader className='flex w-full flex-row items-center justify-between border-b px-8 py-6 text-left'>
            <div className='flex flex-col gap-1'>
              <DrawerTitle className='text-xl'>
                {mode === 'create'
                  ? 'Create website integration'
                  : 'Edit website integration'}
              </DrawerTitle>

              <DrawerDescription>
                Configure the website integration settings for this
                organization.
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button size='icon' variant='ghost'>
                <XIcon />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className='flex-1 overflow-hidden'>
            <AnimatePresence mode='wait' initial={false}>
              {screen === 'form' ? (
                <motion.div
                  key='integration-form'
                  className='flex h-full flex-col'
                  initial={{ x: -32, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -32, opacity: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeOut',
                  }}
                >
                  <Form {...form}>
                    <form onSubmit={submit} className='flex h-full flex-col'>
                      <div className='flex-1 overflow-y-auto px-8 py-6'>
                        <div className='mx-auto flex w-full max-w-4xl flex-col gap-8'>
                          <div className='grid gap-6'>
                            <FormField
                              control={form.control}
                              name='headline'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Headline</FormLabel>

                                  <FormControl>
                                    <Input
                                      placeholder='Your headline'
                                      {...field}
                                    />
                                  </FormControl>

                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='subdomain'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Domain</FormLabel>

                                  <FormControl>
                                    <InputDomainAddons
                                      defaultDomain={orgDomainSlug}
                                      placeholder='my-website'
                                      {...field}
                                    />
                                  </FormControl>

                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className='grid gap-6 lg:grid-cols-2'>
                              <FormField
                                control={form.control}
                                name='contact_email'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contact email</FormLabel>

                                    <FormControl>
                                      <Input
                                        placeholder='hello@example.com'
                                        {...field}
                                      />
                                    </FormControl>

                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name='contact_phone'
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contact phone</FormLabel>

                                    <FormControl>
                                      <Input
                                        placeholder='+1 555 123 4567'
                                        {...field}
                                      />
                                    </FormControl>

                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name='is_published'
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <FieldLabel>
                                    <Field orientation='horizontal'>
                                      <Checkbox
                                        onBlur={field.onBlur}
                                        disabled={field.disabled}
                                        name={field.name}
                                        checked={field.value}
                                        onCheckedChange={(checked) =>
                                          field.onChange(checked)
                                        }
                                      />
                                      <FieldContent>
                                        <FieldTitle>Published</FieldTitle>
                                        <FieldDescription>
                                          This will make your website available
                                          immediattely. This can be changed to
                                          draft later
                                        </FieldDescription>
                                      </FieldContent>
                                    </Field>
                                  </FieldLabel>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className='rounded-2xl border bg-muted/20 p-5'>
                            <div className='mb-5 flex items-start justify-between gap-4'>
                              <div>
                                <h3 className='text-sm font-medium'>
                                  Properties
                                </h3>

                                <p className='mt-1 text-sm text-muted-foreground'>
                                  Select the properties to show on your website
                                </p>
                              </div>

                              <Button
                                type='button'
                                variant='outline'
                                className='gap-2'
                                onClick={() => setScreen('properties')}
                              >
                                {propertyIds.length
                                  ? 'Manage properties'
                                  : 'Select properties'}

                                <ChevronRight className='h-4 w-4' />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name='property_ids'
                              render={() => (
                                <FormItem>
                                  <FormControl>
                                    <SelectedPropertiesPreview
                                      propertyIds={propertyIds}
                                    />
                                  </FormControl>

                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <DrawerFooter className='flex items-center gap-2 border-t px-8 py-5'>
                        <Button
                          type='submit'
                          className='gap-2'
                          disabled={isSaving}
                          size='lg'
                        >
                          {isSaving ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <CheckCircle2 className='h-4 w-4' />
                          )}

                          {mode === 'create'
                            ? 'Create integration'
                            : 'Save changes'}
                        </Button>
                      </DrawerFooter>
                    </form>
                  </Form>
                </motion.div>
              ) : (
                <PropertySelectionScreen
                  selectedIds={propertyIds}
                  onSelect={(propertyIds) => {
                    form.setValue('property_ids', propertyIds, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })

                    setScreen('form')
                  }}
                  onBack={() => setScreen('form')}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default WebsiteIntegrationDrawer
