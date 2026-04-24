import {
  HelpCircle,
  Bell,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  GalleryVerticalEnd,
  Home,
  Building2,
  BookUser,
  BadgeDollarSign,
  Clipboard,
  File,
  GalleryHorizontal,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'My Business 1',
      logo: GalleryHorizontal,
      plan: 'Trial',
    },
    {
      name: 'My Business 2',
      logo: GalleryVerticalEnd,
      plan: 'Premium',
    },
    {
      name: 'My Business 3',
      logo: Building2,
      plan: 'Agency',
    },
  ],
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
          title: 'Properties & Units',
          url: '/apps',
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
    // {
    //   title: 'Pages',
    //   items: [
    //     {
    //       title: 'Auth',
    //       icon: ShieldCheck,
    //       items: [
    //         {
    //           title: 'Sign In',
    //           url: '/sign-in',
    //         },
    //         {
    //           title: 'Sign In (2 Col)',
    //           url: '/sign-in-2',
    //         },
    //         {
    //           title: 'Sign Up',
    //           url: '/sign-up',
    //         },
    //         {
    //           title: 'Forgot Password',
    //           url: '/forgot-password',
    //         },
    //         {
    //           title: 'OTP',
    //           url: '/otp',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Errors',
    //       icon: Bug,
    //       items: [
    //         {
    //           title: 'Unauthorized',
    //           url: '/errors/unauthorized',
    //           icon: Lock,
    //         },
    //         {
    //           title: 'Forbidden',
    //           url: '/errors/forbidden',
    //           icon: UserX,
    //         },
    //         {
    //           title: 'Not Found',
    //           url: '/errors/not-found',
    //           icon: FileX,
    //         },
    //         {
    //           title: 'Internal Server Error',
    //           url: '/errors/internal-server-error',
    //           icon: ServerOff,
    //         },
    //         {
    //           title: 'Maintenance Error',
    //           url: '/errors/maintenance-error',
    //           icon: Construction,
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            // {
            //   title: 'Display',
            //   url: '/settings/display',
            //   icon: Monitor,
            // },
          ],
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
