export type OrganizationMemberRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'agent'
  | 'tenant'

export type OrganizationMemberStatus = 'invited' | 'active' | 'suspended'

export interface IOrganizationInvitation {
  id: number
  organization: {
    id: number
    title: string
  }
  contact: { id: number; name: string } | null
  inviter: { id: number; name: string }
  email: string
  role: Exclude<OrganizationMemberRole, 'owner'>
  locale: 'en' | 'pt-BR'
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  expires_at: string
  accepted_at: string | null
  revoked_at: string | null
  created_at: string
  capabilities: {
    can_resend: boolean
    can_revoke: boolean
  }
}

export interface ICreateOrganizationInvitation {
  email: string
  role: Exclude<OrganizationMemberRole, 'owner'>
  locale: 'en' | 'pt-BR'
  contact_id?: number
}

export interface IAcceptOrganizationInvitation {
  name: string
  password: string
  password_confirmation: string
}

export interface IOrganizationMember {
  id: number
  name: string
  email: string
  locale: 'en' | 'pt-BR'
  role: OrganizationMemberRole
  status: OrganizationMemberStatus
  invited_by: number | null
  accepted_at: string | null
  joined_at: string
  capabilities: {
    can_update: boolean
    can_remove: boolean
  }
}
