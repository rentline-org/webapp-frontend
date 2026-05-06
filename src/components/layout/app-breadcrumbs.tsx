import { Fragment } from 'react'
import { isMatch, Link, useMatches } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function AppBreadcrumbs() {
  const matches = useMatches()

  const crumbs = matches
    .filter((match) => isMatch(match, 'loaderData.crumb'))
    // .filter((match) => match.routeId !== '/a')
    .map((match) => ({
      id: match.id,
      href: match.pathname,
      label: match?.loaderData?.crumb as string,
      // icon: match?.loaderData?.icon as LucideIcon,
    }))

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1

          return (
            <Fragment key={crumb.id}>
              <BreadcrumbItem className='capitalize'>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
