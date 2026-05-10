import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { getUserProfileContext } from '@/features/settings/profile/query'
import type { IUserProfileData } from '@/features/settings/profile/types'
import { getCookie, removeCookie } from './cookies'

type Context = {
  queryClient: QueryClient
}

export async function handleAuthProtection(
  type: 'protected' | 'guest',
  context: Context
): Promise<IUserProfileData | null> {
  if (type === 'protected') {
    const token = getCookie('token')

    const redirectSearch = location.pathname + location.search

    const { user } = await getUserProfileContext(context, () => {
      if (token) {
        removeCookie('token')
      }

      removeCookie('active_org')

      throw redirect({
        to: '/sign-in',
        search: {
          redirect: redirectSearch,
        },
      })
    })

    /**
     * No user found
     */
    if (!user) {
      removeCookie('active_org')

      throw redirect({
        to: '/sign-in',
        search: {
          redirect: redirectSearch,
        },
      })
    }

    /**
     * Check active organization cookie
     */
    const activeOrganizationCookie = getCookie('active_org')

    /**
     * User has no organizations yet
     */
    if (!user.organizations?.length && location.pathname !== '/onboarding') {
      removeCookie('active_org')

      throw redirect({
        to: '/onboarding',
      })
    }

    /**
     * Missing active organization cookie
     */
    if (!activeOrganizationCookie && location.pathname !== '/onboarding') {
      throw redirect({
        to: '/onboarding',
      })
    }

    /**
     * Validate cookie organization exists for user
     */
    const hasOrganizationAccess = user.organizations?.some(
      (organization) =>
        String(organization.id) === String(activeOrganizationCookie)
    )

    if (!hasOrganizationAccess && location.pathname !== '/onboarding') {
      removeCookie('active_org')

      throw redirect({
        to: '/onboarding',
      })
    }

    return user
  }

  if (type === 'guest') {
    const token = getCookie('token')

    if (!token) {
      return null
    }

    const { user } = await getUserProfileContext(context, () => {
      return
    })

    if (user) {
      throw redirect({
        to: '/',
      })
    }
  }

  return null
}
