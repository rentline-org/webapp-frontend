import { z } from 'zod'

export const updateOrganizationSchema = z
  .object({
    title: z.string().min(1, 'Organization name is required'),
    description: z.string().optional(),
    email: z.email(),

    phone: z.string().optional(),
    website: z.string().optional(),

    country: z
      .string()
      .min(2, 'Country is required')
      .max(2, 'Use ISO code like BR or DE')
      .transform((v) => v.toUpperCase()),
    city: z.string().min(1, 'City is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    address_line: z.string().min(1, 'Address is required'),
    state: z.string().optional(),

    tax_id: z.string().optional(),
    tax_id_type: z.enum(['cpf', 'cnpj', 'vat']).optional(),

    // is_active: z.boolean(),
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

export type TUpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>
