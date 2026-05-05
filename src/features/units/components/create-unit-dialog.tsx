import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/date-picker'
import type { IProperty } from '@/features/properties/types'
import { useCreateUnit } from '../query'
import { type TCreateUnitSchema, createUnitSchema } from '../types'
import { getUnitTypes } from '../types/constants'

type Props = {
  property: IProperty
}

export function CreateUnitDialog({ property }: Props) {
  const [open, setOpen] = useState(false)
  const { mutate: createUnit, isPending: isCreating } = useCreateUnit(property)

  const form = useForm<TCreateUnitSchema>({
    resolver: zodResolver(createUnitSchema) as Resolver<TCreateUnitSchema>,
    mode: 'onTouched',
    defaultValues: {
      name: '',
      description: '',
      unit_type: 'house',

      is_available: true,
      is_furnished: false,
      is_pet_friendly: false,

      rent_price: null,
      sale_price: null,

      bedrooms: 1,
      bathrooms: 1,
      square_feet: 0,

      amenities: [],
      available_from: new Date(),
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const isAvailable = form.watch('is_available')

  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  const submit = async (data: TCreateUnitSchema) => {
    createUnit(data, {
      onSuccess: async (result) => {
        toast.success(`Unit ${result.name} created`)
        setOpen(false)
        form.reset()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='mr-2 size-4' />
          Add unit
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Create unit</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className='space-y-6'>
            {/* BASIC */}
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Unit name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Description'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='unit_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full capitalize'>
                          <SelectValue
                            placeholder='Unit type'
                            className='w-full capitalize'
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getUnitTypes().map((u) => (
                          <SelectItem
                            key={u.label}
                            value={u.value}
                            className='capitalize'
                          >
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PRICING */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='rent_price'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Rent price</FormLabel>
                    <FormControl>
                      <InputWithEndButtons
                        {...field}
                        value={field.value ?? 0}
                        onChange={(v) => field.onChange(v)}
                        onBlur={field.onBlur}
                        currency='BRL'
                        autoFormat
                      />
                    </FormControl>
                    {fieldState.error && (
                      <p className='text-sm font-medium text-destructive'>
                        {fieldState.error.message}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='sale_price'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Sale price (Optional)</FormLabel>
                    <FormControl>
                      <InputWithEndButtons
                        {...field}
                        value={field.value ?? 0}
                        onChange={(v) => field.onChange(v === 0 ? null : v)}
                        onBlur={field.onBlur}
                        autoFormat
                        currency='BRL'
                      />
                    </FormControl>
                    {fieldState.error && (
                      <p className='text-sm font-medium text-destructive'>
                        {fieldState.error.message}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* DETAILS */}
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='bedrooms'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <InputWithEndButtons
                        {...field}
                        value={field.value ?? 0}
                        onChange={(v) => field.onChange(v === 0 ? null : v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bathrooms'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <InputWithEndButtons
                        {...field}
                        value={field.value ?? 0}
                        onChange={(v) => field.onChange(v === 0 ? null : v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='square_feet'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Square feet</FormLabel>
                    <FormControl>
                      <InputWithEndButtons
                        {...field}
                        value={field.value ?? 0}
                        onChange={(v) => field.onChange(v === 0 ? null : v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* FLAGS */}
            <div className='flex flex-col gap-3'>
              {(['is_available', 'is_furnished'] as const).map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName}
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between'>
                      <FormLabel className='capitalize'>
                        {fieldName.replace('_', ' ')}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* DATE */}
            {isAvailable && (
              <FormField
                control={form.control}
                name='available_from'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available from</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value}
                        onSelect={field.onChange}
                        placeholder='Select date'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* ACTIONS */}
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button type='submit' disabled={isCreating}>
                {isCreating && <Loader2 className='mr-2 size-4 animate-spin' />}
                Create unit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
