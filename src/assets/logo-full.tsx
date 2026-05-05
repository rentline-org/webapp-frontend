import type { ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function LogoFull({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      src='/images/logo_full.png'
      crossOrigin=''
      className={cn('object-contain', className)}
    />
  )
}
