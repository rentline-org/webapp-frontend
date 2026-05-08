import { format } from 'date-fns'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Loader2, MailWarning } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DatePicker } from '@/components/date-picker'
import { invalidateUserProfile, useUpdateUserProfile } from './query'
import {
  type IUserProfileData,
  profileFormSchema,
  type TProfileFormSchema,
} from './types'

const defaultValues: Partial<TProfileFormSchema> = {
  phone: '',
  dob: null,
}

type ProfileFormProps = {
  user: IUserProfileData
}

export function ProfileForm({ user }: ProfileFormProps) {
  const queryClient = useQueryClient()
  const { mutate: updateProfile, isPending } = useUpdateUserProfile()

  const form = useForm<TProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      ...defaultValues,
      ...user,
      dob: user?.dob ? new Date(user.dob) : null,
    },
    mode: 'onChange',
  })

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  const onSubmit = (data: TProfileFormSchema) => {
    updateProfile(
      {
        ...data,
        name: `${data.first_name} ${data.last_name}`,
        dob: data.dob ? format(data.dob, 'yyyy-MM-dd') : null,
      },
      {
        async onSuccess() {
          await invalidateUserProfile(queryClient)
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='space-y-8'>
          <div className='grid w-full grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='first_name'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input className='w-full' placeholder='James' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='last_name'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input className='w-full' placeholder='Orion' {...field} />
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
                  <Input {...field} type='email' />
                </FormControl>
                <FormDescription>
                  {user.email_verified_at ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={
                            user.email_verified_at ? 'success' : 'warning'
                          }
                        >
                          <BadgeCheck /> Email Verified
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        Verified at:{' '}
                        {format(user.email_verified_at, 'dd/MM/yyyy')}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <MailWarning /> Email not verified
                    </>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                {user.phone && user.phone_verified_at && (
                  <FormDescription>
                    <Badge variant='success'>
                      <BadgeCheck /> Phone Verified
                    </Badge>
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dob'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth (Optional)</FormLabel>
                <FormControl>
                  <DatePicker
                    {...field}
                    selected={field.value ?? undefined}
                    onSelect={(d) => field.onChange(d)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`urls.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>
                      URLs
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && 'sr-only')}>
                      Add links to your website, blog, or social media profiles.
                    </FormDescription>
                    <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={() => append({ value: '' })}
            >
              Add URL
            </Button>
          </div>
        </div>
        <div className='mt-8 space-y-4'>
          <Separator />
          <Button size='lg' type='submit' disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='animate-spin' />
                Updating profile
              </>
            ) : (
              <>Update profile</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
