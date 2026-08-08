# Design System

## 1. Design Direction

The interface should feel like a modern ERP and rental marketplace:

- Clean and business-focused
- Dense enough for operational users
- Friendly enough for customers
- Strong status visibility
- Minimal decorative animation inside dashboards
- Responsive on desktop, tablet, and mobile

Use shadcn/ui as the component foundation. Use Aceternity effects only on public marketing sections, not in operational tables or forms.

## 2. Visual Principles

1. **Clarity before decoration**
2. **Status is always visible**
3. **Primary actions are easy to locate**
4. **Financial values align consistently**
5. **Date ranges are understandable**
6. **Destructive actions require confirmation**
7. **Role-specific navigation reduces clutter**

## 3. Color Semantics

Use CSS variables rather than hard-coded values.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --primary: 221 83% 53%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --danger: 0 72% 51%;
  --info: 199 89% 48%;
}
```

Status mapping:
- Draft: neutral
- Sent: info
- Confirmed: blue/primary
- Partially paid: warning
- Paid: success
- Ready for pickup: info
- With customer: primary
- Return due: warning
- Overdue: danger
- Returned/completed: success
- Cancelled/void: muted or danger outline

Never communicate status through color alone. Always show label and, where useful, an icon.

## 4. Typography

Recommended:
- Sans: Geist
- Mono: Geist Mono

Scale:
- Page title: 30–36px
- Section title: 20–24px
- Card title: 16–18px
- Body: 14–16px
- Table/meta: 12–14px

Use tabular numbers for money, quantities, invoice numbers, and timestamps.

## 5. Spacing and Layout

- 4px base spacing unit
- Dashboard content max width: 1600px
- Main content padding: 16px mobile, 24px tablet, 32px desktop
- Card radius: 12px
- Controls: 40px standard height, 44px for primary mobile actions
- Table rows: 48–56px

Dashboard layout:

```text
┌──────────────┬──────────────────────────────────────┐
│ Sidebar      │ Top bar                              │
│              ├──────────────────────────────────────┤
│              │ Page header + primary action         │
│              │ Filters / summary                    │
│              │ Main content                         │
└──────────────┴──────────────────────────────────────┘
```

## 6. Navigation by Role

### Customer
- Browse products
- Cart
- Quotations
- Rental orders
- Invoices
- Profile

### Vendor
- Overview
- Products
- Quotations
- Rental orders
- Pickups
- Returns
- Invoices
- Payments
- Reports
- Settings

### Admin
- Global overview
- Organizations/vendors
- Users and roles
- Products
- Orders
- Invoices
- Reports
- Tax and company settings
- Audit logs

## 7. Core Components

Use or build:

- `AppSidebar`
- `PageHeader`
- `StatCard`
- `StatusBadge`
- `DataTable`
- `DateRangePicker`
- `Money`
- `QuantityInput`
- `ProductCard`
- `ProductGallery`
- `AvailabilityCalendar`
- `RentalPriceBreakdown`
- `QuotationSummary`
- `OrderTimeline`
- `InvoicePreview`
- `PaymentStatusCard`
- `PickupChecklist`
- `ReturnInspectionForm`
- `EmptyState`
- `ConfirmActionDialog`

## 8. Key Screens

### Public product listing
- Search
- Category, vendor, price, attribute, and availability filters
- Product cards with rate, unit, availability, and vendor
- Date range selector persisted across navigation

### Product detail
- Images and product summary
- Variant selector
- Quantity
- Start/end date and time
- Availability response
- Price breakdown
- Deposit information
- Add to quotation/cart

### Customer checkout
Use a stepper:
1. Rental details
2. Customer/company details
3. Address
4. Payment option
5. Review and confirm

### Vendor order detail
Header:
- Order number
- Customer
- Status
- Outstanding balance
- Primary next action

Sections:
- Timeline
- Rental lines
- Pickup/return details
- Invoice/payment
- Notes and audit history

### Return processing
- Items and expected quantity
- Returned quantity
- Condition
- Damage notes
- Image uploads
- Late fee
- Damage charge
- Deposit refund
- Final balance

## 9. Form Standards

- Labels are always visible.
- Required fields use text, not only an asterisk.
- Inline validation appears near the field.
- Server errors appear in an alert.
- Preserve valid user input after errors.
- Disable submit during mutation.
- Show explicit success feedback.
- Date/time fields display the user timezone but send UTC.

## 10. Table Standards

Tables must include:
- Search
- Relevant filters
- Sort
- Pagination
- Column visibility for advanced views
- Empty state
- Loading skeleton
- Row actions
- Export where required

Avoid horizontal scrolling for critical mobile flows. Convert rows to cards when necessary.

## 11. Accessibility

- Meet WCAG AA contrast.
- Full keyboard navigation.
- Focus indicators remain visible.
- Dialogs trap focus.
- Inputs have programmatic labels.
- Buttons use action labels such as “Confirm quotation.”
- Charts have text summaries.
- Error messages use `aria-live`.
- Touch targets are at least 44×44px on mobile.

## 12. Responsive Behavior

- Sidebar becomes a drawer below desktop.
- Dashboard stat cards stack on mobile.
- Tables switch to cards for customer-facing lists.
- Checkout uses a sticky bottom action bar.
- Product filters use a sheet on mobile.
- Invoice preview supports print layout separately.

## 13. Motion

Allowed:
- 150–250ms transitions
- Skeletons
- Dialog and sheet transitions
- Small status/timeline reveals
- Marketing hero effects

Avoid:
- Continuous dashboard motion
- Large parallax in business screens
- Animated numbers that delay understanding
