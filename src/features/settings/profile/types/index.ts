import type { IOrganizationData } from '@/features/organizations/types'
import type { User } from '@/features/users/types'

export interface IUserProfileData extends User {
  roles: {
    id: number
    name: string
  }[]
  roleNames: string[]
  organizations: IOrganizationData[]
  active_organization: {
    id: number
    title: string
    description: string
    address: string
    phone: string
    email: string
    website: string | null
    number_of_properties: number
    created_at: string
    updated_at: string
  } | null
}

export interface IUserProfileResponse {
  data: IUserProfileData
}
