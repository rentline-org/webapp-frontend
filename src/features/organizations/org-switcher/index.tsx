import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Building2, ChevronsUpDown, List } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { invalidatePropertiesQuery } from '@/features/properties/query'
import { invalidateUserProfile } from '@/features/settings/profile/query'
import type { IUserProfileData } from '@/features/settings/profile/types'
import type { IOrganizationData } from '../types'
import { useHandleSelectOrganization } from './query'

type Props = {
  userProfile: IUserProfileData | null | undefined
  isLoading: boolean
  isFetching: boolean
}

// const routeApi =

export function OrgSwitcher({ userProfile, isLoading, isFetching }: Props) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate, isPending } = useHandleSelectOrganization()
  const { isMobile } = useSidebar()

  const organizationList = useMemo(() => {
    if (userProfile) {
      const { active_organization, organizations } = userProfile

      return organizations.filter((o) => o.id !== active_organization?.id)
    }

    return []
  }, [userProfile])

  const handleSelectOrg = (org: IOrganizationData) => {
    mutate(org.id, {
      async onSuccess() {
        navigate({
          to: '/',
        })

        await Promise.all([
          invalidateUserProfile(queryClient),
          invalidatePropertiesQuery(queryClient),
        ])

        toast.info(`Using organization: ${org.title}`)
      },
    })
  }

  const showLoadingSkeleton = useMemo(() => {
    return isLoading || isFetching || isPending
  }, [isFetching, isLoading, isPending])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={showLoadingSkeleton}>
            <SidebarMenuButton
              size='lg'
              className='border border-dotted border-neutral-500/30 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              {showLoadingSkeleton ? (
                <>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                    <Building2 className='size-4' />
                  </div>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <Skeleton className='h-10 w-full rounded-md' />
                  </div>
                </>
              ) : (
                <>
                  <div className='flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                    {userProfile?.active_organization?.logo ? (
                      <img
                        src={userProfile.active_organization.logo}
                        alt={userProfile.active_organization.title}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <Building2 className='size-4' />
                    )}
                  </div>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {userProfile!.active_organization.title}
                    </span>
                    <span className='truncate text-xs'>
                      {/* {activeOrganization.} */}
                      Trial
                    </span>
                  </div>
                  <ChevronsUpDown className='ms-auto' />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              My Organizations
            </DropdownMenuLabel>
            {organizationList.map((org) => (
              <DropdownMenuItem
                key={org.title}
                onClick={() => handleSelectOrg(org)}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center overflow-hidden rounded-sm border bg-background'>
                  {org.logo ? (
                    <img
                      src={org.logo}
                      alt={org.title}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <Building2 className='size-4' />
                  )}
                </div>
                {org.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className='gap-2 p-2'>
              <Link to='/onboarding'>
                <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                  <List className='size-4' />
                </div>
                <div className='font-medium text-muted-foreground'>
                  View All
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
