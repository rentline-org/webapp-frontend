import { FilePenLine, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DocumentType } from '../types'

const documentTypes: Record<
  DocumentType,
  {
    label: string
    variant: 'info' | 'outline'
    icon: typeof FileText
  }
> = {
  generic: {
    label: 'Generic',
    variant: 'outline',
    icon: FileText,
  },
  lease: {
    label: 'Lease',
    variant: 'info',
    icon: FilePenLine,
  },
}

export function DocumentTypeBadge({ type }: { type: DocumentType }) {
  const config = documentTypes[type]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className='rounded-full'>
      <Icon />
      {config.label}
    </Badge>
  )
}
