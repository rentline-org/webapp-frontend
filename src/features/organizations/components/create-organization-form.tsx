import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
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
import InputWithEndButtons from '@/components/ui/input-number'
import { Textarea } from '@/components/ui/textarea'
import { invalidateUserProfile } from '@/features/settings/profile/query'
import { useHandleCreationOrganization } from '../query'
import {
  createOrganizationSchema,
  type TCreateOrganizationSchema,
} from '../types'

type Props = {
  isTrial?: boolean
  isEdit?: boolean
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
}

const CreateOrganizationForm = ({
  isTrial = false,
  modalOpen = false,
  setModalOpen,
}: Props) => {
  const queryClient = useQueryClient()
  const { useNavigate } = getRouteApi('/(auth)/onboarding')

  const navigate = useNavigate()

  const { mutate, isPending } = useHandleCreationOrganization()

  const form = useForm<TCreateOrganizationSchema>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      number_of_properties: 1,
      setActive: true,
    },
  })

  const onSubmit = (data: TCreateOrganizationSchema) => {
    mutate(data, {
      async onSuccess() {
        await invalidateUserProfile(queryClient)
        toast.success('Organized Created!')

        if (data.setActive) {
          navigate({
            to: '/',
          })
        }

        if (setModalOpen && modalOpen) {
          setModalOpen(false)
        }
      },
    })
  }

  return (
    <Form {...form}>
      <form className='grid gap-3' onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid w-full grid-cols-2 gap-x-4'>
          <FormField
            name='name'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='My Organization' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='email'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder='name@example.com'
                    {...field}
                    type='email'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='About my business' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isTrial && (
          <FormField
            control={form.control}
            name='number_of_properties'
            render={({ field }) => (
              <FormItem>
                <FormLabel>How many properties do you have?</FormLabel>
                <FormControl>
                  <InputWithEndButtons {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name='setActive'
          render={({ field: { onChange, value, ...fieldProps } }) => (
            <FormItem>
              <FormControl>
                <Field orientation='horizontal'>
                  <Checkbox
                    id='terms-checkbox-2'
                    {...fieldProps}
                    checked={value}
                    onCheckedChange={(c) => onChange(c)}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor='terms-checkbox-2'>
                      Set as active
                    </FieldLabel>
                    <FieldDescription>
                      Enables the organization by default
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2 className='animate-spin' />}
          Save Changes
        </Button>
      </form>
    </Form>
  )
}

export default CreateOrganizationForm
