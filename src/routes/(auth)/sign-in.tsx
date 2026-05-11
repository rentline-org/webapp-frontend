import { createFileRoute } from '@tanstack/react-router'
import { SignIn2 } from '@/features/auth/sign-in/sign-in-2'

type SignInSearchParams = {
  redirect?: string
}

export const Route = createFileRoute('/(auth)/sign-in')({
  // beforeLoad: async ({ context }) => {
  //   return await handleAuthProtection('guest', context)
  // },
  component: SignIn2,
  validateSearch: (search: SignInSearchParams): SignInSearchParams => {
    return {
      redirect: search?.redirect ?? '',
    }
  },
})
