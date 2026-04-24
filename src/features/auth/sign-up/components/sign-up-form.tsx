/* eslint-disable no-console */
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { IconFacebook } from '@/assets/brand-icons'
import IconGoogle from '@/assets/brand-icons/icon-google'
import { sleep, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PasswordInput } from '@/components/password-input'

const routeApi = getRouteApi('/(auth)/sign-up')

const formSchema = z
  .object({
    firstName: z.string().min(1, 'Please enter your first name.'),
    lastName: z.string().min(1, 'Please enter your last name.'),
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email.' : undefined,
    }),
    role: z.enum(['landlord', 'tenant']),
    password: z
      .string()
      .min(1, 'Please enter your password.')
      .min(7, 'Password must be at least 7 characters long.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'landlord',
    },
  })

  const navigate = routeApi.useNavigate()

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log(data)

    toast.promise(sleep(2000), {
      loading: 'Creating account...',
      success: () => {
        setIsLoading(false)

        navigate({
          to: '/otp',
          params: { email: data.email },
        })
        // routeApi.redirect({
        //   to: '/otp',
        //   params: { email: data.email },
        // })
      },
      error: 'Error',
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        <div className='grid w-full grid-cols-2 gap-x-2'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder='John' {...field} className='w-full' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder='Doe' {...field} className='w-full' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} type='email' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='role'
          defaultValue='landlord'
          render={({ field: { onChange, ...roleField } }) => (
            <FormItem>
              <FormLabel>How will you use Rentline?</FormLabel>
              <FormControl>
                <RadioGroup
                  className='flex max-w-md'
                  {...roleField}
                  value={roleField.value}
                  onValueChange={(value) => onChange(value)}
                >
                  <FieldLabel htmlFor='plus-plan'>
                    <Field orientation='horizontal'>
                      <FieldContent>
                        <FieldTitle>Landlord</FieldTitle>
                        <FieldDescription>For Property Owners</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value='landlord' id='landlord-plan' />
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor='tenants'>
                    <Field orientation='horizontal'>
                      <FieldContent>
                        <FieldTitle>Tenant</FieldTitle>
                        <FieldDescription>
                          For individuals renting a property
                        </FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value='tenant' id='tenants-plan' />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <UserPlus />}
          Create Account
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={isLoading}
          >
            <IconGoogle className='h-4 w-4' /> Google
          </Button>
          <Button
            variant='outline'
            className='w-full'
            type='button'
            disabled={isLoading}
          >
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
