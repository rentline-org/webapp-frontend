import { useMutation } from '@tanstack/react-query'
import { handlePost } from '@/api'
import { getDeviceType } from '@/lib/utils'
import type { ILogoutRequest } from '../types'

const LOGOUT_ENDPOINT = '/logout'

async function handleLogout() {
  return await handlePost<unknown, ILogoutRequest>(LOGOUT_ENDPOINT, {
    device: getDeviceType(),
  })
}

export function useHandleLogout() {
  return useMutation({
    mutationKey: [LOGOUT_ENDPOINT],
    mutationFn: handleLogout,
  })
}
