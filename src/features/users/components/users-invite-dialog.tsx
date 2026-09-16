import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2, MailPlus, Send } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError } from '@/api/errors'
import { getAppLocale } from '@/i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { useGetContacts } from '@/features/contacts/query'
import { useCreateOrganizationInvitation } from '@/features/organization-access/query'
import type { OrganizationMemberRole } from '@/features/organization-access/types'

const formSchema = z
  .object({
    email: z.email({
      error: (issue) =>
        issue.input === '' ? 'Please enter an email to invite.' : undefined,
    }),
    role: z.enum(['admin', 'manager', 'agent', 'tenant'], {
      error: 'Role is required.',
    }),
    locale: z.enum(['en', 'pt-BR']),
    contact_id: z.number().int().positive().optional(),
  })
  .superRefine((value, context) => {
    if (value.role === 'tenant' && !value.contact_id) {
      context.addIssue({
        code: 'custom',
        path: ['contact_id'],
        message: 'Select the tenant contact that will receive access.',
      })
    }
  })

type UserInviteForm = z.infer<typeof formSchema>

type UserInviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersInviteDialog({
  open,
  onOpenChange,
}: UserInviteDialogProps) {
  const { t } = useTranslation('invitations')
  const { data: contacts = [], isPending: contactsPending } = useGetContacts()
  const createInvitation = useCreateOrganizationInvitation()
  const form = useForm<UserInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      locale: getAppLocale(),
    },
  })
  const selectedRole = form.watch('role')

  const onSubmit = (values: UserInviteForm) => {
    createInvitation.mutate(values, {
      onSuccess: () => {
        toast.success(t('admin.sent'))
        form.reset()
        onOpenChange(false)
      },
      onError: (error) => {
        if (!(error instanceof ApiError) || !error.errors) return

        for (const [field, messages] of Object.entries(error.errors)) {
          if (field in form.getValues() && messages[0]) {
            form.setError(field as keyof UserInviteForm, {
              message: messages[0],
            })
          }
        }
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <MailPlus /> {t('admin.title')}
          </DialogTitle>
          <DialogDescription>{t('admin.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='user-invite-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='name@example.com'
                      disabled={selectedRole === 'tenant'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.role')}</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={(value) => {
                      field.onChange(value as OrganizationMemberRole)
                      form.setValue('contact_id', undefined)
                      if (value === 'tenant') form.setValue('email', '')
                    }}
                    placeholder={t('admin.rolePlaceholder')}
                    items={(['admin', 'manager', 'agent', 'tenant'] as const).map(
                      (role) => ({
                        label: t(`roles.${role}`),
                        value: role,
                      })
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedRole === 'tenant' && (
              <FormField
                control={form.control}
                name='contact_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.contact')}</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value?.toString()}
                      onValueChange={(value) => {
                        const contact = contacts.find(
                          (item) => item.id === Number(value)
                        )
                        field.onChange(Number(value))
                        form.setValue('email', contact?.email ?? '', {
                          shouldValidate: true,
                        })
                      }}
                      placeholder={t('admin.contactPlaceholder')}
                      isPending={contactsPending}
                      items={contacts
                        .filter(
                          (contact) => contact.type === 'tenant' && contact.email
                        )
                        .map((contact) => ({
                          label: `${contact.name} · ${contact.email}`,
                          value: contact.id.toString(),
                        }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name='locale'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.language')}</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    isControlled
                    items={[
                      { label: 'English', value: 'en' },
                      { label: 'Português (Brasil)', value: 'pt-BR' },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>{t('admin.cancel')}</Button>
          </DialogClose>
          <Button
            type='submit'
            form='user-invite-form'
            disabled={createInvitation.isPending}
          >
            {createInvitation.isPending ? (
              <Loader2 className='animate-spin' />
            ) : (
              <Send />
            )}
            {t('admin.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
