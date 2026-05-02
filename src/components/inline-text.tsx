import { useRef, useState } from 'react'
import { PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type InlineTextProps = {
  value: string
  editable?: boolean
  onSubmit?: (value: string) => void
  className?: string
  textClassName?: string
  inputClassName?: string
  placeholder?: string
  multiline?: boolean
}

function InlineText({
  value,
  editable = false,
  onSubmit,
  className,
  textClassName,
  inputClassName,
  placeholder = 'Untitled',
  multiline = false,
}: InlineTextProps) {
  const [showEditButton, setShowEditButton] = useState(false)
  const [editState, setEditState] = useState(false)
  const [draft, setDraft] = useState(value)
  const hasCommittedRef = useRef(false)

  const canShowButton = editable && showEditButton && !editState

  const startEdit = () => {
    hasCommittedRef.current = false
    setDraft(value)
    setEditState(true)
  }

  const commitEdit = () => {
    if (hasCommittedRef.current) return
    hasCommittedRef.current = true
    setEditState(false)

    if (draft !== value) {
      onSubmit?.(draft)
    }
  }

  const cancelEdit = () => {
    hasCommittedRef.current = true
    setDraft(value)
    setEditState(false)
  }

  return (
    <div
      className={cn(
        'group flex w-full items-center gap-3',
        !canShowButton && 'pr-10',
        className
      )}
      onMouseEnter={() => setShowEditButton(true)}
      onMouseLeave={() => setShowEditButton(false)}
    >
      {editable && editState ? (
        multiline ? (
          <textarea
            value={draft}
            autoFocus
            placeholder={placeholder}
            className={cn(
              'min-h-20 w-full resize-none rounded-md border-0 bg-secondary/50 p-2 text-inherit shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              inputClassName
            )}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                cancelEdit()
              }

              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                commitEdit()
                e.currentTarget.blur()
              }
            }}
          />
        ) : (
          <Input
            value={draft}
            autoFocus
            placeholder={placeholder}
            className={cn(
              'h-auto w-full min-w-0 border-0 bg-secondary/50 px-2 shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              inputClassName
            )}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitEdit()
                e.currentTarget.blur()
              }

              if (e.key === 'Escape') {
                e.preventDefault()
                cancelEdit()
              }
            }}
          />
        )
      ) : (
        <div
          className={cn(
            'min-w-0 leading-relaxed wrap-break-word whitespace-pre-wrap',
            !value && 'text-muted-foreground',
            textClassName
          )}
        >
          {value || placeholder}
        </div>
      )}

      {canShowButton && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='-mt-0.5 size-7 shrink-0'
          onClick={startEdit}
        >
          <PenLine className='size-4' />
        </Button>
      )}
    </div>
  )
}

export default InlineText
