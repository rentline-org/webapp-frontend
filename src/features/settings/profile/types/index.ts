import z from 'zod'
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

export const profileFormSchema = z.object({
  first_name: z.string().min(1, 'This field is required'),
  last_name: z.string().min(1, 'this field is required'),
  email: z.email(),
  phone: z.string().optional().nullable(),
  dob: z.date().optional().nullable(),
  urls: z
    .array(
      z.object({
        value: z.url('Please enter a valid URL.'),
      })
    )
    .optional()
    .nullable(),
})

export type TProfileFormSchema = z.infer<typeof profileFormSchema>
export interface IUpdateProfileRequest extends Omit<TProfileFormSchema, 'dob'> {
  name: string
  dob: string | null
}

export const avatarUploadSchema = z.object({
  avatar: z
    .instanceof(File, {
      message: 'Please select an image.',
    })
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Only JPG, PNG and WebP images are allowed.',
      }
    )
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: 'Image must be less than 2MB.',
    }),
})

export type TAvatarUploadSchema = z.infer<typeof avatarUploadSchema>
