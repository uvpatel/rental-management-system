# Product Requirements Document

## 1. Product Summary

The Rental Management System allows rental businesses to publish products online and manage quotations, reservations, orders, inventory, invoices, payments, pickups, returns, and reports through one role-based platform.

## 2. Problem Statement

Rental businesses often manage product availability, customer communication, payment tracking, and returns using disconnected spreadsheets or manual processes. This leads to:

- Double-booking
- Incorrect rental pricing
- Missed returns
- Weak payment visibility
- Inconsistent invoices
- Limited vendor and admin reporting

The product solves these problems with an integrated rental lifecycle and a single source of truth.

## 3. Goals

- Deliver an end-to-end rental workflow.
- Prevent overlapping reservations.
- Support time-based and variant-level pricing.
- Support full payments, partial payments, and security deposits.
- Provide clear operational dashboards.
- Provide customer self-service.
- Preserve an auditable history of stock and financial actions.

## 4. Non-Goals for MVP

- Full accounting general ledger
- Complex warehouse routing
- Native mobile applications
- Dynamic insurance underwriting
- International tax engines
- Marketplace vendor payouts
- IoT tracking

## 5. Personas

### Customer
Needs a simple way to find available products, understand total price, confirm a rental, pay, and track status.

### Vendor operations user
Needs to manage products and fulfil rentals without double-booking or missing pickups and returns.

### Admin
Needs global control over vendors, users, configuration, reporting, permissions, and audit logs.

## 6. User Stories

### Authentication
- As a customer, I can sign up with name, email, company, GSTIN, password, and optional coupon.
- As a user, I can reset my password through a verified email link.
- As an admin, I can assign vendor or admin roles.
- As a vendor, I can access only my organization's information.

### Products
- As a vendor, I can create a rentable product.
- As a vendor, I can configure hourly, daily, weekly, or custom pricing.
- As a vendor, I can create variants from product attributes.
- As a vendor, I can publish or unpublish products.
- As a customer, I can filter and inspect rentable products.

### Availability
- As a customer, I can check availability for a date range.
- As a business, I cannot confirm orders that exceed available quantity.
- As a vendor, I can see reserved, active, and available quantities.

### Quotations and orders
- As a customer, adding configured rental items creates or updates a draft quotation.
- As a customer, I can edit a quotation before confirmation.
- As a customer, I can confirm a valid quotation.
- As the system, confirmation creates an order and reserves inventory.
- As a vendor, I can move the order through operational states.

### Billing
- As a vendor, I can create or review a draft invoice from an order.
- As a customer, I can pay in full or pay an allowed deposit/partial amount.
- As the system, verified payments update invoice balances.
- As a customer, I can download a printable invoice.

### Pickup and return
- As a vendor, I can generate a pickup document and mark items picked up.
- As the system, picked-up inventory becomes “with customer.”
- As a vendor, I can record return condition and quantity.
- As the system, late fees are calculated from the actual return time.
- As the system, returned stock becomes available after inspection.
- As a vendor, I can apply damage charges and settle a deposit.

### Reporting
- As a vendor, I can view my revenue, active rentals, overdue orders, and popular products.
- As an admin, I can compare vendor performance.
- As an authorized user, I can export reports.

## 7. Functional Requirements

### FR-001 Registration
The customer registration form must collect:
- Name
- Email
- Company name
- GSTIN
- Password
- Password confirmation
- Optional coupon code

GSTIN validation must check format. Real GST verification is a later integration.

### FR-002 Product pricing
A product or variant can define one or more pricing rules:
- Hourly
- Daily
- Weekly
- Custom quantity and duration tiers

The system must choose the configured pricing policy deterministically and show the breakdown.

### FR-003 Availability
Availability must be checked:
- On product configuration
- On cart/quotation refresh
- Immediately before confirmation
- Inside the confirmation transaction

### FR-004 Reservation
Confirmation creates reservation rows for each order line. Active reservations block overlapping rentals.

### FR-005 Invoicing
An invoice must include:
- Supplier details
- Customer and company details
- GSTIN
- Invoice number and date
- Rental period
- Line items
- Subtotal
- Discount
- GST
- Deposit
- Paid amount
- Outstanding amount
- Terms

### FR-006 Payment
The server must:
1. Create a gateway order.
2. Receive payment details.
3. Verify payment signature.
4. Store a payment record.
5. Apply payment to the invoice idempotently.

### FR-007 Return
The return workflow records:
- Expected and returned quantities
- Actual return timestamp
- Item condition
- Late fee
- Damage charge
- Deposit adjustment
- Inventory disposition

## 8. Business Rules

### BR-001 Date interval
`endAt` must be later than `startAt`.

### BR-002 Quantity
Requested quantity must be a positive integer and must not exceed computed availability.

### BR-003 Price authority
The browser never supplies authoritative totals. The server recalculates all totals.

### BR-004 Confirmation
Only `DRAFT` or `SENT` quotations that are not expired can be confirmed.

### BR-005 Reservation overlap
Reservations in blocking statuses count against availability when time intervals overlap.

### BR-006 Cancellation
A confirmed order may be cancelled only according to payment, pickup, and cancellation policy. Cancelling releases future reservations.

### BR-007 Pickup
An order cannot be picked up before required payment conditions are satisfied unless an authorized vendor override exists.

### BR-008 Return completion
Inventory is released only after the relevant units are returned and accepted.

### BR-009 Late fee
Late fee is calculated from the grace-period-adjusted due time until actual return.

### BR-010 Invoice balance
`outstanding = total - successfulAppliedPayments - credits`.

## 9. Permissions Matrix

| Capability | Customer | Vendor | Admin |
|---|---:|---:|---:|
| Browse published products | Yes | Yes | Yes |
| Create own quotation | Yes | Optional | Yes |
| View own customer documents | Yes | No | Yes |
| Manage organization products | No | Yes | Yes |
| Process organization rentals | No | Yes | Yes |
| Create organization invoices | No | Yes | Yes |
| View organization reports | No | Yes | Yes |
| Manage all vendors | No | No | Yes |
| Manage roles/settings | No | Limited | Yes |
| View global audit logs | No | No | Yes |

## 10. Success Metrics

- Zero confirmed overbookings in test scenarios.
- Customer can complete quotation-to-order flow in under five minutes.
- Vendor can process pickup or return in under two minutes.
- Payment webhook updates invoice reliably and idempotently.
- Dashboard values reconcile with underlying records.
- Critical happy path demo completes without manual database edits.

## 11. MVP Acceptance Scenario

1. Vendor publishes “Canon Camera Kit,” quantity 2, ₹1,500/day.
2. Customer selects August 10–12, quantity 1.
3. System shows two billable days, taxes, and deposit.
4. Customer confirms quotation.
5. Reservation is created.
6. A second customer can reserve only the remaining quantity.
7. Invoice is issued.
8. Customer pays a partial amount.
9. Vendor records pickup.
10. Vendor records a late return.
11. System adds late fee and updates balance.
12. Inventory returns to available status.
13. Dashboard revenue and order status update.
