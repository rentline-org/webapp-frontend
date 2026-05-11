import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { getUserProfileContext } from '@/features/settings/profile/query'
import type { IUserProfileData } from '@/features/settings/profile/types'
import { getCookie, removeCookie } from './cookies'

type Context = {
  queryClient: QueryClient
}

function getSafeRedirectTarget() {
  const url = new URL(window.location.href)

  if (url.pathname === '/sign-in') {
    return '/'
  }

  url.searchParams.delete('redirect')

  return `${url.pathname}${url.search}${url.hash}`
}

function redirectToSignIn(): never {
  removeCookie('active_org')

  throw redirect({
    to: '/sign-in',
    search: {
      redirect: getSafeRedirectTarget(),
    },
    replace: true,
  })
}

function redirectToOnboarding(): never {
  throw redirect({
    to: '/onboarding',
    replace: true,
  })
}

export async function handleAuthProtection(
  type: 'protected' | 'guest',
  context: Context
): Promise<IUserProfileData | null> {
  const pathname = window.location.pathname

  if (type === 'guest') {
    const { user } = await getUserProfileContext(context)

    if (user) {
      throw redirect({
        to: '/',
        replace: true,
      })
    }

    return null
  }

  const { user } = await getUserProfileContext(context)

  if (!user) {
    redirectToSignIn()
  }

  if (pathname !== '/onboarding') {
    const activeOrganizationCookie = getCookie('active_org')

    if (!user.organizations?.length) {
      removeCookie('active_org')
      redirectToOnboarding()
    }

    if (!activeOrganizationCookie) {
      redirectToOnboarding()
    }

    const hasOrganizationAccess = user.organizations?.some(
      (organization) =>
        String(organization.id) === String(activeOrganizationCookie)
    )

    if (!hasOrganizationAccess) {
      removeCookie('active_org')
      redirectToOnboarding()
    }
  }

  return user
}
