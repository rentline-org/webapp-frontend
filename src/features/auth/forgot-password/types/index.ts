import z from 'zod'

export const passwordResetLinkSchema = z.object({
  email: z.email(),
})

export type TPasswordResetLinkSchema = z.infer<typeof passwordResetLinkSchema>

export interface IPasswordResetLinkResponse {
  status: string
}
