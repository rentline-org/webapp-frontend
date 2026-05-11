import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { useResetPassword } from '../query'
import {
  type INewPasswordRequest,
  newPasswordSchema,
  type TNewPasswordSchema,
} from '../types'

type Props = {
  token: string
  email: string
}

const routeApi = getRouteApi('/(auth)/password-reset/$token/')

const ResetPasswordForm = ({ token, email }: Props) => {
  const navigate = routeApi.useNavigate()
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword()

  const form = useForm<TNewPasswordSchema>({
    mode: 'onTouched',
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      password_confirmation: '',
    },
  })

  const onSubmit = (data: TNewPasswordSchema) => {
    const payload = {
      ...data,
      email,
      token,
    } satisfies INewPasswordRequest

    resetPassword(payload, {
      onSuccess(result) {
        toast.success(result.status)

        navigate({
          to: '/sign-in',
        })
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input {...field} type='password' />
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
              <FormLabel>Confirm new password</FormLabel>

              <FormControl>
                <Input {...field} type='password' />
              </FormControl>
              <FormDescription>
                This must be the same as the new password
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className='mt-2' type='submit' disabled={isResetting}>
          {isResetting ? (
            <>
              <Loader2 className='animate-spin' />
              Saving...
            </>
          ) : (
            <>Save changes</>
          )}
        </Button>
      </form>
    </Form>
  )
}

export default ResetPasswordForm
