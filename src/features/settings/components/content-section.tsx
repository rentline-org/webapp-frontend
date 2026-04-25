import { type ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'

type ContentSectionProps = {
  title: string
  desc: string
  children: React.JSX.Element
  actions?: ReactNode
}

export function ContentSection({
  title,
  desc,
  children,
  actions,
}: ContentSectionProps) {
  return (
    <div className='flex w-full flex-1 flex-col'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex flex-col'>
          <h3 className='text-lg font-medium'>{title}</h3>
          <p className='text-sm text-muted-foreground'>{desc}</p>
        </div>

        <div className='flex items-center gap-2'>{actions}</div>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='-mx-1 px-1.5 lg:max-w-xl'>{children}</div>
      </div>
    </div>
  )
}
