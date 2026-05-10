import { useMutation } from '@tanstack/react-query'
import { handlePost } from '@/api'
import { getDeviceType } from '@/lib/utils'
import type {
  IVerifyOtpRequest,
  IVerifyOtpResponse,
  IVerifyOtpResponseData,
  TOtpFormSchema,
} from '../types'

const AUTH_OTP_ENDPOINT = '/verify-otp'

async function handleOTPVerification(
  schema: TOtpFormSchema,
  email: string
): Promise<IVerifyOtpResponseData | null> {
  const response = await handlePost<IVerifyOtpResponse, IVerifyOtpRequest>(
    AUTH_OTP_ENDPOINT,
    {
      email,
      device: getDeviceType(),
      otp: schema.otp,
    }
  )

  if (response.data.token) {
    // setCookie('token', response.data.token, 60 * 60 * 24 * 7)
    return response.data
  }

  return null
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

      if (!result?.token) {
        throw new Error(result?.message || 'Failed to verify OTP')
      }

      return result
    },
  })
}
