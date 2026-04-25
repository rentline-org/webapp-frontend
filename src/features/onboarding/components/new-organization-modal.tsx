import { Building2 } from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import CreateOrganizationForm from '@/features/organizations/components/create-organization-form'

const NewOrganizationModal = () => {
  const [open, setOpen] = useDialogState()

  return (
    <Dialog open={!!open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='mt-3'>
          <Building2 />
          New Organization
        </Button>
      </DialogTrigger>
      <DialogContent className='lg:min-w-2xl'>
        <DialogHeader>
          <DialogTitle>New Organization</DialogTitle>
          <DialogDescription>Enter your information below</DialogDescription>
        </DialogHeader>
        <CreateOrganizationForm modalOpen={!!open} setModalOpen={setOpen} />
      </DialogContent>
    </Dialog>
  )
}

export default NewOrganizationModal
