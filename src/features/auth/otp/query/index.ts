import { useMutation } from '@tanstack/react-query'
import { type IResponse, RentlineAuth } from '@/api'
import { getDeviceType } from '@/lib/utils'
import type { IVerifyOtpResponseData, TOtpFormSchema } from '../types'

const AUTH_OTP_ENDPOINT = '/verify-otp'

async function handleOTPVerification(
  schema: TOtpFormSchema,
  email: string
): Promise<IVerifyOtpResponseData | null> {
  await RentlineAuth.get('/sanctum/csrf-cookie')

  const response = await RentlineAuth.post(AUTH_OTP_ENDPOINT, {
    email,
    device: getDeviceType(),
    otp: schema.otp,
  })

  if (response.data) {
    return response.data.data
  }

  return null
}

async function handleResendOtp(
  email: string
): Promise<{ message: string } | null> {
  await RentlineAuth.get('/sanctum/csrf-cookie')
  const response = await RentlineAuth.post<IResponse<{ message: string }>>(
    '/resend-otp',
    {
      email,
      device: getDeviceType(),
    }
  )

  return response.data.data
}

export function useVerifyOtpMutation() {
  return useMutation<
    IVerifyOtpResponseData | null,
    Error,
    { schema: TOtpFormSchema; email: string }
  >({
    mutationKey: [AUTH_OTP_ENDPOINT],
    mutationFn: async ({ email, schema }) => {
      const result = await handleOTPVerification(schema, email)

      if (!result?.user) {
        throw new Error(result?.message || 'Failed to verify OTP')
      }

      return result
    },
  })
}

export function useResendOtp() {
  return useMutation({
    mutationKey: [AUTH_OTP_ENDPOINT, 'resend'],
    mutationFn: async (email: string) => {
      return await handleResendOtp(email)
    },
  })
}
