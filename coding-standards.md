# Coding Standards

## 1. General Principles

1. Prefer correctness over cleverness.
2. Keep business logic out of UI components.
3. Make invalid states difficult to represent.
4. Validate at every system boundary.
5. Use meaningful domain names rather than generic helpers.
6. Keep functions small and focused.
7. Write tests for business invariants, not implementation details.

## 2. TypeScript Rules

Use strict TypeScript.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}
```

Rules:

- Avoid `any`.
- Use `unknown` for untrusted values and validate them.
- Prefer discriminated unions for state-dependent values.
- Use branded IDs where practical.
- Use `satisfies` for configuration objects.
- Derive types from Zod schemas and Drizzle models.
- Do not duplicate API types manually across layers.

Example:

```ts
const createQuotationSchema = z.object({
  vendorId: z.string().uuid(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  lines: z.array(
    z.object({
      productVariantId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
}).refine((value) => value.endAt > value.startAt, {
  message: "Rental end must be after start",
  path: ["endAt"],
});

type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
```

## 3. Naming Conventions

### Files
- React components: `product-card.tsx`
- Services: `confirm-quotation.service.ts`
- Repositories: `rental-order.repository.ts`
- Schemas: `create-rental-order.schema.ts`
- Tests: `confirm-quotation.test.ts`
- Database tables: one file per domain or cohesive group

### Code
- Components: `PascalCase`
- Functions and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database columns: `snake_case`
- API JSON fields: `camelCase`
- Boolean names: `isPublished`, `hasPaidDeposit`, `canReturn`

### Domain terminology
Use the exact terms:
- quotation
- rental order
- reservation
- pickup
- return
- invoice
- payment
- security deposit
- vendor
- customer

Do not call a rental order a booking in some modules and an order in others.

## 4. Component Standards

A component should:

- Have one clear responsibility.
- Accept typed props.
- Avoid hidden data fetching when parent composition is clearer.
- Provide accessible labels.
- Support loading, empty, error, and success states.
- Avoid arbitrary large JSX files.

Split components when:
- The file exceeds roughly 250 lines.
- A visual section has its own state or reusable behavior.
- A table has distinct toolbar, columns, pagination, and row-action logic.

## 5. Server Component Standards

Use Server Components for:
- Product listing initial load
- Product detail reads
- Dashboard summary
- Order detail pages
- Invoice pages

Use Client Components for:
- Date range picker
- Cart
- Checkout
- Interactive table filters
- Mutations
- Charts
- Dialogs

Do not mark an entire route `"use client"` just because one child is interactive.

## 6. API Standards

All APIs return a consistent envelope.

Success:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123"
  }
}
```

Error:

```json
{
  "error": {
    "code": "RENTAL_PERIOD_UNAVAILABLE",
    "message": "One or more products are unavailable.",
    "details": {
      "conflicts": []
    }
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Rules:
- Use stable machine-readable error codes.
- Do not return stack traces.
- Use appropriate HTTP status codes.
- Support pagination for collections.
- Use ISO 8601 timestamps in UTC.
- Make payment and webhook APIs idempotent.

## 7. Error Handling

Define domain errors:

```ts
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}
```

Suggested codes:
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `RESOURCE_NOT_FOUND`
- `VALIDATION_FAILED`
- `RENTAL_PERIOD_UNAVAILABLE`
- `INVALID_STATE_TRANSITION`
- `PAYMENT_VERIFICATION_FAILED`
- `INVOICE_ALREADY_PAID`
- `RETURN_ALREADY_PROCESSED`

## 8. Database Standards

- Use UUID or ULID primary keys consistently.
- Store money as integer minor units, such as paise.
- Store timestamps with timezone in UTC.
- Add `createdAt` and `updatedAt`.
- Use explicit foreign-key behavior.
- Add indexes for frequent filters and joins.
- Use transactions for multi-record domain changes.
- Do not perform financial calculations with floating-point numbers.

## 9. Git Standards

Branches:
- `feature/customer-checkout`
- `feature/vendor-products`
- `fix/reservation-overlap`
- `chore/database-seed`

Commits:
- `feat: add rental quotation confirmation`
- `fix: prevent overlapping variant reservations`
- `test: cover partial invoice payments`
- `docs: define payment webhook contract`

Pull requests should include:
- Problem
- Solution
- Screenshots
- Database/API impact
- Test evidence
- Known limitations

## 10. Quality Gates

Every pull request should pass:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

Critical modules additionally require:
- Reservation concurrency test
- Authorization test
- Payment signature test
- State-transition test

## 11. Comments and Documentation

Comments should explain **why**, not restate code.

Good:

```ts
// Lock variants in sorted order to avoid deadlocks when orders contain
// the same variants in a different sequence.
```

Bad:

```ts
// Loop over variants
```

Use JSDoc for exported domain services with non-obvious behavior.
