import type { IActiveOrganization } from '@/features/organizations/types'

export interface User {
  id: number

  first_name: string | null
  last_name: string | null
  user_name: string | null
  name: string
  active_organization: IActiveOrganization

  email: string
  email_verified_at: string | null

  phone: string | null
  phone_verified_at: string | null

  last_active_device: string | null
  last_login_at: string | null

  is_active: boolean

  created_by: number | null
  updated_by: number | null

  last_otp: number | null

  created_at: string
  updated_at: string

  photo?: string // if you expose media URL
}
