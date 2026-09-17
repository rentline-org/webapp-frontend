import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  handleDelete,
  handleGet,
  handlePatch,
  handlePost,
  type IResponse,
} from '@/api'
import { normalizePaginatedResponse } from '@/api/pagination'
import { handleServerError } from '@/lib/handle-server-error'
import type {
  IAcceptOrganizationInvitation,
  ICreateOrganizationInvitation,
  IOrganizationInvitation,
  IOrganizationMember,
  OrganizationMemberRole,
  OrganizationMemberStatus,
} from '../types'

export const organizationInvitationsKey = ['organization-invitations'] as const
export const organizationMembersKey = ['organization-members'] as const

async function createInvitation(
  payload: ICreateOrganizationInvitation
): Promise<IOrganizationInvitation> {
  const response = await handlePost<
    IResponse<IOrganizationInvitation>,
    ICreateOrganizationInvitation
  >('/organization-invitations', payload)
  return response.data
}

async function getInvitation(token: string): Promise<IOrganizationInvitation> {
  const response = await handleGet<IResponse<IOrganizationInvitation>>(
    `/invitations/${encodeURIComponent(token)}`
  )
  return response.data
}

async function acceptInvitation({
  token,
  payload,
}: {
  token: string
  payload: IAcceptOrganizationInvitation
}) {
  const response = await handlePost<IResponse<{ id: number; email: string }>>(
    `/invitations/${encodeURIComponent(token)}/accept`,
    payload
  )
  return response.data
}

async function getMembers(): Promise<IOrganizationMember[]> {
  const response = await handleGet<unknown>('/organization-members', {
    per_page: 100,
  })
  return normalizePaginatedResponse<IOrganizationMember>(response).items
}

async function getInvitations(): Promise<IOrganizationInvitation[]> {
  const response = await handleGet<unknown>('/organization-invitations', {
    per_page: 100,
  })
  return normalizePaginatedResponse<IOrganizationInvitation>(response).items
}

async function updateMember({
  memberId,
  payload,
}: {
  memberId: number
  payload: Partial<{
    role: Exclude<OrganizationMemberRole, 'owner'>
    status: OrganizationMemberStatus
  }>
}): Promise<IOrganizationMember> {
  const response = await handlePatch<IResponse<IOrganizationMember>>(
    `/organization-members/${memberId}`,
    payload
  )
  return response.data
}

export function useCreateOrganizationInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...organizationInvitationsKey, 'create'],
    mutationFn: createInvitation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationInvitationsKey,
      })
    },
    onError: handleServerError,
  })
}

export function useOrganizationInvitation(token: string) {
  return useQuery({
    queryKey: [...organizationInvitationsKey, 'token', token],
    queryFn: () => getInvitation(token),
    enabled: token.length > 0,
    retry: false,
  })
}

export function useAcceptOrganizationInvitation() {
  return useMutation({
    mutationKey: [...organizationInvitationsKey, 'accept'],
    mutationFn: acceptInvitation,
  })
}

export function useOrganizationMembers() {
  return useQuery({
    queryKey: organizationMembersKey,
    queryFn: getMembers,
  })
}

export function useOrganizationInvitations() {
  return useQuery({
    queryKey: organizationInvitationsKey,
    queryFn: getInvitations,
  })
}

export function useResendOrganizationInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...organizationInvitationsKey, 'resend'],
    mutationFn: async (invitationId: number) => {
      const response = await handlePost<IResponse<IOrganizationInvitation>>(
        `/organization-invitations/${invitationId}/resend`
      )
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationInvitationsKey,
      })
    },
    onError: handleServerError,
  })
}

export function useRevokeOrganizationInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...organizationInvitationsKey, 'revoke'],
    mutationFn: async (invitationId: number) => {
      await handleDelete(`/organization-invitations/${invitationId}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationInvitationsKey,
      })
    },
    onError: handleServerError,
  })
}

export function useUpdateOrganizationMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...organizationMembersKey, 'update'],
    mutationFn: updateMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationMembersKey })
    },
    onError: handleServerError,
  })
}

export function useRemoveOrganizationMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...organizationMembersKey, 'remove'],
    mutationFn: async (memberId: number) => {
      await handleDelete(`/organization-members/${memberId}`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationMembersKey })
    },
    onError: handleServerError,
  })
}
