/* eslint-disable no-console */
import { useMutation } from '@tanstack/react-query'
import { RentlineAuth } from '@/api'
import { getDeviceType } from '@/lib/utils'
import type { ISignUpResponseData, TSignUpFormSchema } from '../types'

const AUTH_REGISTER_ENDPOINT = '/register'

async function handleSignUp(
  signUpForm: TSignUpFormSchema
): Promise<ISignUpResponseData> {
  await RentlineAuth.get('/sanctum/csrf-cookie')

  const response = await RentlineAuth.post(AUTH_REGISTER_ENDPOINT, {
    ...signUpForm,
    device: getDeviceType(),
  })

  // console.log(response.data)
  // if (response.data.user) {

  // }

  return response.data.data
}

export function useSignUpMutation() {
  return useMutation<ISignUpResponseData, Error, TSignUpFormSchema>({
    mutationKey: [AUTH_REGISTER_ENDPOINT],
    mutationFn: async (schema) => {
      const result = await handleSignUp(schema)

      console.log(result)

      return result
    },
  })
}
