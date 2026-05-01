import { type UseFormReturn } from 'react-hook-form'
import { DollarSign } from 'lucide-react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import InputWithEndButtons from '@/components/ui/input-number'
import type { TCreatePropertySchema } from '../types'

interface PricingStepProps {
  form: UseFormReturn<TCreatePropertySchema>
  isHouse: boolean
  isApartment: boolean
  isLand: boolean
}

function NumberField({
  form,
  name,
  label,
}: {
  form: UseFormReturn<TCreatePropertySchema>
  name: 'rent_price' | 'sale_price' | 'buy_price'
  label: string
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <InputWithEndButtons
              minValue={0}
              step={0.01}
              value={field.value ?? 0}
              onChange={(e) => field.onChange(e)}
              onBlur={field.onBlur}
              name={field.name}
              currency='BRL'
              autoFormat
              locale='pt-BR'
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const PricingStep = ({
  form,
  isHouse,
  isApartment,
  isLand,
}: PricingStepProps) => {
  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-2'>
        <DollarSign className='size-5 text-muted-foreground' />
        <h3 className='text-lg font-semibold'>Pricing</h3>
      </div>

      <div className='rounded-lg border bg-muted/50 p-4 text-sm'>
        {isHouse && (
          <p className='text-muted-foreground'>
            Houses can be offered for rent, sale, or purchase. Set the
            applicable prices below.
          </p>
        )}
        {isApartment && (
          <p className='text-muted-foreground'>
            Apartment pricing is typically managed at the unit level. Set
            building-level pricing here if needed; individual unit pricing can
            be added in the next step.
          </p>
        )}
        {isLand && (
          <p className='text-muted-foreground'>
            Land can only be sold or purchased, not rented. Configure pricing
            for sale and/or purchase.
          </p>
        )}
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {isHouse && (
          <NumberField
            form={form}
            name='rent_price'
            label='Rent price (monthly)'
          />
        )}
        <NumberField
          form={form}
          name='sale_price'
          label={
            isHouse
              ? 'Sale price'
              : isApartment
                ? 'Building sale price'
                : 'Sale price'
          }
        />
        <NumberField
          form={form}
          name='buy_price'
          label={
            isHouse
              ? 'Purchase price'
              : isApartment
                ? 'Building purchase price'
                : 'Purchase price'
          }
        />
      </div>
    </div>
  )
}
