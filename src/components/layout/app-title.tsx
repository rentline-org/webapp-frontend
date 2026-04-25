import { Link } from '@tanstack/react-router'
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
          className='gap-0 py-0 hover:bg-transparent active:bg-transparent'
          asChild
        >
          <div>
            <Link
              to='/'
              onClick={() => setOpenMobile(false)}
              className='grid flex-1 text-start text-sm leading-tight'
            >
              <span className='truncate font-bold'>Rentline Logo</span>
            </Link>
          </div>
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
