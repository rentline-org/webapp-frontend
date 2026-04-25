import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUserProfileQuery } from '../settings/profile/query'
import NewOrganizationModal from './components/new-organization-modal'
import OnboardingOrgList from './components/onboarding-org-list'
import OrganizationDefinition from './components/organization-definition'

const OnboardingScreen = () => {
  const { data, isLoading } = useUserProfileQuery()

  const organizations = useMemo(() => data && data.organizations, [data])

  const isEmpty = useMemo(
    () => organizations && organizations.length === 0,
    [organizations]
  )

  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <Card className='max-w-md lg:min-w-2xl'>
        <CardHeader className='col-span-3 h-fit'>
          <div className='flex w-full items-center justify-between'>
            <div className=''>
              <CardTitle className='text-xl'>Welcome to rentline!</CardTitle>
              <CardDescription>
                Select the organization you would like to work with today
              </CardDescription>
              <NewOrganizationModal />
            </div>
            <div className='col-span-1'>
              <OrganizationDefinition />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {(isLoading && <Loader2 className='animate-spin' />) || isEmpty ? (
            <div className='flex w-full items-center'>
              <p className='text-sm'>
                You do not have any organizations.{' '}
                <span className='font-bold'>Create one to continue</span>
              </p>
            </div>
          ) : (
            <OnboardingOrgList
              activeOrganization={data!.active_organization}
              organizations={data!.organizations}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default OnboardingScreen
