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
    <div className={cn('w-full min-w-0 space-y-2', containerClassName)}>
      <div className='flex min-w-0 rounded-md shadow-xs'>
        <Input
          id={id}
          {...props}
          type='text'
          defaultValue={defaultDomain}
          className={cn(
            '-mx-px min-w-0 flex-1 rounded-r-none shadow-none',
            className
          )}
        />

        <span className='-z-1 inline-flex shrink-0 items-center rounded-r-md border border-input bg-background px-2 text-xs text-muted-foreground sm:px-3 sm:text-sm'>
          .rentline.io
        </span>
      </div>
    </div>
  )
}

export default InputDomainAddons
