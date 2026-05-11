import { getRouteApi } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'
import ResendOtpCode from './components/resend-otp-code'

const routeApi = getRouteApi('/(auth)/otp')

export function Otp() {
  const { email } = routeApi.useSearch()

  return (
    <AuthLayout showLogo>
      <Card className='max-w-md gap-4 md:min-w-lg'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>
            Verify your email address
          </CardTitle>
          <CardDescription>
            An authentication code was sent your email <br />
            Please enter the code below to confirm your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter>
          <ResendOtpCode email={email} />
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
