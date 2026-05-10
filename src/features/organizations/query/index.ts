import { useMutation, useQuery } from '@tanstack/react-query'
import { handleGet, handlePost, handlePut, type IResponse } from '@/api'
import { saveActiveOrganization } from '../org-switcher/query'
import type {
  IOrganizationData,
  IOrganizationMutationRequest,
  IOrganizationMutationResponse,
  IOrganizationResponse,
  TCreateOrganizationSchema,
  TOrganizationLogoUploadSchema,
} from '../types'

const USER_ORGANIZATIONS_LIST_ENDPOINT = '/organizations'
const CREATE_ORGANIZATION_ENDPOINT = '/organizations'

async function handleGetUserOrganizations(): Promise<IOrganizationData[]> {
  const result = await handleGet<IOrganizationResponse>(
    USER_ORGANIZATIONS_LIST_ENDPOINT
  )

  return result.data
}

async function handleCreateOrganization(
  payload: TCreateOrganizationSchema
): Promise<IOrganizationData> {
  const response = await handlePost<
    IOrganizationMutationResponse,
    IOrganizationMutationRequest
  >(CREATE_ORGANIZATION_ENDPOINT, {
    ...payload,
  })

  if (response.errors) {
    throw response.message
  }

  if (payload.is_active) {
    saveActiveOrganization(response.data.id)
  }

  return response.data
}

async function handleUploadLogo(
  payload: TOrganizationLogoUploadSchema
): Promise<IOrganizationData> {
  const formData = new FormData()

  formData.append('logo', payload.logo)

  const response = await handlePut<IResponse<IOrganizationData>, FormData>(
    CREATE_ORGANIZATION_ENDPOINT.concat('/active/logo'),
    formData
  )

  return response.data
}

export function useGetUserOrganizations() {
  return useQuery<IOrganizationData[]>({
    queryKey: [USER_ORGANIZATIONS_LIST_ENDPOINT],
    queryFn: handleGetUserOrganizations,
  })
}

export function useHandleCreationOrganization() {
  return useMutation({
    mutationKey: [CREATE_ORGANIZATION_ENDPOINT],
    mutationFn: handleCreateOrganization,
  })
}

export function useUploadOrganizationLogo() {
  return useMutation({
    mutationKey: [CREATE_ORGANIZATION_ENDPOINT, 'logo'],
    mutationFn: async (payload: TOrganizationLogoUploadSchema) => {
      return await handleUploadLogo(payload)
    },
  })
}
