import * as React from 'react'
import { cn } from '@/lib/utils'

const MinimalCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-md bg-card p-2 text-card-foreground no-underline',
      'border border-border/60 shadow-sm transition-colors',
      'hover:bg-card/40 dark:hover:bg-card/10',
      'dark:bg-card',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
MinimalCard.displayName = 'MinimalCard'

const MinimalCardImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src: string
    alt: string
    imgClass?: string
  }
>(({ className, alt, src, imgClass = '', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative mb-6 h-47.5 w-full overflow-hidden rounded-md',
      'bg-muted shadow-sm',
      className
    )}
    {...props}
  >
    <img
      src={src}
      alt={alt}
      width={200}
      height={200}
      className={cn(
        'absolute inset-0 h-full w-full rounded-md object-cover',
        imgClass
      )}
    />

    <div className='pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-border/20' />
    <div className='pointer-events-none absolute inset-0 rounded-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]' />
    <div className='pointer-events-none absolute inset-0 rounded-[20px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]' />
  </div>
))
MinimalCardImage.displayName = 'MinimalCardImage'

const MinimalCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'mt-2 px-1 text-lg leading-tight font-semibold tracking-tight text-card-foreground',
      className
    )}
    {...props}
  />
))
MinimalCardTitle.displayName = 'MinimalCardTitle'

const MinimalCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('px-1 pb-2 text-sm text-muted-foreground', className)}
    {...props}
  />
))
MinimalCardDescription.displayName = 'MinimalCardDescription'

const MinimalCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
MinimalCardContent.displayName = 'MinimalCardContent'

const MinimalCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
MinimalCardFooter.displayName = 'MinimalCardFooter'

export {
  MinimalCard,
  MinimalCardImage,
  MinimalCardTitle,
  MinimalCardDescription,
  MinimalCardContent,
  MinimalCardFooter,
}

export default MinimalCard
