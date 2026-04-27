import { useMemo } from 'react'
import { Loader2, Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUserProfileQuery } from '../settings/profile/query'
import NewOrganizationModal from './components/new-organization-modal'
import OnboardingOrgList from './components/onboarding-org-list'
import OrganizationDefinition from './components/organization-definition'

const OnboardingScreen = () => {
  const { data, isLoading } = useUserProfileQuery()

  const organizations = useMemo(() => data?.organizations || [], [data])

  const isEmpty = useMemo(
    () => !isLoading && organizations.length === 0,
    [organizations, isLoading]
  )

  return (
    <div className='flex min-h-screen w-full flex-col items-center bg-muted/30 p-4 md:p-6'>
      <Header fixed showSeparator={false}>
        <div className='ml-auto flex items-center gap-x-4'>
          <ProfileDropdown user={data} />
          <ThemeSwitch />
        </div>
      </Header>
      <Card className='my-auto w-full max-w-md overflow-hidden border-none shadow-xl md:border-solid lg:max-w-2xl'>
        <CardHeader className='border-b px-4 py-6 md:px-8'>
          <div className='flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='space-y-1.5'>
              <CardTitle className='text-2xl font-bold tracking-tight md:text-3xl'>
                Welcome to Rentline!
              </CardTitle>
              <CardDescription className='text-sm md:text-base'>
                Select the organization you would like to work with today
              </CardDescription>
              <div className='pt-2'>
                <NewOrganizationModal />
              </div>
            </div>

            <div className='hidden shrink-0 sm:block'>
              <OrganizationDefinition />
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex h-64 w-full flex-col items-center justify-center gap-2 text-muted-foreground'>
              <Loader2 className='h-8 w-8 animate-spin' />
              <p className='animate-pulse text-sm'>Loading your workspace...</p>
            </div>
          ) : isEmpty ? (
            <div className='flex flex-col items-center justify-center p-8 text-center md:p-12'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                <Plus className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-lg font-semibold'>No organizations found</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                You don't have any organizations yet.{' '}
                <span className='block font-medium text-foreground sm:inline'>
                  Create one to get started with your properties.
                </span>
              </p>
            </div>
          ) : (
            <div className='p-4 md:p-6'>
              <OnboardingOrgList
                activeOrganization={data!.active_organization}
                organizations={organizations}
              />
            </div>
          )}
        </CardContent>

        {/* Mobile-only definition toggle at the bottom to keep the header clean */}
        <div className='border-t bg-muted/20 p-4 sm:hidden'>
          <OrganizationDefinition />
        </div>
      </Card>
    </div>
  )
}

export default OnboardingScreen
