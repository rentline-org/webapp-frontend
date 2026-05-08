import { Loader2 } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { ContentSection } from '../components/content-section'
import AvatarUpload from './components/avatar-upload'
import { ProfileForm } from './profile-form'
import { useUserProfileQuery } from './query'

export function SettingsProfile() {
  const { data: user, isLoading } = useUserProfileQuery()

  return (
    <ContentSection
      title='Profile'
      desc='Your account information'
      actions={<ConfigDrawer />}
    >
      <div className='w-full space-y-8'>
        {isLoading ? (
          <Loader2 className='mx-auto size-6 animate-spin' />
        ) : (
          <>
            <AvatarUpload avatarUrl={user?.photo} />
            <ProfileForm user={user!} />
          </>
        )}
      </div>
    </ContentSection>
  )
}
