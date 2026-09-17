import {
  HelpCircle,
  Settings,
  Users,
  Home,
  Building2,
  Clipboard,
  File,
  FileKey2,
  UserRoundCog,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Home',
          url: '/',
          icon: Home,
        },
        {
          title: 'Properties',
          url: '/properties',
          icon: Building2,
        },
        {
          title: 'Listings',
          url: '/listings',
          icon: Clipboard,
        },
        {
          title: 'Contacts',
          url: '/contacts',
          icon: Users,
        },
        {
          title: 'Documents',
          url: '/documents',
          icon: File,
        },
        {
          title: 'Leases',
          url: '/leases',
          icon: FileKey2,
        },
        {
          title: 'Team',
          url: '/users',
          icon: UserRoundCog,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          url: '/settings',
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
