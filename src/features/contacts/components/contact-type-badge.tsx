import { Badge } from '@/components/ui/badge'
import type { ContactType } from '../types'
import { getContactTypeLabel } from '../utils/constants'

const variants: Record<ContactType, 'info' | 'warning' | 'success'> = {
  agent: 'info',
  owner: 'warning',
  tenant: 'success',
}

export function ContactTypeBadge({ type }: { type: ContactType }) {
  return (
    <Badge variant={variants[type]} className='rounded-full'>
      {getContactTypeLabel(type)}
    </Badge>
  )
}
