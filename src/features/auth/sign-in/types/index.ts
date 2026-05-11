import z from 'zod'
import type { IUserProfileData } from '@/features/settings/profile/types'

export const signInFormSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(7, 'Password must be at least 7 characters long.'),
})

export type TSignInFormSchema = z.infer<typeof signInFormSchema>

export interface ISignInRequest {
  email: string
  password: string
  device: string
}

export interface ISignInResponseData {
  user: IUserProfileData
  message: string
  verified: boolean
}

export interface ISignInResponse {
  data: ISignInResponseData
}
