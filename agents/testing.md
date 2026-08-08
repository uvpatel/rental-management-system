# Testing Agent

## Mission

Prove that the rental lifecycle, permissions, payment handling, and reservation logic behave correctly under normal and adversarial conditions.

## Test Stack

- Vitest for unit and integration tests
- Testing Library for React components
- Playwright for end-to-end tests
- Testcontainers or isolated Neon branch for database integration tests
- MSW only for frontend network simulation
- Fake payment adapter for most tests
- Razorpay test mode for one end-to-end verification path

## Test Pyramid

### Unit tests
Focus:
- Date overlap
- Duration calculation
- Pricing rule selection
- Tax
- Coupon rules
- Late fees
- Invoice balance
- State transitions
- Permission policies

### Integration tests
Focus:
- Database repositories
- Transactions
- Reservation concurrency
- Quotation confirmation
- Payment allocation
- Return processing
- Report queries

### End-to-end tests
Focus:
- Customer happy path
- Vendor fulfilment path
- Admin reporting path
- Authorization boundaries

## Critical Test Cases

### Reservation
1. No existing reservation: available.
2. Existing reservation before requested interval: available.
3. Existing reservation after requested interval: available.
4. Start overlaps existing interval: unavailable.
5. End overlaps existing interval: unavailable.
6. Requested interval fully contains existing interval: unavailable.
7. Adjacent intervals: available.
8. Quantity partially consumed: remaining quantity available.
9. Concurrent confirmations: total confirmed quantity never exceeds stock.
10. Cancelled/released reservations do not block.

### Pricing
- Hourly, daily, and weekly rules
- Minimum charge
- Variant override
- Coupon limits
- GST calculation
- Security deposit excluded/included correctly in payable amount
- Price snapshot remains unchanged after product price update

### Permissions
- Customer cannot read another customer's documents.
- Vendor cannot read another organization.
- Vendor cannot assign admin role.
- Customer cannot call vendor state-transition endpoints.
- Unauthenticated users cannot access protected reports.

### Payment
- Valid signature succeeds.
- Invalid signature fails.
- Duplicate verification is idempotent.
- Duplicate webhook is ignored.
- Amount mismatch fails.
- Partial payment produces `PARTIALLY_PAID`.
- Final payment produces `PAID`.
- Refund updates refunded amount and invoice settlement correctly.

### Pickup/return
- Pickup before required payment fails.
- Pickup records quantity and condition.
- Return cannot exceed fulfilled quantity.
- On-time return has no late fee.
- Late return applies configured fee.
- Damage charge affects invoice.
- Accepted return releases inventory.
- Duplicate return processing fails safely.

## Example Unit Test

```ts
describe("interval overlap", () => {
  it("allows adjacent rentals", () => {
    expect(
      overlaps(
        {
          startAt: new Date("2026-08-10T10:00:00Z"),
          endAt: new Date("2026-08-11T10:00:00Z"),
        },
        {
          startAt: new Date("2026-08-11T10:00:00Z"),
          endAt: new Date("2026-08-12T10:00:00Z"),
        },
      ),
    ).toBe(false);
  });
});
```

## End-to-End Scenario

```text
Given a vendor has two camera kits
And customer A confirms one kit for Aug 10–12
When customer B requests two kits for Aug 11–12
Then confirmation is rejected
When customer B requests one kit
Then confirmation succeeds
When customer A pays a deposit
Then the invoice becomes partially paid
When the vendor records pickup
Then the order becomes with customer
When the vendor records a late return
Then a late fee is added
And the returned unit becomes available
And the dashboard updates
```

## Non-Functional Tests

- Lighthouse accessibility on public pages
- Mobile viewport coverage
- API rate-limit behavior
- Export with large date range
- Dashboard query performance
- Build and migration from clean database
- Timezone behavior around midnight
- Retry behavior for serialization failure

## CI Pipeline

```text
install
→ lint
→ typecheck
→ unit tests
→ database integration tests
→ build
→ Playwright smoke tests
```

## Release Gate

Do not release when:
- Reservation concurrency test fails.
- Authorization coverage fails.
- Payment signature test fails.
- Migration cannot run from clean database.
- Critical E2E lifecycle fails.
