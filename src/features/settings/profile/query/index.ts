import { useEffect } from 'react'
import { type QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { handleGet, handlePost, type IResponse } from '@/api'
import { useAuthStore } from '@/stores/auth-store'
import type {
  IUpdateProfileRequest,
  IUserProfileData,
  IUserProfileResponse,
  TAvatarUploadSchema,
} from '../types'

export const USER_PROFILE_ENDPOINT = '/user/profile'

async function handleGetUserProfile(): Promise<IUserProfileData | null> {
  const response = await handleGet<IUserProfileResponse>(USER_PROFILE_ENDPOINT)

  if (!response.data) {
    return null
  }

  return response.data
}

async function handleUpdateUserAvatar(
  payload: TAvatarUploadSchema
): Promise<IUserProfileData | null> {
  const formData = new FormData()

  formData.append('avatar', payload.avatar)

  const response = await handlePost<IResponse<IUserProfileData>, FormData>(
    USER_PROFILE_ENDPOINT.concat('/update-avatar'),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

async function handleUpdateUserProfile(
  payload: IUpdateProfileRequest
): Promise<IUserProfileData | null> {
  const response = await handlePost<
    IResponse<IUserProfileData>,
    IUpdateProfileRequest
  >(USER_PROFILE_ENDPOINT.concat('/update'), payload)

  return response.data
}

export function useUserProfileQuery() {
  const { setUser } = useAuthStore((s) => s.auth)

  const query = useQuery<IUserProfileData | null>({
    queryKey: [USER_PROFILE_ENDPOINT],
    queryFn: handleGetUserProfile,
    staleTime: 1000 * 60 * 10,
  })

  useEffect(() => {
    setUser(query.data ?? null)
  }, [query.data, setUser])

  return query
}

export function useUpdateProfileAvatar() {
  return useMutation({
    mutationKey: [USER_PROFILE_ENDPOINT, 'profile', 'avatar'],
    mutationFn: async (payload: TAvatarUploadSchema) => {
      return await handleUpdateUserAvatar(payload)
    },
  })
}

export function useUpdateUserProfile() {
  return useMutation({
    mutationKey: [USER_PROFILE_ENDPOINT, 'profile', 'update'],
    mutationFn: async (payload: IUpdateProfileRequest) => {
      return await handleUpdateUserProfile(payload)
    },
  })
}

export async function getUserProfileContext(context: {
  queryClient: QueryClient
}) {
  try {
    const user = await context.queryClient.fetchQuery<IUserProfileData | null>({
      queryKey: [USER_PROFILE_ENDPOINT],
      queryFn: handleGetUserProfile,
      retry: false,
      staleTime: 1000 * 60 * 5,
    })

    return { user }
  } catch {
    return { user: null }
  }
}

export async function invalidateUserProfile(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: [USER_PROFILE_ENDPOINT],
  })
}
