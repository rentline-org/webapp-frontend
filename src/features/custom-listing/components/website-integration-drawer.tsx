import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { type Resolver, useForm } from 'react-hook-form'
import { CheckCircle2, ChevronRight, Loader2, Sparkles, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer, DrawerClose,
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

type DrawerMode = 'create' | 'edit'
type DrawerScreen = 'form' | 'properties'

type WebsiteIntegrationDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: DrawerMode
  initialValues?: Partial<TWebsiteIntegrationSchema>
  initialPropertyIds?: string[]
  onSubmit?: (values: TWebsiteIntegrationSchema) => void | Promise<void>
}

function WebsiteIntegrationDrawer({
  open,
  onOpenChange,
  mode,
  initialValues,
  initialPropertyIds,
  onSubmit,
}: WebsiteIntegrationDrawerProps) {
  const [screen, setScreen] = useState<DrawerScreen>('form')

  const form = useForm<TWebsiteIntegrationSchema>({
    resolver: zodResolver(websiteIntegrationSchema) as Resolver<TWebsiteIntegrationSchema>,
    defaultValues: {
      headline: '',
      domain: '',
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
      domain: initialValues?.domain ?? '',
      contact_email: initialValues?.contact_email ?? '',
      contact_phone: initialValues?.contact_phone ?? '',
      is_published: initialValues?.is_published ?? true,
      property_ids: initialPropertyIds ?? initialValues?.property_ids ?? [],
      ...initialValues,
    })

    setScreen('form')
  }, [open, initialValues, initialPropertyIds, form])

  const propertyIds = form.watch('property_ids') ?? []

  const isSaving = false

  const submit = form.handleSubmit(async (values) => {
    await onSubmit?.(values)
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
                              name='domain'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Domain</FormLabel>

                                  <FormControl>
                                    <Input
                                      placeholder='example.com'
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

                          <div className='rounded-2xl border bg-muted/20 p-5'>
                            <div className='mb-5 flex items-start justify-between gap-4'>
                              <div>
                                <h3 className='text-sm font-medium'>
                                  Properties
                                </h3>

                                <p className='mt-1 text-sm text-muted-foreground'>
                                  Select the properties connected to this
                                  integration.
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

                          <div className='rounded-2xl border p-5'>
                            <div className='flex items-center gap-2 text-sm font-medium'>
                              <Sparkles className='h-4 w-4 text-muted-foreground' />
                              Quick summary
                            </div>

                            <div className='mt-4 grid gap-3 lg:grid-cols-3'>
                              <div className='rounded-xl bg-muted/40 p-3 text-sm'>
                                <div className='text-muted-foreground'>
                                  Mode
                                </div>

                                <div className='mt-1 font-medium'>{mode}</div>
                              </div>

                              <div className='rounded-xl bg-muted/40 p-3 text-sm'>
                                <div className='text-muted-foreground'>
                                  Properties
                                </div>

                                <div className='mt-1 font-medium'>
                                  {propertyIds.length}
                                </div>
                              </div>

                              <div className='rounded-xl bg-muted/40 p-3 text-sm'>
                                <div className='text-muted-foreground'>
                                  Status
                                </div>

                                <div className='mt-1 font-medium'>Draft</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <DrawerFooter className='border-t px-8 py-5 flex items-center gap-2'>
                        <Button
                          type='submit'
                          className='gap-2'
                          disabled={isSaving}
                          size="lg"
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

                        {/*<DrawerClose asChild>*/}
                        {/*  <Button type='button' variant='outline' size="lg">*/}
                        {/*    Cancel*/}
                        {/*  </Button>*/}
                        {/*</DrawerClose>*/}
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
