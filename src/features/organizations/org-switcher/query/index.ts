import { useMutation } from '@tanstack/react-query'
import { handlePost } from '@/api'
import type { IActiveOrganization } from '../../types'

const SELECT_ORGANIZATION_ENDPOINT = '/select-organization'

async function handleSelectOrganization(orgId: number): Promise<{
  organizationId: number
  organization: IActiveOrganization
}> {
  return await handlePost(`${SELECT_ORGANIZATION_ENDPOINT}/${orgId}`)
}

export function useHandleSelectOrganization() {
  return useMutation({
    mutationKey: [SELECT_ORGANIZATION_ENDPOINT],
    mutationFn: async (orgId: number) => {
      return await handleSelectOrganization(orgId)
    },
  })
}
