import { Loader2 } from 'lucide-react'
import { ContentSection } from '../components/content-section'
import { useUserProfileQuery } from '../profile/query'
import DeleteActiveOrganization from './components/delete-active-organization'
import EditOrganizationForm from './edit-organization-form'

const OrganizationDetails = () => {
  const { data, isLoading } = useUserProfileQuery()

  return (
    <ContentSection
      title='My Organization'
      desc='You may view or update your organization details and avatar.'
      actions={
        data?.active_organization?.id && (
          <DeleteActiveOrganization
            organizationId={data.active_organization.id}
          />
        )
      }
      fullWidth
    >
      {isLoading ? <Loader2 /> : <EditOrganizationForm user={data!} />}
    </ContentSection>
  )
}

export default OrganizationDetails
