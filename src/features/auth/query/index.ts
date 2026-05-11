import { useMutation } from '@tanstack/react-query'
import { RentlineAuth } from '@/api'
import { getDeviceType } from '@/lib/utils'

const LOGOUT_ENDPOINT = '/logout'

async function handleLogout() {
  return await RentlineAuth.post(LOGOUT_ENDPOINT, {
    device: getDeviceType(),
  })
}

export function useHandleLogout() {
  return useMutation({
    mutationKey: [LOGOUT_ENDPOINT],
    mutationFn: handleLogout,
  })
}
