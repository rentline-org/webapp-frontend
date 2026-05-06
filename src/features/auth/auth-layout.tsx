import { LogoFull } from '@/assets/logo-full'

type AuthLayoutProps = {
  children: React.ReactNode
  showLogo?: boolean
}

export function AuthLayout({ children, showLogo = false }: AuthLayoutProps) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:p-8'>
        {showLogo && (
          <div className='mx-auto flex w-full flex-col items-center justify-center space-y-2 py-8 sm:w-120 sm:p-8'>
            <div className='mb-4 flex items-center justify-center'>
              <LogoFull className='me-2' />
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
