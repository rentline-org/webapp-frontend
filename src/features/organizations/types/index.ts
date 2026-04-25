import z from 'zod'

export interface IOrganizationData {
  id: number
  title: string
  description: string
  address: string
  phone: string
  email: string
  number_of_properties: number
  created_at: string
  updated_at: string
}

export interface IActiveOrganization extends IOrganizationData {
  website: string | null
}

export interface IOrganizationResponse {
  data: IOrganizationData[]
}

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'this field is required'),
  description: z.string().optional(),
  // address: z.string().optional(),
  // phone: z.string().optional(),
  email: z.email(),
  number_of_properties: z.number().refine((val) => !(val < 1)),
  setActive: z.boolean(),
})

export type TCreateOrganizationSchema = z.infer<typeof createOrganizationSchema>

export interface IOrganizationMutationRequest {
  title: string
  description?: string
  // address?: string
  // phone?: string
  email?: string
  number_of_properties: number
  setActive: boolean
}

export interface IOrganizationMutationResponse {
  data: IOrganizationData
}
