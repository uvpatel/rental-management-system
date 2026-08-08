# API Contract

## 1. Conventions

Base URL:

```text
/api/v1
```

Headers:

```http
Content-Type: application/json
X-Request-Id: optional-client-request-id
Idempotency-Key: required for selected payment/order operations
```

Pagination:

```text
?page=1&pageSize=20
```

Date/time:
- ISO 8601
- Stored and transmitted in UTC
- Displayed in the user's timezone

Money:
- Integer minor units
- `150000` means ₹1,500.00

## 2. Standard Responses

Success:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01H...",
    "timestamp": "2026-08-08T09:30:00.000Z"
  }
}
```

Validation error:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request is invalid.",
    "details": {
      "fieldErrors": {
        "endAt": ["Rental end must be after start."]
      }
    }
  },
  "meta": {
    "requestId": "req_01H..."
  }
}
```

## 3. Authentication

Better Auth owns primary authentication routes. Application-specific profile endpoints remain under `/api/v1`.

### GET `/me`
Returns session user, role, organization, and permissions.

### PATCH `/me/profile`

```json
{
  "name": "Urvil Patel",
  "companyName": "Utility Solutions",
  "gstin": "24ABCDE1234F1Z5",
  "phone": "+919999999999"
}
```

## 4. Products

### GET `/products`
Public list of published rentable products.

Query:
- `search`
- `vendorId`
- `categoryId`
- `attribute`
- `startAt`
- `endAt`
- `minPrice`
- `maxPrice`
- `page`
- `pageSize`

### POST `/products`
Vendor/Admin only.

```json
{
  "name": "Canon Camera Kit",
  "slug": "canon-camera-kit",
  "description": "Camera, lens, two batteries and carrying case.",
  "categoryId": "uuid",
  "isRentable": true,
  "isPublished": true,
  "quantityOnHand": 2,
  "costPrice": 8000000,
  "salesPrice": 10000000,
  "securityDeposit": 500000,
  "taxRateId": "uuid",
  "pricingRules": [
    {
      "unit": "DAY",
      "unitCount": 1,
      "price": 150000
    },
    {
      "unit": "WEEK",
      "unitCount": 1,
      "price": 850000
    }
  ]
}
```

### GET `/products/:productId`
Returns product, images, attributes, variants, pricing rules, and public vendor details.

### PATCH `/products/:productId`
Vendor owner/Admin only.

### DELETE `/products/:productId`
Soft-delete or archive. Do not delete products referenced by documents.

### POST `/products/:productId/variants`

```json
{
  "sku": "CAM-BLK-24",
  "attributeValues": [
    {
      "attributeId": "uuid",
      "valueId": "uuid"
    }
  ],
  "quantityOnHand": 2,
  "securityDeposit": 500000,
  "priceOverrides": [
    {
      "unit": "DAY",
      "price": 165000
    }
  ]
}
```

## 5. Availability

### POST `/availability/check`

```json
{
  "startAt": "2026-08-10T04:30:00.000Z",
  "endAt": "2026-08-12T04:30:00.000Z",
  "items": [
    {
      "productVariantId": "uuid",
      "quantity": 1
    }
  ]
}
```

Response:

```json
{
  "data": {
    "available": true,
    "items": [
      {
        "productVariantId": "uuid",
        "requestedQuantity": 1,
        "availableQuantity": 2,
        "available": true
      }
    ]
  }
}
```

Conflict returns `409 RENTAL_PERIOD_UNAVAILABLE`.

## 6. Quotations

### POST `/quotations`

```json
{
  "vendorId": "uuid",
  "startAt": "2026-08-10T04:30:00.000Z",
  "endAt": "2026-08-12T04:30:00.000Z",
  "couponCode": "WELCOME10",
  "billingAddressId": "uuid",
  "deliveryAddressId": "uuid",
  "fulfilmentMethod": "PICKUP",
  "lines": [
    {
      "productVariantId": "uuid",
      "quantity": 1
    }
  ]
}
```

Response includes authoritative price breakdown.

### GET `/quotations`
Filters documents by role:
- Customer: own quotations
- Vendor: organization quotations
- Admin: all, with filters

### GET `/quotations/:quotationId`

### PATCH `/quotations/:quotationId`
Allowed only in editable states.

### POST `/quotations/:quotationId/send`
Vendor/Admin or customer self-service flow as configured.

### POST `/quotations/:quotationId/confirm`
Requires `Idempotency-Key`.

```json
{
  "paymentOption": "PARTIAL",
  "acceptedTerms": true
}
```

Response:

```json
{
  "data": {
    "rentalOrderId": "uuid",
    "orderNumber": "RO-2026-000123",
    "invoiceId": "uuid",
    "paymentRequired": 500000
  }
}
```

## 7. Rental Orders

### GET `/rental-orders`
Query:
- `status`
- `vendorId`
- `customerId`
- `from`
- `to`
- `overdue`
- pagination

### GET `/rental-orders/:orderId`

### POST `/rental-orders/:orderId/cancel`

```json
{
  "reason": "Customer requested cancellation"
}
```

### POST `/rental-orders/:orderId/ready-for-pickup`

### POST `/rental-orders/:orderId/pickup`

```json
{
  "pickedUpAt": "2026-08-10T05:00:00.000Z",
  "instructionsAcknowledged": true,
  "items": [
    {
      "orderLineId": "uuid",
      "quantity": 1,
      "condition": "GOOD"
    }
  ],
  "notes": "Customer verified camera operation."
}
```

### POST `/rental-orders/:orderId/return`

```json
{
  "returnedAt": "2026-08-12T08:30:00.000Z",
  "items": [
    {
      "orderLineId": "uuid",
      "returnedQuantity": 1,
      "condition": "MINOR_DAMAGE",
      "damageCharge": 100000,
      "notes": "Scratch on carrying case."
    }
  ]
}
```

Response includes late fee, damage charge, deposit adjustment, and final outstanding amount.

## 8. Invoices

### GET `/invoices`
Role-scoped list.

### GET `/invoices/:invoiceId`

### POST `/rental-orders/:orderId/invoices`
Creates a draft invoice if one does not already exist.

### POST `/invoices/:invoiceId/issue`

### GET `/invoices/:invoiceId/pdf`
Returns signed URL or PDF stream.

### POST `/invoices/:invoiceId/void`

```json
{
  "reason": "Duplicate invoice"
}
```

## 9. Payments

### POST `/payments/gateway-orders`
Requires `Idempotency-Key`.

```json
{
  "invoiceId": "uuid",
  "amount": 500000,
  "purpose": "SECURITY_DEPOSIT"
}
```

Response:

```json
{
  "data": {
    "gateway": "RAZORPAY",
    "gatewayOrderId": "order_...",
    "amount": 500000,
    "currency": "INR",
    "keyId": "rzp_test_..."
  }
}
```

### POST `/payments/verify`

```json
{
  "invoiceId": "uuid",
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "..."
}
```

### POST `/webhooks/razorpay`
Public endpoint with signature verification.

Requirements:
- Store webhook event ID.
- Ignore already processed events.
- Reconcile gateway amount with expected payment.
- Return a fast 2xx response after durable processing or enqueue work.

### POST `/payments/:paymentId/refund`
Vendor/Admin with permission.

```json
{
  "amount": 400000,
  "reason": "Security deposit release"
}
```

## 10. Reports

### GET `/reports/summary`
Query:
- `from`
- `to`
- `vendorId` for Admin only

Returns:
- totalRevenue
- outstandingAmount
- activeRentals
- overdueRentals
- utilizationRate
- averageOrderValue

### GET `/reports/revenue-series`
Returns time buckets.

### GET `/reports/top-products`

### GET `/reports/vendor-performance`
Admin only.

### GET `/reports/export`
Query:
- `report`
- `format=csv|xlsx|pdf`
- `from`
- `to`
- optional filters

## 11. Settings

### GET/POST `/settings/attributes`
### GET/POST `/settings/attribute-values`
### GET/PATCH `/settings/company`
### GET/POST `/settings/tax-rates`
### GET/POST `/settings/rental-periods`
### GET/PATCH `/settings/late-fees`
### GET/POST `/settings/coupons`

## 12. Error Codes

| Code | HTTP |
|---|---:|
| `UNAUTHENTICATED` | 401 |
| `FORBIDDEN` | 403 |
| `RESOURCE_NOT_FOUND` | 404 |
| `VALIDATION_FAILED` | 422 |
| `RENTAL_PERIOD_UNAVAILABLE` | 409 |
| `INVALID_STATE_TRANSITION` | 409 |
| `QUOTATION_EXPIRED` | 409 |
| `PAYMENT_VERIFICATION_FAILED` | 400 |
| `PAYMENT_AMOUNT_MISMATCH` | 409 |
| `IDEMPOTENCY_CONFLICT` | 409 |
| `RATE_LIMITED` | 429 |
| `INTERNAL_ERROR` | 500 |
