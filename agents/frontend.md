# Frontend Implementation Agent

## Mission

Build a responsive, accessible Next.js interface for Customer, Vendor, and Admin workflows using shadcn/ui, Tailwind CSS, TanStack Query, and Zustand.

## Required Inputs

Read:
- `product.md`
- `design-system.md`
- `api-contract.md`
- `architecture.md`

## Primary Deliverables

1. Public product marketplace
2. Product detail and rental configuration
3. Cart and quotation flow
4. Customer portal
5. Vendor dashboard
6. Admin dashboard
7. Invoice, pickup, and return interfaces

## Route Plan

```text
/
├── products
│   └── [slug]
├── cart
├── checkout
├── auth
│   ├── sign-in
│   ├── sign-up
│   └── forgot-password
├── portal
│   ├── quotations
│   ├── rentals
│   │   └── [id]
│   ├── invoices
│   └── profile
└── dashboard
    ├── overview
    ├── products
    ├── quotations
    ├── rental-orders
    │   └── [id]
    ├── pickups
    ├── returns
    ├── invoices
    ├── payments
    ├── reports
    ├── users
    └── settings
```

## State Management

### Zustand
Use only for temporary cart/quotation UI state:
- selected vendor
- items
- date range
- fulfilment method
- coupon draft

Persist cautiously. Revalidate availability and prices from the server whenever the cart is opened or checkout begins.

### TanStack Query
Use for:
- Mutations
- Client-refetched operational tables
- Availability checks
- Payment status polling when needed
- Cache invalidation after actions

### Server Components
Use for initial page reads and SEO-sensitive public content.

## Component Tasks

Build:
- `ProductCard`
- `ProductFilters`
- `RentalConfigurator`
- `AvailabilityIndicator`
- `PriceBreakdown`
- `QuotationEditor`
- `OrderStatusTimeline`
- `InvoiceSummary`
- `PickupForm`
- `ReturnInspectionForm`
- `RoleAwareSidebar`
- `ReportFilters`
- `RevenueChart`
- `TopProductsChart`

## UX Requirements

- Always show selected rental dates near cart and checkout.
- Display server-calculated totals.
- Show exactly why a product is unavailable.
- Disable confirmation until terms are accepted.
- Show the next expected action on each order.
- Provide loading, empty, and error states.
- Use confirmation dialogs for cancellation, invoice voiding, and return completion.
- Use optimistic updates only when rollback is safe.

## Frontend Acceptance Tests

- Customer can configure a product and add it to quotation.
- Invalid date interval is blocked.
- Availability conflict is rendered clearly.
- Role navigation hides irrelevant routes.
- Direct unauthorized navigation still depends on server rejection.
- Checkout totals update after coupon/date changes.
- Mobile checkout remains usable at 375px width.
- Forms are keyboard accessible.
