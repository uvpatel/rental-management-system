# Backend Implementation Agent

## Mission

Implement secure, transactional business workflows for catalog, quotations, reservations, rental orders, invoices, payments, pickups, returns, and reporting.

## Required Inputs

Read:
- `architecture.md`
- `api-contract.md`
- `database.md`
- `coding-standards.md`
- `product.md`

## Priorities

1. Authentication and organization-scoped RBAC
2. Product and pricing management
3. Availability calculation
4. Atomic quotation confirmation
5. Invoice creation
6. Payment verification
7. Pickup and return state transitions
8. Reports

## Service Contracts

Implement domain services:

```ts
createProduct(input, actor)
updateProduct(input, actor)
checkAvailability(input)
createQuotation(input, actor)
updateQuotation(input, actor)
sendQuotation(id, actor)
confirmQuotation(input, actor)
cancelRentalOrder(input, actor)
markReadyForPickup(input, actor)
recordPickup(input, actor)
processReturn(input, actor)
createGatewayOrder(input, actor)
verifyPayment(input, actor)
processRazorpayWebhook(input)
issueInvoice(input, actor)
voidInvoice(input, actor)
getReportSummary(input, actor)
```

## Reservation Algorithm

- Validate all lines belong to one vendor organization.
- Normalize and sort variant IDs.
- Start a database transaction.
- Acquire advisory locks in sorted order.
- Query blocking reservations using overlap logic.
- Recalculate availability.
- Throw `RENTAL_PERIOD_UNAVAILABLE` on conflict.
- Insert order and reservation records.
- Create invoice.
- Write audit log.
- Commit.
- Retry safe serialization failures a limited number of times.

## Authorization Requirements

Every service receives an actor context:

```ts
type ActorContext = {
  userId: string;
  role: "ADMIN" | "VENDOR" | "CUSTOMER";
  organizationId?: string;
  permissions: string[];
};
```

Rules:
- Customer documents must match customer identity.
- Vendor documents must match organization.
- Admin global access is explicit.
- Cost prices are vendor/admin only.
- Reports and exports require dedicated permissions.

## Payment Requirements

- Never mark an invoice paid from browser callback alone.
- Verify Razorpay signature on the server.
- Store gateway IDs and webhook IDs uniquely.
- Apply payments idempotently.
- Reject amount or currency mismatch.
- Recompute invoice paid/outstanding amounts transactionally.
- Support refunds without deleting original payments.

## Return Requirements

`processReturn` must:
1. Validate order state.
2. Validate returned quantities.
3. Calculate late duration and fee.
4. Record item condition and damage charge.
5. Determine deposit refund or amount due.
6. Update order/invoice.
7. Release or redirect inventory.
8. Release reservations.
9. Write audit log.

## Scheduled Jobs

Implement:
- Upcoming return reminder
- Return due notification
- Overdue order escalation
- Expire stale quotations
- Expire temporary reservation holds
- Payment reconciliation retry

Each job must be idempotent and record execution outcome.

## Backend Acceptance Tests

- Two simultaneous confirmations cannot exceed stock.
- Customer cannot access another customer's invoice.
- Vendor cannot access another organization's order.
- Invalid state transitions fail.
- Payment verification is idempotent.
- Duplicate webhook event is ignored safely.
- Partial payment updates invoice correctly.
- Return restores availability.
- Late fee calculation follows configured grace period.
