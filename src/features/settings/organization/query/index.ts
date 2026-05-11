import { useMutation } from '@tanstack/react-query'
import { handleDelete, handlePut, type IResponse } from '@/api'
import { CREATE_ORGANIZATION_ENDPOINT } from '@/features/organizations/query'
import type {
  TOrganizationLogoUploadSchema,
  IOrganizationData,
} from '@/features/organizations/types'
import type { TUpdateOrganizationSchema } from '../types'

const ORGANIZATION_LOGO_ENDPOINT =
  CREATE_ORGANIZATION_ENDPOINT.concat('/active/logo')

async function handleUpdateOrganization(
  payload: TUpdateOrganizationSchema,
  organizationId: number
) {
  const response = await handlePut<
    IResponse<IOrganizationData>,
    TUpdateOrganizationSchema
  >(
    CREATE_ORGANIZATION_ENDPOINT.concat(`/${organizationId.toString()}`),
    payload
  )

  return response.data
}

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

export function useUpdateOrganization() {
  return useMutation({
    mutationKey: [CREATE_ORGANIZATION_ENDPOINT, 'update'],
    mutationFn: async ({
      payload,
      organizationId,
    }: {
      payload: TUpdateOrganizationSchema
      organizationId: number
    }) => {
      return await handleUpdateOrganization(payload, organizationId)
    },
  })
}
