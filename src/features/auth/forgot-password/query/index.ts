import { useMutation } from '@tanstack/react-query'
import { type IResponse, RentlineAuth } from '@/api'
import type {
  IPasswordResetLinkResponse,
  TPasswordResetLinkSchema,
} from '../types'

const AUTH_PASSWORD_RESET_ENDPOINT = '/forgot-password'

async function handleRequestPasswordReset(payload: TPasswordResetLinkSchema) {
  await RentlineAuth.get('/sanctum/csrf-cookie')

  const response = await RentlineAuth.post<
    IResponse<IPasswordResetLinkResponse>
  >(AUTH_PASSWORD_RESET_ENDPOINT, payload)

  return response.data.data
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationKey: [AUTH_PASSWORD_RESET_ENDPOINT],
    mutationFn: async (payload: TPasswordResetLinkSchema) => {
      return await handleRequestPasswordReset(payload)
    },
  })
}
