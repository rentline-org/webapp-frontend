import z from 'zod'
import type { DeviceType } from '@/lib/utils'
import type { AuthErrorCodes } from '@/features/auth/types'
import type { User } from '@/features/users/types'

export const SignUpFormSchema = z
  .object({
    firstName: z.string().min(1, 'Please enter your first name.'),
    lastName: z.string().min(1, 'Please enter your last name.'),
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email.' : undefined,
    }),
    // role: z.enum(['landlord', 'tenant']),
    password: z
      .string()
      .min(1, 'Please enter your password.')
      .min(7, 'Password must be at least 7 characters long.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export type TSignUpFormSchema = z.infer<typeof SignUpFormSchema>

export interface ISignUpRequest {
  firstName: string
  lastName: string
  email: string
  role: 'landlord' | 'tenant'
  password: string
  device: DeviceType
}

export interface ISignUpResponse {
  data: ISignUpResponseData
}

export interface ISignUpResponseData {
  user: User
  token: string | null
  status: AuthErrorCodes
  message: string
}
