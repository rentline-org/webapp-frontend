import { useMutation } from '@tanstack/react-query'
import { handlePost } from '@/api'
import { setCookie } from '@/lib/cookies'
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
    setCookie('token', response.data.token)
    return response.data
  }

  throw response.data
}

export function useHandleSignIn() {
  return useMutation({
    mutationKey: [AUTH_SIGNIN_ENDPOINT],
    mutationFn: handleSignIn,
  })
}
