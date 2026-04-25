import { ConfigDrawer } from '@/components/config-drawer'
import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Profile'
      desc='This is how others will see you on the site.'
      actions={<ConfigDrawer />}
    >
      <ProfileForm />
    </ContentSection>
  )
}
