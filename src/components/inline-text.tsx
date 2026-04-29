import { useEffect, useMemo, useState } from 'react'
import { PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type InlineTextProps = {
  value: string
  editable?: boolean
  onChange?: (value: string) => void
  className?: string
  textClassName?: string
  inputClassName?: string
  placeholder?: string
}

function InlineText({
  value,
  editable = false,
  onChange,
  className,
  textClassName,
  inputClassName,
  placeholder = 'Untitled',
}: InlineTextProps) {
  const [showEditButton, setShowEditButton] = useState(false)
  const [editState, setEditState] = useState(false)
  const [newValue, setNewValue] = useState(value)

  const canShowButton = useMemo(
    () => editable && showEditButton && !editState,
    [editState, editable, showEditButton]
  )

  useEffect(() => {
    const handleChange = (value: string) => {
      if (onChange) {
        onChange(value)
      }
    }

    handleChange(newValue)
  }, [newValue, onChange])

  return (
    <div
      className={cn(
        'group flex items-center gap-6',
        !canShowButton && 'pr-10',
        className
      )}
      onMouseOver={() => setShowEditButton(true)}
      onMouseLeave={() => setShowEditButton(false)}
    >
      {editable && editState ? (
        <Input
          value={newValue}
          autoFocus
          placeholder={placeholder}
          className={cn(
            'h-auto min-w-0 border-0 bg-transparent px-4 shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
            inputClassName
          )}
          onChange={(e) => setNewValue(e.target.value)}
          onBlur={() => setEditState(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditState(false)
            }
          }}
        />
      ) : (
        <div
          className={cn(
            'font-inherit min-w-0 leading-tight wrap-break-word',
            !newValue && 'text-muted-foreground',
            textClassName
          )}
        >
          {newValue || placeholder}
        </div>
      )}

      {canShowButton && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='-mt-0.5 size-7 shrink-0'
          onClick={() => setEditState(true)}
        >
          <PenLine className='size-4' />
        </Button>
      )}
    </div>
  )
}

export default InlineText
