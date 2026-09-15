import type { ContactType } from '../types'

export const CONTACT_TYPE_OPTIONS: ReadonlyArray<{
  value: ContactType
  label: string
  description: string
}> = [
  {
    value: 'agent',
    label: 'Real estate agent',
    description: 'Broker or agent working with the property.',
  },
  {
    value: 'owner',
    label: 'Property owner',
    description: 'Owner or landlord associated with the property.',
  },
  {
    value: 'tenant',
    label: 'Tenant',
    description: 'Current or prospective tenant contact.',
  },
]

export const getContactTypeLabel = (type: ContactType): string =>
  CONTACT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
