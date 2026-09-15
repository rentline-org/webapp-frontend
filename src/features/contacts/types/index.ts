import { z } from 'zod'

export const contactTypeValues = ['agent', 'owner', 'tenant'] as const

export type ContactType = (typeof contactTypeValues)[number]

export interface IContactProperty {
  id: number
  slug: string
  title: string
  address?: string
}

export interface IContact {
  id: number
  organization_id: number
  name: string
  email: string | null
  phone: string | null
  type: ContactType
  property_ids: number[]
  properties: IContactProperty[]
  created_at: string
  updated_at: string
}

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(255, 'Name must be 255 characters or fewer.'),
  type: z.enum(contactTypeValues),
  email: z
    .string()
    .trim()
    .max(255, 'Email must be 255 characters or fewer.')
    .refine(
      (value) => value.length === 0 || z.email().safeParse(value).success,
      'Enter a valid email address.'
    )
    .default(''),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone must be 30 characters or fewer.')
    .default(''),
  property_ids: z.array(z.number().int().positive()).default([]),
})

export type TContactForm = z.infer<typeof contactFormSchema>

export interface IContactPayload {
  name: string
  type: ContactType
  email: string | null
  phone: string | null
  property_ids: number[]
}

export type IContactUpdatePayload = Partial<IContactPayload>

export type TContactUpdateVariables = {
  contact: IContact
  payload: IContactUpdatePayload
}
