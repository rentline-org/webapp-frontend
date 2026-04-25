import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Sparkles,
  UserCog,
  Wallet,
} from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { SignOutDialog } from '@/components/sign-out-dialog'
import type { IUserProfileData } from '@/features/settings/profile/types'
import { Skeleton } from '../ui/skeleton'

type NavUserProps = {
  user: IUserProfileData | null | undefined
  isLoading: boolean
  isFetching: boolean
}

export function NavUser({ user, isLoading, isFetching }: NavUserProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()

  const showLoadingSkeleton = useMemo(
    () => isLoading || isFetching,
    [isLoading, isFetching]
  )

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              disabled={!user || showLoadingSkeleton}
            >
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                {showLoadingSkeleton ? (
                  <div className='h-10 w-full'>
                    <Skeleton className='h-10 w-full rounded-md' />
                  </div>
                ) : (
                  <>
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage src={user?.photo} alt={user!.name} />
                      <AvatarFallback className='rounded-lg'>
                        {user!.first_name!.charAt(0) +
                          user!.last_name!.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-start text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {user!.name}
                      </span>
                      <span className='truncate text-xs'>{user!.email}</span>
                    </div>
                    <ChevronsUpDown className='ms-auto size-4' />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage
                      src={user?.photo ?? '/avatars/shadcn.jpg'}
                      alt={user!.name}
                    />
                    <AvatarFallback className='rounded-lg'>
                      {user!.first_name!.charAt(0) + user!.last_name!.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{user!.name}</span>
                    <span className='truncate text-xs'>{user!.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade Plan
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to='/settings'>
                    <UserCog />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to='/settings'>
                    <Wallet />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to='/settings/notifications'>
                    <Bell />
                    Notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
