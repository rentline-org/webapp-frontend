import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { handleAuthProtection } from '@/lib/route-utils'
import OnboardingScreen from '@/features/onboarding'

export const Route = createFileRoute('/(auth)/onboarding')({
  loader: async ({ context }) => {
    return await handleAuthProtection('protected', context)
  },
  pendingComponent: () => (
    <div className='flex h-screen w-full items-center justify-center'>
      <Loader2 className='animate-spin' />
    </div>
  ),
  component: OnboardingScreen,
})
