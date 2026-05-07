---
trigger: always_on
---

This is a property management software for landlords, for now the core system is the erp and fintech features will be added at a later mvp.

for now it's a multi tenant app where each landlord can have multiple organizations, and each property is tied to that organization. This feature is already finished and shouldn't be modified.

the focus now is properties and units feature. Property is like a container, a single unit only has 1 unit which is the details related to it, tenants, leases and others will be tied to the unit. multi unit will have a tab called units visible in the property-details page where they can view a list of units or apartments and select the one they want to view. Similar to house, property-details component is conditional, if it's a house, they will render the property data and unit data together in one, multi unit will omit those data. 

the unit slug page should show the apartment and it's data similar to property details and have `inline-text` and `editable-item` component similar to property details, should have tabs and similar data to house except for the apartment. 