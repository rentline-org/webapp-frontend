import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Bell, Check, Loader2, X } from 'lucide-react'
import { useAppFormatters } from '@/i18n/use-formatters'
import { cn } from '@/lib/utils'
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
import {
  type IOperationsNotification,
  useGetNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '../query'

export default function NotificationsPanel() {
  const { t } = useTranslation('dashboard')
  const query = useGetNotifications()
  const markAllRead = useMarkAllNotificationsRead()
  const notifications = query.data?.items ?? []
  const unread = notifications.filter((notification) => !notification.read_at)

  return (
    <Drawer direction='right'>
      <DrawerTrigger asChild>
        <button
          type='button'
          aria-label={t('notifications.title')}
          className='relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
        >
          <Bell className='size-5' />
          {unread.length > 0 ? (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-[10px] font-medium'
            >
              {Math.min(unread.length, 99)}
            </Badge>
          ) : null}
        </button>
      </DrawerTrigger>

      <DrawerContent className='fixed right-0 z-50 mt-0 flex h-full w-full flex-col rounded-none border-l bg-background p-0 sm:max-w-md'>
        <DrawerHeader className='border-b px-4 py-5 text-left sm:px-6'>
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-1'>
              <DrawerTitle>{t('notifications.title')}</DrawerTitle>
              <DrawerDescription>
                {t('notifications.description')}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button type='button' variant='ghost' size='icon'>
                <X />
                <span className='sr-only'>{t('notifications.close')}</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <Tabs defaultValue='all' className='flex min-h-0 flex-1 flex-col'>
          <div className='flex items-center justify-between gap-3 border-b px-4 py-2 sm:px-6'>
            <TabsList className='h-9'>
              <TabsTrigger value='all'>{t('notifications.all')}</TabsTrigger>
              <TabsTrigger value='unread'>
                {t('notifications.unread')}
                {unread.length ? ` (${unread.length})` : ''}
              </TabsTrigger>
            </TabsList>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              disabled={unread.length === 0 || markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              {markAllRead.isPending ? (
                <Loader2 className='animate-spin' />
              ) : (
                <Check />
              )}
              <span className='hidden sm:inline'>
                {t('notifications.markAll')}
              </span>
            </Button>
          </div>

          <TabsContent value='all' className='mt-0 min-h-0 flex-1'>
            <NotificationList
              notifications={notifications}
              isLoading={query.isLoading}
              isError={query.isError}
            />
          </TabsContent>
          <TabsContent value='unread' className='mt-0 min-h-0 flex-1'>
            <NotificationList
              notifications={unread}
              isLoading={query.isLoading}
              isError={query.isError}
            />
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  )
}

function NotificationList({
  notifications,
  isLoading,
  isError,
}: {
  notifications: IOperationsNotification[]
  isLoading: boolean
  isError: boolean
}) {
  const { t } = useTranslation('dashboard')

  if (isLoading) {
    return (
      <div className='flex h-full min-h-56 items-center justify-center'>
        <Loader2 className='size-5 animate-spin text-muted-foreground' />
        <span className='sr-only'>{t('notifications.loading')}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <p className='px-6 py-12 text-center text-sm text-muted-foreground'>
        {t('notifications.loadError')}
      </p>
    )
  }

  if (notifications.length === 0) {
    return (
      <p className='px-6 py-12 text-center text-sm text-muted-foreground'>
        {t('notifications.empty')}
      </p>
    )
  }

  return (
    <ScrollArea className='h-full'>
      <div className='divide-y'>
        {notifications.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} />
        ))}
      </div>
    </ScrollArea>
  )
}

function NotificationRow({
  notification,
}: {
  notification: IOperationsNotification
}) {
  const { t } = useTranslation('dashboard')
  const { formatDate } = useAppFormatters()
  const markRead = useMarkNotificationRead()

  return (
    <article
      className={cn(
        'space-y-3 px-4 py-4 sm:px-6',
        !notification.read_at && 'bg-primary/[0.04]'
      )}
    >
      <div className='flex items-start gap-3'>
        <span
          className={cn(
            'mt-1 size-2 shrink-0 rounded-full',
            notification.read_at ? 'bg-muted' : 'bg-primary'
          )}
        />
        <div className='min-w-0 flex-1'>
          <p className='font-medium'>{notification.data.title}</p>
          <p className='mt-1 text-xs text-muted-foreground'>
            {t('notifications.itemCount', {
              count: notification.data.count,
            })}{' '}
            · {formatDate(notification.created_at)}
          </p>
        </div>
        {!notification.read_at ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            disabled={markRead.isPending}
            aria-label={t('notifications.markRead')}
            onClick={() => markRead.mutate(notification.id)}
          >
            {markRead.isPending ? (
              <Loader2 className='animate-spin' />
            ) : (
              <Check />
            )}
          </Button>
        ) : null}
      </div>

      <ul className='ml-5 space-y-1 text-sm text-muted-foreground'>
        {notification.data.action_items.slice(0, 3).map((item) => (
          <li key={item.id} className='truncate'>
            {item.title}
          </li>
        ))}
      </ul>

      <DrawerClose asChild>
        <Button asChild variant='outline' size='sm' className='ml-5'>
          <Link
            to='/tasks'
            onClick={() => {
              if (!notification.read_at) markRead.mutate(notification.id)
            }}
          >
            {t('notifications.openActions')}
          </Link>
        </Button>
      </DrawerClose>
    </article>
  )
}
