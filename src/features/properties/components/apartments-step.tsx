import { type UseFormReturn } from 'react-hook-form'
import { Building2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { TCreatePropertySchema } from '../types'

interface ApartmentsStepProps {
  form: UseFormReturn<TCreatePropertySchema>
}

export const ApartmentsStep = (_props: ApartmentsStepProps) => {
  // For now, this is a placeholder for future apartment unit management
  // The schema will be extended to support multiple apartment units

  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-2'>
        <Building2 className='size-5 text-muted-foreground' />
        <h3 className='text-lg font-semibold'>Building units</h3>
      </div>

      <div className='rounded-lg border bg-muted/50 p-4'>
        <p className='text-sm text-muted-foreground'>
          You can add individual apartment units here. Each unit will have its
          own pricing, size, and availability. This feature is coming soon.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Units in this building</CardTitle>
          <CardDescription>
            Manage individual apartment units (pending implementation)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex min-h-32 items-center justify-center rounded-lg border border-dashed'>
            <div className='text-center'>
              <p className='text-sm text-muted-foreground'>
                Unit management coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
