import { Link } from '@tanstack/react-router'
import { Logo } from '@/assets/logo'
import { cn } from '@/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function AppTitle() {
  const { setOpenMobile, open } = useSidebar()

  return (
    <SidebarMenu className={cn(!open ? 'hidden' : '')}>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='mb-0 h-20 w-full gap-0 px-2 hover:bg-transparent active:bg-transparent'
          asChild
        >
          <Link
            to='/'
            onClick={() => setOpenMobile(false)}
            className='flex items-center gap-3 px-3 py-2'
          >
            <Logo className='h-10 w-10 shrink-0' />
            <div className='flex flex-col leading-tight'>
              <span className='text-sm font-semibold'>Rentline</span>
              <span className='text-xs text-muted-foreground'>Dashboard</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// function ToggleSidebar({
//   className,
//   onClick,
//   ...props
// }: React.ComponentProps<typeof Button>) {
//   const { toggleSidebar } = useSidebar()

//   return (
//     <Button
//       data-sidebar='trigger'
//       data-slot='sidebar-trigger'
//       variant='ghost'
//       size='icon'
//       className={cn('aspect-square size-8 max-md:scale-125', className)}
//       onClick={(event) => {
//         onClick?.(event)
//         toggleSidebar()
//       }}
//       {...props}
//     >
//       <X className='md:hidden' />
//       <Menu className='max-md:hidden' />
//       <span className='sr-only'>Toggle Sidebar</span>
//     </Button>
//   )
// }
