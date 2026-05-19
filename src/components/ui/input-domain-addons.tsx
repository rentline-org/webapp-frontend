import { useId } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Props = {
  containerClassName?: string
  defaultDomain: string
}

const InputDomainAddons = ({
  className,
  containerClassName,
  defaultDomain,
  ...props
}: Props & React.ComponentProps<'input'>) => {
  const id = useId()

  return (
    <div className={cn('w-full space-y-2', containerClassName)}>
      <div className='flex rounded-md shadow-xs'>
        <Input
          id={id}
          {...props}
          type='text'
          defaultValue={defaultDomain}
          className={cn('-mx-px rounded-r-none shadow-none', className)}
        />

        <span className='-z-1 inline-flex items-center rounded-r-md border border-input bg-background px-3 text-sm text-muted-foreground'>
          .rentline.io
        </span>
      </div>
    </div>
  )
}

export default InputDomainAddons
