# AI Implementation Agent

## Mission

Add optional AI features that improve usability and operations without controlling authoritative pricing, inventory, payments, or legal invoice data.

## Core Principle

AI is an assistant, not the source of truth.

The following must remain deterministic:
- Availability
- Pricing
- Tax
- Reservation
- Invoice totals
- Payment status
- Permissions
- State transitions
- Late and damage charges

## Recommended AI Features

### 1. Customer rental assistant
Answers questions using:
- Published product descriptions
- Rental terms
- Pickup/return policies
- FAQs
- Current availability retrieved through tools

The assistant may suggest products but must call deterministic APIs for availability and price.

### 2. Vendor order summary
Generates a concise operational summary:
- What the customer rented
- Payment status
- Pickup time
- Return due time
- Special notes
- Risks or missing steps

### 3. Return-note assistant
Transforms vendor inspection notes into professional language. The vendor must approve before saving.

### 4. Report narrative
Converts dashboard metrics into a natural-language summary:
- Revenue change
- Most rented products
- Overdue trend
- Vendor performance
- Suggested areas to investigate

Clearly label generated interpretations.

## Tool Design

Expose narrow server-side tools:

```ts
searchPublishedProducts()
checkRentalAvailability()
calculateRentalQuote()
getCustomerOrderStatus()
getVendorOperationalSummary()
getReportMetrics()
```

Tools enforce authentication and data scoping independently of the model.

## RAG Sources

Approved:
- Public product catalog
- Organization rental policies
- FAQ
- Customer's own orders
- Vendor's organization-scoped operational records
- Admin-authorized global report metrics

Never index:
- Password data
- Auth tokens
- Payment secrets
- Full gateway payloads
- Private data from unrelated organizations

## Prompt Safety

System prompt should state:
- Never invent availability or price.
- Use tools for current facts.
- Do not expose internal cost price to customers.
- Do not reveal data outside the current actor's scope.
- Do not claim a payment succeeded unless the payment tool confirms it.
- Escalate disputes, refunds, damage decisions, and legal/tax questions to a human.

## AI SDK Architecture

Recommended:
- Vercel AI SDK
- Gemini or OpenAI model
- Streaming UI
- Server-side tools
- Conversation persistence only with explicit user context
- Rate limits by user and organization

## Observability

Log:
- request ID
- user/organization
- model
- tool calls
- latency
- token usage
- safety refusal
- user feedback

Redact sensitive values.

## Evaluation Set

Create at least 20 test prompts:
- Product recommendation
- Availability request
- Price request
- Cross-tenant data request
- Payment-status hallucination attempt
- Prompt injection in product description
- Refund request
- Tax/legal question
- Customer asks for vendor cost price

Pass criteria:
- Correct tool usage
- No cross-tenant leakage
- No invented operational facts
- Correct escalation for sensitive decisions
