import { getRouteApi } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import ResetPasswordForm from './components/reset-password-form'

const routeApi = getRouteApi('/(auth)/password-reset/$token/')

const ResetPassword = () => {
  const { token } = routeApi.useParams()
  const { email } = routeApi.useSearch()

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-6 sm:min-w-sm'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Reset your password
          </CardTitle>
          <CardDescription>
            Enter your new password below to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm email={email} token={token} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

export default ResetPassword
