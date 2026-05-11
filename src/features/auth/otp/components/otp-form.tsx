import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { useVerifyOtpMutation } from '../query'
import { otpFormSchema, type TOtpFormSchema } from '../types'

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>

const routeApi = getRouteApi('/(auth)/otp')

export function OtpForm({ className, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const { isPending, mutate } = useVerifyOtpMutation()
  const { email } = routeApi.useSearch()

  const { setUser } = useAuthStore((s) => s.auth)

  const form = useForm<TOtpFormSchema>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: '' },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const otp = form.watch('otp')

  function onSubmit(schema: TOtpFormSchema) {
    mutate(
      { email, schema },
      {
        onSuccess: (data) => {
          if (data?.user) {
            setUser(data.user)

            if (data?.user.active_organization === null) {
              navigate({
                to: '/onboarding',
                replace: true,
              })

              toast.success(data?.message ?? 'OTP verified successfully!')
              navigate({ to: '/', replace: true })
            }
          }
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='otp'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className='mt-2'
          type='submit'
          disabled={otp.length < 6 || isPending}
        >
          {isPending ? <Loader2 className='animate-spin' /> : null}
          Verify
        </Button>
      </form>
    </Form>
  )
}
