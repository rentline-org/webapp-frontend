import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { useRequestPasswordReset } from '../query'
import {
  passwordResetLinkSchema,
  type TPasswordResetLinkSchema,
} from '../types'

type Props = {
  setLinkStatus: (status: { sent: boolean; status: string }) => void
}

export function ForgotPasswordForm({ setLinkStatus }: Props) {
  const { mutate, isPending } = useRequestPasswordReset()

  const form = useForm<TPasswordResetLinkSchema>({
    resolver: zodResolver(passwordResetLinkSchema),
    defaultValues: { email: '' },
  })

  function onSubmit(data: TPasswordResetLinkSchema) {
    mutate(data, {
      onSuccess(result) {
        setLinkStatus({
          sent: true,
          status: result.status,
        })

        form.reset()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-2')}>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isPending} type='submit'>
          {isPending && <Loader2 className='animate-spin' />}
          Continue
        </Button>
      </form>
    </Form>
  )
}
