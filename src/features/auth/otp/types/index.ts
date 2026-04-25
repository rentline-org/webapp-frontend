import z from 'zod'
import type { DeviceType } from '@/lib/utils'
import type { IUserProfileData } from '@/features/settings/profile/types'
import type { AuthErrorCodes } from '../../types'

export const otpFormSchema = z.object({
  otp: z
    .string()
    .min(6, 'Please enter the 6-digit code.')
    .max(6, 'Please enter the 6-digit code.'),
})

export type TOtpFormSchema = z.infer<typeof otpFormSchema>

export interface IVerifyOtpRequest {
  email: string
  otp: string
  device: DeviceType
}

export interface IVerifyOtpResponseData {
  user: IUserProfileData
  token: string
  status: AuthErrorCodes
  message: string
}

export interface IVerifyOtpResponse {
  data: IVerifyOtpResponseData
}
