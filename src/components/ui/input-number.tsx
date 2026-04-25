import { MinusIcon, PlusIcon } from 'lucide-react'
import {
  Button,
  Group,
  Input,
  InputProps,
  NumberField,
  NumberFieldProps,
} from 'react-aria-components'

const InputWithEndButtons = (props: NumberFieldProps) => {
  return (
    <NumberField
      defaultValue={1}
      minValue={1}
      className='w-full space-y-2'
      value={props.value}
      onChange={props.onChange}
    >
      <Group className='relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border border-input bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:border-ring data-focus-within:ring-[3px] data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:data-focus-within:has-aria-invalid:ring-destructive/40'>
        <Input className='w-full grow px-3 py-2 text-center tabular-nums outline-none selection:bg-primary selection:text-primary-foreground' />
        <Button
          slot='decrement'
          className='mr-1.5 flex aspect-square h-5 items-center justify-center rounded-sm border border-input bg-background text-sm text-muted-foreground transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          <MinusIcon className='size-3' />
          <span className='sr-only'>Decrement</span>
        </Button>
        <Button
          slot='increment'
          className='mr-2 flex aspect-square h-5 items-center justify-center rounded-sm border border-input bg-background text-sm text-muted-foreground transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          <PlusIcon className='size-3' />
          <span className='sr-only'>Increment</span>
        </Button>
      </Group>
    </NumberField>
  )
}

export default InputWithEndButtons
