import { useMutation } from '@tanstack/react-query'
import { handleDelete, handlePut, type IResponse } from '@/api'
import { CREATE_ORGANIZATION_ENDPOINT } from '@/features/organizations/query'
import type {
  TOrganizationLogoUploadSchema,
  IOrganizationData,
} from '@/features/organizations/types'

const ORGANIZATION_LOGO_ENDPOINT =
  CREATE_ORGANIZATION_ENDPOINT.concat('/active/logo')

async function handleUploadLogo(
  payload: TOrganizationLogoUploadSchema
): Promise<IOrganizationData> {
  const formData = new FormData()

  formData.append('logo', payload.logo)

  const response = await handlePut<IResponse<IOrganizationData>, FormData>(
    ORGANIZATION_LOGO_ENDPOINT,
    formData
  )

  return response.data
}

async function handleDeleteLogo(): Promise<void> {
  return await handleDelete(ORGANIZATION_LOGO_ENDPOINT)
}

export function useUploadOrganizationLogo() {
  return useMutation({
    mutationKey: [ORGANIZATION_LOGO_ENDPOINT, 'logo'],
    mutationFn: async (payload: TOrganizationLogoUploadSchema) => {
      return await handleUploadLogo(payload)
    },
  })
}

export function useDeleteOrganizationLogo() {
  return useMutation({
    mutationKey: [ORGANIZATION_LOGO_ENDPOINT, 'delete'],
    mutationFn: handleDeleteLogo,
  })
}
