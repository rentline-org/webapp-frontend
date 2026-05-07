---
trigger: always_on
---

Below is how I want you to handle CRUDs:

* I want you to always use optimistic updates when updating or deleting from the crud. 
* I want each feature to be added in the /features/ folder, inside is a components, hooks, query (for tanstack query only), types (this will contain dto interfaces, zod schemas and more)
* components for feature specific components
* At the root of the feature are components that are used inside the route, for example `create-property.tsx`
* use cache.ts from the api folder to handle optimistic updates, make sure the query keys are easy to use and the code is split as much as possible in different components and functions to make this maintainable and clean. 
* Type safety is a must, avoid using `any` or other vague typescript errors and it must be clean and readable. 

Remember to keep the UI as it is now, and follow the same design pattern, if components are able to be reusable without too much complexity do so, otherwise create similar components with the necessary adjustments if they are feature specific.

use tailwind and shadcn, do not modify the classnames for shadcn components because I have a very specific theme, which is default to most components. The design pattern must be modern saas and the ui/ux to focus on user experience, I don't want massive forms, such as the property-details, for edit / view pages in the CRUD must be similar to `property-details.tsx` where `inline-text.tsx` and `editable-item.tsx` components are used for example, table especially for certain items. 
  