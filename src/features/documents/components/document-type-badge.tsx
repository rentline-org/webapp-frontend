import { useTranslation } from 'react-i18next'
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FilePenLine,
  FilePlus2,
  FileText,
  LandPlot,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DocumentType } from '../types'
import { DOCUMENT_KIND_I18N_KEYS } from '../utils/constants'

const icons: Record<DocumentType, typeof FileText> = {
  generic: FileText,
  custom: FileText,
  lease: FilePenLine,
  lease_addendum: FilePlus2,
  property_management_agreement: Building2,
  brokerage_authorization: BriefcaseBusiness,
  inspection_report: ClipboardCheck,
  insurance_policy: ShieldCheck,
  service_contract: Wrench,
  compliance_certificate: BadgeCheck,
  ownership_record: LandPlot,
}

export function DocumentTypeBadge({
  type,
  label,
}: {
  type: DocumentType
  label?: string | null
}) {
  const { t } = useTranslation('documents')
  const Icon = icons[type] ?? FileText
  const translationKey = DOCUMENT_KIND_I18N_KEYS[type] ?? 'generic'

  return (
    <Badge
      variant={type === 'generic' ? 'outline' : 'info'}
      className='rounded-full'
    >
      <Icon />
      {label ?? t(`kinds.${translationKey}.shortLabel`)}
    </Badge>
  )
}
