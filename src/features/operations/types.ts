export type ActionItemType =
  | 'lease_expiry'
  | 'document_expiry'
  | 'pending_signature'
  | 'missing_move_in_inspection'
  | 'expired_insurance'
  | 'expired_compliance'

export interface IActionItem {
  id: number
  organization_id: number
  type: ActionItemType
  status: 'open' | 'completed' | 'dismissed'
  priority: 'normal' | 'high'
  title: string
  description: string | null
  due_on: string | null
  lease_id: number | null
  document_id: number | null
  property_id: number | null
  unit_id: number | null
  metadata: Record<string, unknown> | null
  capabilities: {
    can_complete: boolean
    can_dismiss: boolean
    can_reopen: boolean
  }
}
