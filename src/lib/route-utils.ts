import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { getUserProfileContext } from '@/features/settings/profile/query'
import type { IUserProfileData } from '@/features/settings/profile/types'
import { getCookie, removeCookie } from './cookies'

// import { User } from 'lucide-react'

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

      throw redirect({ to: '/sign-in', search: { redirect: redirectSearch } })
    })

    if (
      user?.active_organization === null &&
      !(location.pathname === '/onboarding')
    ) {
      throw redirect({
        to: '/onboarding',
      })
    }

    return user
  }

  if (type === 'guest') {
    const token = getCookie('token')

    if (!token) return null

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
