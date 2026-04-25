import { createFileRoute } from '@tanstack/react-router'
import { handleAuthProtection } from '@/lib/route-utils'
import { SignUp } from '@/features/auth/sign-up'

export const Route = createFileRoute('/(auth)/sign-up')({
  beforeLoad: async ({ context }) => {
    await handleAuthProtection('guest', context)
  },
  component: SignUp,
})
