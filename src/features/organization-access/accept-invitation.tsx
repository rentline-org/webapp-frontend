import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Loader2, MailWarning } from 'lucide-react'
import { ApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { AuthLayout } from '@/features/auth/auth-layout'
import {
  useAcceptOrganizationInvitation,
  useOrganizationInvitation,
} from './query'

const acceptanceSchema = z
  .object({
    name: z.string().trim().min(2).max(255),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((value) => value.password === value.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords do not match.',
  })

type AcceptanceForm = z.infer<typeof acceptanceSchema>

export function AcceptInvitation({ token }: { token: string }) {
  const { t } = useTranslation('invitations')
  const invitation = useOrganizationInvitation(token)
  const acceptInvitation = useAcceptOrganizationInvitation()
  const [accepted, setAccepted] = useState(false)
  const form = useForm<AcceptanceForm>({
    resolver: zodResolver(acceptanceSchema),
    defaultValues: {
      name: '',
      password: '',
      password_confirmation: '',
    },
  })

  function submit(payload: AcceptanceForm) {
    acceptInvitation.mutate(
      { token, payload },
      {
        onSuccess: () => setAccepted(true),
        onError: (error) => {
          if (!(error instanceof ApiError) || !error.errors) return

          for (const [field, messages] of Object.entries(error.errors)) {
            if (field in form.getValues() && messages[0]) {
              form.setError(field as keyof AcceptanceForm, {
                message: messages[0],
              })
            }
          }
        },
      }
    )
  }

  if (invitation.isPending) {
    return (
      <AuthLayout showLogo>
        <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
          <Loader2 className='size-4 animate-spin' />
          {t('accept.loading')}
        </div>
      </AuthLayout>
    )
  }

  if (!token || invitation.isError || !invitation.data) {
    return (
      <AuthLayout showLogo>
        <Card className='w-[calc(100vw-2rem)] max-w-md'>
          <CardHeader>
            <MailWarning className='mb-2 size-8 text-destructive' />
            <CardTitle>{t('accept.title')}</CardTitle>
            <CardDescription>{t('accept.expired')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className='w-full'>
              <Link to='/sign-in'>{t('accept.signIn')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </AuthLayout>
    )
  }

  if (accepted) {
    return (
      <AuthLayout showLogo>
        <Card className='w-[calc(100vw-2rem)] max-w-md'>
          <CardHeader className='text-center'>
            <CheckCircle2 className='mx-auto mb-2 size-10 text-emerald-600' />
            <CardTitle>{t('accept.accepted')}</CardTitle>
            <CardDescription>
              {invitation.data.organization.title}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className='w-full'>
              <Link to='/sign-in'>{t('accept.signIn')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout showLogo>
      <Card className='w-[calc(100vw-2rem)] max-w-md'>
        <CardHeader>
          <CardTitle>{t('accept.title')}</CardTitle>
          <CardDescription>
            {t('accept.description')}
            <span className='mt-3 block rounded-md bg-muted px-3 py-2 text-foreground'>
              {invitation.data.organization.title} ·{' '}
              {t(`roles.${invitation.data.role}`)}
              <br />
              <span className='text-muted-foreground'>
                {invitation.data.email}
              </span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id='accept-invitation-form'
              className='space-y-4'
              onSubmit={form.handleSubmit(submit)}
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('accept.name')}</FormLabel>
                    <FormControl>
                      <Input autoComplete='name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('accept.password')}</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete='new-password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password_confirmation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('accept.confirm')}</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete='new-password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            form='accept-invitation-form'
            type='submit'
            className='w-full'
            disabled={acceptInvitation.isPending}
          >
            {acceptInvitation.isPending && <Loader2 className='animate-spin' />}
            {t('accept.accept')}
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
