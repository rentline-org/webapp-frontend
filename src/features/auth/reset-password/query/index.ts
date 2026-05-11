import { useMutation } from '@tanstack/react-query'
import { type IResponse, RentlineAuth } from '@/api'
import {
  type INewPasswordResponseData,
  type INewPasswordRequest,
} from '../types'

const RESET_PASSWORD_ENDPOINT = '/reset-password'

async function handleNewPasswordReset(payload: INewPasswordRequest) {
  await RentlineAuth.get('/sanctum/csrf-cookie')

  const response = await RentlineAuth.post<IResponse<INewPasswordResponseData>>(
    RESET_PASSWORD_ENDPOINT,
    payload
  )
  return response.data.data
}

export function useResetPassword() {
  return useMutation({
    mutationKey: [RESET_PASSWORD_ENDPOINT],
    mutationFn: async (payload: INewPasswordRequest) => {
      return await handleNewPasswordReset(payload)
    },
  })
}
