import { Link } from '@tanstack/react-router'
import { LogoFull } from '@/assets/logo-full'
import { cn } from '@/lib/utils'
import { Safari } from '@/components/ui/safari'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn2() {
  return (
    <div className='relative container grid h-svh flex-col items-start justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='lg:px-8 lg:pt-20 lg:pb-8'>
        <div className='mx-auto flex w-full flex-col items-center justify-center space-y-2 py-8 sm:w-120 sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <LogoFull className='me-2' />
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>Sign in</h2>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password below to log into{' '}
              <br className='max-sm:hidden' /> your account. Don't have an
              account?{' '}
              <Link
                to='/sign-up'
                className='text-nowrap underline underline-offset-4 hover:text-primary'
              >
                Sign Up
              </Link>
            </p>
          </div>
          <UserAuthForm />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            By clicking sign in, you agree to our{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className={cn(
          'relative h-full overflow-hidden bg-muted max-lg:hidden',
          '[&>*]:absolute [&>*]:top-[15%] [&>*]:left-20 [&>*]:w-[120%] [&>*]:max-w-none [&>*]:select-none'
        )}
      >
        <Safari
          className='dark:hidden'
          mode='simple'
          url='app.rentline.io'
          imageSrc='/images/dashboard_light.png'
        />
        {/* <img
          src={dashboardLight}
          className='dark:hidden'
          width={1024}
          height={1151}
          alt='Rentline Platform'
        />
        <img
          src={dashboardDark}
          className='hidden dark:block'
          width={1024}
          height={1138}
          alt='Rentline Platform'
        /> */}
      </div>
    </div>
  )
}
