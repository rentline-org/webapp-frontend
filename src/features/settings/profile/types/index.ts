import type { IOrganizationData } from '@/features/organizations/types'
import type { User } from '@/features/users/types'

export interface IUserProfileData extends User {
  roles: {
    id: number
    name: string
  }[]
  roleNames: string[]
  organizations: IOrganizationData[]
}

export interface IUserProfileResponse {
  data: IUserProfileData
}
