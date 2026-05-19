import type { IProperty } from '@/features/properties/types'
import z from 'zod'

export interface ICustomListing {
  id: number
  listing_id: number
  subdomain: string
  headline: string | null
  is_published: boolean
  use_organization_defaults: boolean
  show_contact_form: boolean
  show_phone: boolean
  show_email: boolean
  contact_email: string | null
  contact_phone: string | null
  languages: string | null
  properties: IProperty[] | null
  properties_count: number | null
  created_at: string
  updated_at: string
}

export const websiteIntegrationSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(2, 'Headline is required')
    .max(120, 'Headline is too long'),
  subdomain: z.string().trim().max(120).optional().or(z.literal('')),
  contact_email: z.email().trim().optional().or(z.literal('')),
  contact_phone: z.string().trim().max(30).optional().or(z.literal('')),
  is_published: z.boolean().default(true),
  property_ids: z.array(z.number()).min(1, 'Choose at least one property'),
})

export type TWebsiteIntegrationSchema = z.infer<typeof websiteIntegrationSchema>

export type PropertyOption = {
  id: number | string
  title: string
  units_count?: number | null
  thumbnail?: {
    url: string
    name: string
  } | null
}
