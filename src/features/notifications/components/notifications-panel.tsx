import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCircle, Expand, X } from 'lucide-react'
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

      <DrawerContent className='w-1/3!'>
        <DrawerHeader className='w-full px-6 py-5'>
          <div className='flex w-full items-center justify-between'>
            <div>
              <DrawerTitle className='text-xl'>Notifications</DrawerTitle>
              <DrawerDescription>
                Stay updated with your rental activity
              </DrawerDescription>
            </div>

            <div className='flex items-center gap-3'>
              <Button variant='ghost' size='icon'>
                <Expand className='size-5' />
                {/* <LucideExpand /> */}
              </Button>
              <DrawerClose asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <X className='size-5' />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <Tabs defaultValue='all' className='flex flex-1 flex-col'>
          <TabsList className='flex w-full items-center justify-between rounded-none border-b px-6'>
            <div className='flex items-center gap-2'>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='unread'>Unread ({unreadCount})</TabsTrigger>
            </div>

            <Button
              variant='link'
              className='col-span-2'
              size='sm'
              onClick={() => {}}
            >
              Mark all as read
            </Button>
          </TabsList>

          <TabsContent value='all' className='mt-0 flex-1 p-0'>
            <NotificationList notifications={sampleNotifications} />
          </TabsContent>

          <TabsContent value='unread' className='mt-0 flex-1 p-0'>
            <NotificationList
              notifications={sampleNotifications.filter((n) => n.isUnread)}
            />
          </TabsContent>
        </Tabs>

        {/* Footer only has spacing now (no buttons) */}
        {/* <DrawerFooter className='px-6 py-4' /> */}
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
    <ScrollArea className='flex-1 px-6 py-4'>
      <div className='space-y-3'>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex gap-4 rounded-2xl border bg-card p-4 transition-all hover:bg-accent/50 ${
              notification.isUnread ? 'border-border bg-muted/60' : ''
            }`}
          >
            {/* Avatar / Icon */}
            <div className='mt-0.5 shrink-0'>
              {notification.avatar ? (
                <Avatar className='h-10 w-10'>
                  <AvatarImage src={notification.avatar} />
                  <AvatarFallback className='text-xs'>
                    {notification.title.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                  {notification.icon}
                </div>
              )}
            </div>

            {/* Content */}
            <div className='min-w-0 flex-1'>
              <p className='text-sm leading-snug font-medium text-foreground'>
                {notification.title}
              </p>
              <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                {notification.description}
              </p>
              <p className='mt-2 text-xs text-muted-foreground'>
                {formatDistanceToNow(notification.time, { addSuffix: true })}
              </p>
            </div>

            {/* Unread indicator */}
            {notification.isUnread && (
              <div className='mt-2 h-2 w-2 shrink-0 rounded-full bg-primary' />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
