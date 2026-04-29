import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'

type DetailRowProps = {
  label: string
  value: string
  icon?: React.ReactNode
  editable?: boolean
  onChange?: (value: string) => void
}

function DetailRow({
  label,
  value,
  icon,
  editable = false,
  onChange,
}: DetailRowProps) {
  const [showEditButton, setShowEditButton] = useState(false)
  const [editState, setEditState] = useState(false)

  return (
    <Item
      variant='outline'
      onMouseOver={() => setShowEditButton(true)}
      onMouseLeave={() => setShowEditButton(false)}
      className='group'
    >
      {icon && <ItemMedia variant='icon'>{icon}</ItemMedia>}

      <ItemContent className='min-w-0 flex-1'>
        <ItemTitle className='truncate'>{label}</ItemTitle>

        {editable && editState ? (
          <Input
            value={value}
            autoFocus
            className='h-8 w-full min-w-0 border-0 bg-transparent px-4 text-sm shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            onChange={(e) => {
              onChange?.(e.target.value)
            }}
            onBlur={() => {
              setEditState(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditState(false)
              }
            }}
          />
        ) : (
          <ItemDescription className='leading-5 break-words'>
            {value}
          </ItemDescription>
        )}
      </ItemContent>

      {editable && showEditButton && !editState && (
        <ItemActions className='shrink-0'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8'
            onClick={() => setEditState(true)}
          >
            <PenLine className='size-4' />
          </Button>
        </ItemActions>
      )}
    </Item>
  )
}

export default DetailRow
