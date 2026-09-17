import { useMemo } from 'react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { OrgSwitcher } from '@/features/organizations/org-switcher'
import { useUserProfileQuery } from '@/features/settings/profile/query'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { data: userProfile, isLoading, isFetching } = useUserProfileQuery()
  const navGroups = useMemo(() => {
    if (userProfile?.organization_role !== 'tenant')
      return sidebarData.navGroups

    const tenantUrls = new Set([
      '/',
      '/leases',
      '/documents',
      '/settings',
      '/help-center',
    ])
    return sidebarData.navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => 'url' in item && tenantUrls.has(String(item.url))
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [userProfile?.organization_role])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
        <OrgSwitcher
          userProfile={userProfile}
          isFetching={isFetching}
          isLoading={isLoading}
        />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={userProfile}
          isFetching={isFetching}
          isLoading={isLoading}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
