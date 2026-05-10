import { useMutation } from '@tanstack/react-query'
import { handlePost } from '@/api'
import { setCookie } from '@/lib/cookies'
import type { IActiveOrganization } from '../../types'

const SELECT_ORGANIZATION_ENDPOINT = '/select-organization'

interface ISelectOrganizationResponse {
  organization_id: number
  active_organization: IActiveOrganization
}

async function handleSelectOrganization(
  orgId: number
): Promise<ISelectOrganizationResponse> {
  const result = await handlePost<ISelectOrganizationResponse>(
    `${SELECT_ORGANIZATION_ENDPOINT}/${orgId}`
  )

  // console.log(result)
  saveActiveOrganization(result.organization_id)

  return result
}

export function useHandleSelectOrganization() {
  return useMutation({
    mutationKey: [SELECT_ORGANIZATION_ENDPOINT],
    mutationFn: async (orgId: number) => {
      return await handleSelectOrganization(orgId)
    },
  })
}

export function saveActiveOrganization(organizationId: number) {
  setCookie('active_org', organizationId.toString(), 60 * 60 * 24 * 30)
}
