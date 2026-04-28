import { Card, CardContent } from '@/components/ui/card'

function ModulePlaceholder({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: { label: string; value: string }[]
}) {
  return (
    <Card className='w-full'>
      <CardContent className='w-full'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>{title}</h2>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>

        <div className='mt-6 grid w-full gap-3 md:grid-cols-3'>
          {items.map((item) => (
            <div
              key={item.label}
              className='w-full rounded-2xl border bg-muted/20 p-4'
            >
              <p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
                {item.label}
              </p>
              <p className='mt-2 text-sm font-medium'>{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ModulePlaceholder
