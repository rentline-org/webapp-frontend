import z from 'zod'

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'New password must be 8 characters minimum'),
    password_confirmation: z
      .string()
      .min(8, 'Password confirmation must be 8 characters minimum'),
  })
  .refine(
    ({ password, password_confirmation }) => password === password_confirmation,
    {
      message: 'Passwords do not match',
      path: ['password_confirmation'],
    }
  )

export type TNewPasswordSchema = z.infer<typeof newPasswordSchema>

export interface INewPasswordRequest {
  password: string
  password_confirmation: string
  email: string
  token: string
}

export interface INewPasswordResponseData {
  status: string
}
