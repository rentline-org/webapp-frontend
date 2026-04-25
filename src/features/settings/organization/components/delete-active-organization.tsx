import { Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  organizationId: number
}

const DeleteActiveOrganization = ({ organizationId }: Props) => {
  return (
    <Button
      variant='destructive'
      size='sm'
      // eslint-disable-next-line no-console
      onClick={() => console.log(organizationId)}
    >
      <Trash />
      Delete Organization
    </Button>
  )
}

export default DeleteActiveOrganization
