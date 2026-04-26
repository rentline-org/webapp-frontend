import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCircle, Expand, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Notification = {
  id: string
  type: 'lease' | 'maintenance' | 'payment' | 'tenant' | 'system'
  title: string
  description: string
  time: Date
  isUnread: boolean
  avatar?: string
  icon?: React.ReactNode
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'maintenance',
    title: 'Olivia Martin submitted a maintenance request',
    description: 'Leaking faucet in Unit 12B - Kitchen',
    time: new Date(Date.now() - 1000 * 60 * 45),
    isUnread: true,
    avatar: 'https://i.pravatar.cc/150?u=olivia',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Jackson Lee paid rent for Unit 8A',
    description: '$1,450 • Received via bank transfer',
    time: new Date(Date.now() - 1000 * 60 * 60 * 3),
    isUnread: true,
    avatar: 'https://i.pravatar.cc/150?u=jackson',
  },
  {
    id: '3',
    type: 'lease',
    title: 'Isabella Nguyen lease renewal is due soon',
    description: 'Unit 5C • Expires in 18 days',
    time: new Date(Date.now() - 1000 * 60 * 60 * 7),
    isUnread: false,
    avatar: 'https://i.pravatar.cc/150?u=isabella',
  },
  {
    id: '4',
    type: 'maintenance',
    title: 'New maintenance request from William Kim',
    description: 'AC not cooling properly - Unit 3D',
    time: new Date(Date.now() - 1000 * 60 * 60 * 12),
    isUnread: true,
    avatar: 'https://i.pravatar.cc/150?u=william',
  },
  {
    id: '5',
    type: 'system',
    title: 'Subscription renewed successfully',
    description: 'Pro Plan • Next billing: May 25, 2026',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isUnread: false,
    icon: <CheckCircle className='h-5 w-5 text-emerald-500' />,
  },
]

export default function NotificationsPanel() {
  const unreadCount = sampleNotifications.filter((n) => n.isUnread).length

  return (
    <Drawer direction='right'>
      <DrawerTrigger asChild>
        <button className='relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-accent'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-[10px] font-medium'
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent className='fixed right-0 z-50 mt-0 flex h-full w-full flex-col rounded-none border-l bg-background md:w-112.5 lg:w-125'>
        <DrawerHeader className='px-4 py-5 md:px-6'>
          <div className='flex w-full items-center justify-between'>
            <div>
              <DrawerTitle className='text-lg md:text-xl'>
                Notifications
              </DrawerTitle>
              <DrawerDescription className='text-xs md:text-sm'>
                Stay updated with your rental activity
              </DrawerDescription>
            </div>

            <div className='flex items-center gap-1 md:gap-3'>
              <Button
                variant='ghost'
                size='icon'
                className='hidden sm:inline-flex'
              >
                <Expand className='size-5' />
              </Button>
              <DrawerClose asChild>
                <Button variant='ghost' size='icon' className='h-9 w-9'>
                  <X className='size-5' />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <Tabs
          defaultValue='all'
          className='flex flex-1 flex-col overflow-hidden'
        >
          <TabsList className='flex w-full items-center justify-between rounded-none border-b px-4 md:px-6'>
            <div className='flex items-center gap-1'>
              <TabsTrigger value='all' className='text-xs md:text-sm'>
                All
              </TabsTrigger>
              <TabsTrigger value='unread' className='text-xs md:text-sm'>
                Unread{' '}
                <span className='ml-1 hidden sm:inline'>({unreadCount})</span>
              </TabsTrigger>
            </div>

            <Button
              variant='link'
              size='sm'
              className='text-xs md:text-sm'
              onClick={() => {}}
            >
              Mark all as read
            </Button>
          </TabsList>

          <TabsContent value='all' className='mt-0 flex-1 overflow-hidden p-0'>
            <NotificationList notifications={sampleNotifications} />
          </TabsContent>

          <TabsContent
            value='unread'
            className='mt-0 flex-1 overflow-hidden p-0'
          >
            <NotificationList
              notifications={sampleNotifications.filter((n) => n.isUnread)}
            />
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  )
}

function NotificationList({
  notifications,
}: {
  notifications: Notification[]
}) {
  return (
    <ScrollArea className='h-full w-full px-4 py-4 md:px-6'>
      <div className='space-y-3 pb-8'>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'flex gap-3 rounded-xl border bg-card p-3 transition-all hover:bg-accent/50 md:gap-4 md:p-4',
              notification.isUnread
                ? 'border-primary/20 bg-primary/5'
                : 'border-border'
            )}
          >
            {/* Avatar / Icon */}
            <div className='mt-0.5 shrink-0'>
              {notification.avatar ? (
                <Avatar className='h-9 w-9 md:h-10 md:w-10'>
                  <AvatarImage src={notification.avatar} />
                  <AvatarFallback className='text-[10px] md:text-xs'>
                    {notification.title.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted md:h-10 md:w-10'>
                  {notification.icon}
                </div>
              )}
            </div>

            {/* Content */}
            <div className='min-w-0 flex-1'>
              <p className='text-xs leading-snug font-semibold text-foreground md:text-sm'>
                {notification.title}
              </p>
              <p className='mt-1 line-clamp-2 text-xs text-muted-foreground md:text-sm'>
                {notification.description}
              </p>
              <p className='mt-2 text-[10px] font-medium text-muted-foreground md:text-xs'>
                {formatDistanceToNow(notification.time, { addSuffix: true })}
              </p>
            </div>

            {/* Unread indicator */}
            {notification.isUnread && (
              <div className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]' />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
