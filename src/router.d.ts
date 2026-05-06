import '@tanstack/react-router'
import type { BreadcrumbKey } from './components/layout/types'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    breadcrumbKey?: BreadcrumbKey
  }
}
