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
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { data: userProfile, isLoading, isFetching } = useUserProfileQuery()

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
        {sidebarData.navGroups.map((props) => (
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
