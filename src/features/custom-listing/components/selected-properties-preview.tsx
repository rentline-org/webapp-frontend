import { Building2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

type SelectedPropertiesPreviewProps = {
  propertyIds: string[]
}

function SelectedPropertiesPreview({
  propertyIds,
}: SelectedPropertiesPreviewProps) {
  if (!propertyIds.length) {
    return (
      <div className='rounded-xl border border-dashed bg-background p-5 text-sm text-muted-foreground'>
        No properties selected yet.
      </div>
    )
  }

  return (
    <div className='rounded-2xl border bg-background p-4'>
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-muted'>
          <Building2 className='h-5 w-5 text-muted-foreground' />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='text-sm font-medium'>
            {propertyIds.length}{' '}
            {propertyIds.length === 1
              ? 'property selected'
              : 'properties selected'}
          </div>

          <div className='mt-3 flex flex-wrap gap-2'>
            {propertyIds.map((id) => (
              <Badge
                key={id}
                variant='secondary'
                className='rounded-md px-2 py-1 font-mono text-xs'
              >
                {id}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectedPropertiesPreview
