/* eslint-disable no-console */
import { useMutation } from '@tanstack/react-query'
import { handlePost } from '@/api'
import { getDeviceType } from '@/lib/utils'
import type {
  ISignUpRequest,
  ISignUpResponse,
  ISignUpResponseData,
  TSignUpFormSchema,
} from '../types'

const AUTH_REGISTER_ENDPOINT = '/register'

async function handleSignUp(
  signUpForm: TSignUpFormSchema
): Promise<ISignUpResponseData | null> {
  const response = await handlePost<ISignUpResponse, ISignUpRequest>(
    AUTH_REGISTER_ENDPOINT,
    {
      ...signUpForm,
      device: getDeviceType(),
    }
  )

  if (response.data.user) {
    return response.data
  }

  return null
}

export function useSignUpMutation() {
  return useMutation<ISignUpResponseData, Error, TSignUpFormSchema>({
    mutationKey: [AUTH_REGISTER_ENDPOINT],
    mutationFn: async (schema) => {
      const result = await handleSignUp(schema)

      if (!result?.user) {
        throw new Error(result?.message || 'Failed to create account')
      }

      return result
    },
  })
}
