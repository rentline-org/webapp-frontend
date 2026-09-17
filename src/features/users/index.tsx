import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Loader2,
  MailPlus,
  RefreshCw,
  Trash2,
  UserRoundCog,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppFormatters } from '@/i18n/use-formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Main } from '@/components/layout/main'
import {
  useOrganizationInvitations,
  useOrganizationMembers,
  useRemoveOrganizationMember,
  useResendOrganizationInvitation,
  useRevokeOrganizationInvitation,
  useUpdateOrganizationMember,
} from '@/features/organization-access/query'
import type {
  IOrganizationInvitation,
  IOrganizationMember,
  OrganizationMemberRole,
  OrganizationMemberStatus,
} from '@/features/organization-access/types'
import { UsersInviteDialog } from './components/users-invite-dialog'

const editableRoles = ['admin', 'manager', 'agent', 'tenant'] as const
const editableStatuses = ['active', 'suspended'] as const

type ConfirmTarget =
  | { type: 'member'; record: IOrganizationMember }
  | { type: 'invitation'; record: IOrganizationInvitation }

export function Users() {
  const { t } = useTranslation('invitations')
  const { formatDate } = useAppFormatters()
  const members = useOrganizationMembers()
  const invitations = useOrganizationInvitations()
  const removeMember = useRemoveOrganizationMember()
  const revokeInvitation = useRevokeOrganizationInvitation()
  const resendInvitation = useResendOrganizationInvitation()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null)

  const isLoading = members.isLoading || invitations.isLoading
  const hasError = members.isError || invitations.isError
  const pendingInvitations = useMemo(
    () =>
      (invitations.data ?? []).filter((invitation) =>
        ['pending', 'expired'].includes(invitation.status)
      ),
    [invitations.data]
  )

  const confirmRemoval = () => {
    if (!confirmTarget) return

    const mutation =
      confirmTarget.type === 'member' ? removeMember : revokeInvitation
    mutation.mutate(confirmTarget.record.id, {
      onSuccess: () => {
        toast.success(
          confirmTarget.type === 'member'
            ? t('admin.memberRemoved', { defaultValue: 'Access removed.' })
            : t('admin.invitationRevoked', {
                defaultValue: 'Invitation revoked.',
              })
        )
        setConfirmTarget(null)
      },
    })
  }

  return (
    <>
      <Main className='flex flex-1 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              {t('admin.membersTitle', { defaultValue: 'Organization access' })}
            </h1>
            <p className='max-w-2xl text-sm text-muted-foreground'>
              {t('admin.membersDescription', {
                defaultValue:
                  'Manage who can operate the organization and who has tenant portal access.',
              })}
            </p>
          </div>
          <Button
            className='w-full sm:w-auto'
            onClick={() => setInviteOpen(true)}
          >
            <MailPlus />
            {t('admin.title')}
          </Button>
        </div>

        {hasError ? (
          <Card>
            <CardContent className='flex min-h-56 flex-col items-center justify-center gap-3 text-center'>
              <UserRoundCog className='size-8 text-muted-foreground' />
              <p className='font-medium'>
                {t('admin.loadError', {
                  defaultValue: 'Organization access could not be loaded.',
                })}
              </p>
              <Button
                variant='outline'
                onClick={() =>
                  void Promise.all([members.refetch(), invitations.refetch()])
                }
              >
                <RefreshCw />
                {t('admin.retry', { defaultValue: 'Try again' })}
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className='grid gap-4'>
            <Skeleton className='h-56 w-full' />
            <Skeleton className='h-40 w-full' />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {t('admin.membersTitle', { defaultValue: 'Members' })}
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                {(members.data ?? []).length === 0 ? (
                  <EmptyState
                    text={t('admin.membersEmpty', {
                      defaultValue: 'No active organization members yet.',
                    })}
                  />
                ) : (
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t('admin.member', { defaultValue: 'Member' })}
                          </TableHead>
                          <TableHead>{t('admin.role')}</TableHead>
                          <TableHead>
                            {t('admin.status', { defaultValue: 'Status' })}
                          </TableHead>
                          <TableHead className='hidden lg:table-cell'>
                            {t('admin.joined', { defaultValue: 'Joined' })}
                          </TableHead>
                          <TableHead className='w-24 text-right'>
                            <span className='sr-only'>
                              {t('admin.actions', { defaultValue: 'Actions' })}
                            </span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(members.data ?? []).map((member) => (
                          <MemberRow
                            key={`${member.id}:${member.role}:${member.status}`}
                            member={member}
                            onRemove={() =>
                              setConfirmTarget({
                                type: 'member',
                                record: member,
                              })
                            }
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {t('admin.pendingTitle', {
                    defaultValue: 'Pending invitations',
                  })}
                </CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {t('admin.pendingDescription', {
                    defaultValue:
                      'Invitations expire after seven days and can be resent or revoked.',
                  })}
                </p>
              </CardHeader>
              <CardContent className='p-0'>
                {pendingInvitations.length === 0 ? (
                  <EmptyState
                    text={t('admin.pendingEmpty', {
                      defaultValue: 'There are no pending invitations.',
                    })}
                  />
                ) : (
                  <div className='divide-y'>
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'
                      >
                        <div className='min-w-0 space-y-1'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <p className='truncate font-medium'>
                              {invitation.email}
                            </p>
                            <Badge variant='outline'>
                              {t(`roles.${invitation.role}`)}
                            </Badge>
                            <Badge
                              variant={
                                invitation.status === 'expired'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {t(`admin.${invitation.status}`)}
                            </Badge>
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {t('admin.expires', { defaultValue: 'Expires' })}:{' '}
                            {formatDate(invitation.expires_at)}
                          </p>
                        </div>
                        <div className='flex gap-2'>
                          {invitation.capabilities.can_resend && (
                            <Button
                              size='sm'
                              variant='outline'
                              disabled={resendInvitation.isPending}
                              onClick={() =>
                                resendInvitation.mutate(invitation.id, {
                                  onSuccess: () =>
                                    toast.success(
                                      t('admin.sent', {
                                        defaultValue: 'Invitation sent.',
                                      })
                                    ),
                                })
                              }
                            >
                              {resendInvitation.isPending && (
                                <Loader2 className='animate-spin' />
                              )}
                              {t('admin.resend', { defaultValue: 'Resend' })}
                            </Button>
                          )}
                          {invitation.capabilities.can_revoke && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() =>
                                setConfirmTarget({
                                  type: 'invitation',
                                  record: invitation,
                                })
                              }
                            >
                              {t('admin.revoke', { defaultValue: 'Revoke' })}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Main>

      <UsersInviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget?.type === 'member'
            ? t('admin.removeTitle')
            : t('admin.revokeTitle')
        }
        desc={t('admin.removeDescription', {
          defaultValue:
            'This takes effect immediately and does not delete historical records.',
        })}
        confirmText={t('admin.confirm', { defaultValue: 'Confirm' })}
        destructive
        isLoading={removeMember.isPending || revokeInvitation.isPending}
        handleConfirm={confirmRemoval}
      />
    </>
  )
}

function MemberRow({
  member,
  onRemove,
}: {
  member: IOrganizationMember
  onRemove: () => void
}) {
  const { t } = useTranslation('invitations')
  const { formatDate } = useAppFormatters()
  const updateMember = useUpdateOrganizationMember()
  const [role, setRole] = useState<OrganizationMemberRole>(member.role)
  const [status, setStatus] = useState<OrganizationMemberStatus>(member.status)

  const hasChanges = role !== member.role || status !== member.status

  const save = () => {
    if (role === 'owner') return
    updateMember.mutate(
      { memberId: member.id, payload: { role, status } },
      {
        onSuccess: () =>
          toast.success(
            t('admin.memberUpdated', { defaultValue: 'Member access updated.' })
          ),
      }
    )
  }

  return (
    <TableRow>
      <TableCell className='min-w-52'>
        <p className='font-medium'>{member.name}</p>
        <p className='text-xs text-muted-foreground'>{member.email}</p>
      </TableCell>
      <TableCell className='min-w-40'>
        {member.role === 'owner' ? (
          <Badge variant='secondary'>{t('roles.owner')}</Badge>
        ) : (
          <Select
            value={role}
            onValueChange={(value) => setRole(value as OrganizationMemberRole)}
            disabled={!member.capabilities.can_update || updateMember.isPending}
          >
            <SelectTrigger aria-label={t('admin.role')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {editableRoles.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`roles.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </TableCell>
      <TableCell className='min-w-36'>
        {member.role === 'owner' ? (
          <Badge variant='outline'>{t(`admin.${member.status}`)}</Badge>
        ) : (
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as OrganizationMemberStatus)
            }
            disabled={!member.capabilities.can_update || updateMember.isPending}
          >
            <SelectTrigger
              aria-label={t('admin.status', { defaultValue: 'Status' })}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {editableStatuses.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`admin.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </TableCell>
      <TableCell className='hidden whitespace-nowrap lg:table-cell'>
        {formatDate(member.joined_at)}
      </TableCell>
      <TableCell>
        <div className='flex justify-end gap-1'>
          {member.capabilities.can_update && hasChanges && (
            <Button size='sm' disabled={updateMember.isPending} onClick={save}>
              {updateMember.isPending && <Loader2 className='animate-spin' />}
              {t('admin.save', { defaultValue: 'Save' })}
            </Button>
          )}
          {member.capabilities.can_remove && (
            <Button
              size='icon'
              variant='ghost'
              aria-label={t('admin.remove')}
              onClick={onRemove}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className='px-6 py-12 text-center text-sm text-muted-foreground'>
      {text}
    </div>
  )
}
