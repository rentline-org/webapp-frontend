import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  const [linkSentSuccessfully, setLinkSentSuccessfully] = useState<{
    sent: boolean
    status: string
  }>({
    sent: false,
    status: '',
  })

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4 sm:min-w-sm'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            {linkSentSuccessfully.sent ? 'Check your email' : 'Forgot Password'}
          </CardTitle>
          <CardDescription>
            {linkSentSuccessfully.sent
              ? linkSentSuccessfully.status
              : 'Enter your registered email and we will send you a link to reset your password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!linkSentSuccessfully.sent && (
            <ForgotPasswordForm setLinkStatus={setLinkSentSuccessfully} />
          )}
        </CardContent>
        {!linkSentSuccessfully.sent && (
          <CardFooter>
            <p className='mx-auto px-8 text-center text-sm text-balance text-muted-foreground'>
              Don't have an account?{' '}
              <Link
                to='/sign-up'
                className='underline underline-offset-4 hover:text-primary'
              >
                Sign up
              </Link>
              .
            </p>
          </CardFooter>
        )}
      </Card>
    </AuthLayout>
  )
}
