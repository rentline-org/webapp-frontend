import { type QueryClient, useQuery } from '@tanstack/react-query'
import { handleGet } from '@/api'
import type { IUserProfileData, IUserProfileResponse } from '../types'

export const USER_PROFILE_ENDPOINT = '/user/profile'

async function handleGetUserProfile(): Promise<IUserProfileData | null> {
  const response = await handleGet<IUserProfileResponse>(USER_PROFILE_ENDPOINT)

  if (!response.data) {
    return null
  }

  return response.data
}

export function useUserProfileQuery() {
  return useQuery<IUserProfileData | null>({
    queryKey: [USER_PROFILE_ENDPOINT],
    queryFn: handleGetUserProfile,
    staleTime: 1000 * 60 * 10,
  })
}

export async function getUserProfileContext(
  context: { queryClient: QueryClient },
  onError: () => void
) {
  try {
    const user = await context.queryClient.fetchQuery<IUserProfileData | null>({
      queryKey: [USER_PROFILE_ENDPOINT],
      queryFn: handleGetUserProfile,
      retry: false,
      staleTime: 1000 * 60 * 5,
    })

    return { user }
  } catch {
    throw onError()
  }
}

export async function invalidateUserProfile(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: [USER_PROFILE_ENDPOINT],
  })
}
