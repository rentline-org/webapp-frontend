import { QuestionMarkCircledIcon } from '@radix-ui/react-icons'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

const OrganizationDefinition = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <QuestionMarkCircledIcon className='size-5' />
      </PopoverTrigger>
      <PopoverContent side='top'>
        <PopoverTitle>What is an organization?</PopoverTitle>
        <PopoverDescription className='text-sm leading-tight'>
          Your organization represents your business, you can have more than one
          to separate or organize who and where your properties are.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}

export default OrganizationDefinition
