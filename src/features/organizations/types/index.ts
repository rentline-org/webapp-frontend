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
  avatar: string
}

export interface IActiveOrganization extends IOrganizationData {
  website: string | null
}

export interface IOrganizationResponse {
  data: IOrganizationData[]
}

export const stepOneSchema = z.object({
  title: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
  email: z.string().email('Invalid email'),
})

export const stepTwoSchema = z.object({
  country: z
    .string()
    .min(2, 'Country is required')
    .max(2, 'Use ISO code like BR or DE')
    .transform((v) => v.toUpperCase()),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  address_line: z.string().min(1, 'Address is required'),
  state: z.string().optional(),
})

export const stepThreeSchema = z.object({
  phone: z.string().optional(),
  website: z.string().optional(),
  tax_id: z.string().optional(),
  tax_id_type: z.enum(['cpf', 'cnpj', 'vat']).optional(),
  is_active: z.boolean(),
})

export const createOrganizationSchema = z
  .object({
    ...stepOneSchema.shape,
    ...stepTwoSchema.shape,
    ...stepThreeSchema.shape,
  })
  .superRefine((data, ctx) => {
    const isBR = data.country === 'BR'

    if (isBR) {
      if (!data.state?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['state'],
          message: 'State is required for Brazil',
        })
      }
      if (!data.tax_id?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['tax_id'],
          message: 'Tax ID is required',
        })
      }
      if (!data.tax_id_type || !['cpf', 'cnpj'].includes(data.tax_id_type)) {
        ctx.addIssue({
          code: 'custom',
          path: ['tax_id_type'],
          message: 'Select CPF or CNPJ',
        })
      }
    } else {
      if (!data.tax_id?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['tax_id'],
          message: 'VAT is required',
        })
      }
    }
  })
export type TCreateOrganizationSchema = z.infer<typeof createOrganizationSchema>

export interface IOrganizationMutationRequest {
  title: string
  description?: string

  email: string

  phone?: string
  website?: string

  // Address
  country: string
  state?: string
  city: string
  postal_code: string
  address_line: string

  // Tax
  tax_id?: string
  tax_id_type?: 'cpf' | 'cnpj' | 'vat'

  // Flags
  is_active?: boolean
}

export interface IOrganizationMutationResponse {
  data: IOrganizationData
}
