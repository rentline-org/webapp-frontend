import {
  HelpCircle,
  Settings,
  Wrench,
  Users,
  Home,
  Building2,
  BookUser,
  BadgeDollarSign,
  Clipboard,
  File,
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
          title: 'Accounting',
          url: '/accounting',
          icon: BadgeDollarSign,
        },
        {
          title: 'Listings',
          url: '/listings',
          icon: Clipboard,
        },
        {
          title: 'Maintenance',
          url: '/maintenance',
          icon: Wrench,
        },
        {
          title: 'Contacts',
          url: '/contacts',
          icon: Users,
        },
        {
          title: 'Reports',
          url: '/reports',
          icon: BookUser,
        },
        {
          title: 'Documents',
          url: '/documents',
          icon: File,
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
