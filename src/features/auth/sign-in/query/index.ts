import { useMutation } from '@tanstack/react-query'
import { RentlineAuth } from '@/api'
import { getDeviceType } from '@/lib/utils'
import type { ISignInResponseData, TSignInFormSchema } from '../types'

const AUTH_SIGNIN_ENDPOINT = '/login'

async function handleSignIn(
  data: TSignInFormSchema
): Promise<ISignInResponseData | null> {
  await RentlineAuth.get('/sanctum/csrf-cookie')

  const response = await RentlineAuth.post(AUTH_SIGNIN_ENDPOINT, {
    ...data,
    device: getDeviceType(),
  })

  if (response.data) {
    return response.data.data
  }

  throw response.data.message
}

export function useHandleSignIn() {
  return useMutation({
    mutationKey: [AUTH_SIGNIN_ENDPOINT],
    mutationFn: handleSignIn,
  })
}
