import { useMutation } from '@tanstack/react-query'
import { handlePost } from '@/api'
import { getDeviceType } from '@/lib/utils'
import type {
  ISignInRequest,
  ISignInResponse,
  ISignInResponseData,
  TSignInFormSchema,
} from '../types'

const AUTH_SIGNIN_ENDPOINT = '/login'

async function handleSignIn(
  data: TSignInFormSchema
): Promise<ISignInResponseData | null> {
  const response = await handlePost<ISignInResponse, ISignInRequest>(
    AUTH_SIGNIN_ENDPOINT,
    {
      ...data,
      device: getDeviceType(),
    }
  )

  if (response.data.token) {
    return response.data
  }

  return null
}

export function useHandleSignIn() {
  return useMutation({
    mutationKey: [AUTH_SIGNIN_ENDPOINT],
    mutationFn: handleSignIn,
  })
}
