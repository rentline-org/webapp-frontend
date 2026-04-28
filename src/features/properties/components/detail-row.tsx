function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className='flex items-start gap-3 rounded-2xl border bg-secondary/35 p-4 shadow-sm'>
      {icon ? (
        <div className='mt-0.5 rounded-xl border bg-background p-2 text-muted-foreground'>
          {icon}
        </div>
      ) : null}
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-medium tracking-wide text-secondary-foreground uppercase'>
          {label}
        </p>
        <p className='mt-1 truncate text-sm font-medium text-foreground'>
          {value}
        </p>
      </div>
    </div>
  )
}

export default DetailRow
