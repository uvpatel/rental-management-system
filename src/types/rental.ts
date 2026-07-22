export type UserRole = 'admin' | 'vendor' | 'customer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  gstin?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export type PricingPeriod = 'hourly' | 'daily' | 'weekly' | 'custom';

export interface ProductAttribute {
  id: string;
  name: string; // e.g. 'Brand', 'Color', 'Power'
  options: string[];
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. 'Red / Pro Kit'
  attributeValues: Record<string, string>;
  extraPricePerDay: number;
  sku: string;
  quantityOnHand: number;
}

export interface RentalProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  vendorId: string;
  vendorName: string;
  published: boolean;
  rentable: boolean;
  quantityOnHand: number;
  costPrice: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  securityDepositAmount: number;
  imageUrl: string;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  createdAt: string;
}

export type OrderStatus =
  | 'draft'       // Quotation
  | 'sent'        // Quotation Sent to Customer
  | 'confirmed'   // Order Confirmed & Stock Reserved
  | 'picked_up'   // Stock with Customer
  | 'returned'    // Item Returned & Order Completed
  | 'cancelled';  // Order Cancelled

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  rateType: PricingPeriod;
  effectiveDailyRate: number;
  subtotal: number;
}

export interface RentalOrder {
  id: string; // e.g. 'RENT-2026-001'
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  gstin?: string;
  vendorId: string;
  vendorName: string;
  status: OrderStatus;
  startDate: string; // ISO String format
  endDate: string;   // ISO String format
  durationDays: number;
  durationHours: number;
  items: OrderItem[];
  subtotal: number;
  securityDeposit: number;
  taxRate: number; // e.g. 18 for 18% GST
  taxAmount: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  paidAmount: number;
  paymentType: 'full' | 'deposit_partial';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  pickupDocId?: string;
  returnDocId?: string;
  invoiceId?: string;
  createdAt: string;
  notes?: string;
}

export type PickupStatus = 'pending' | 'ready' | 'completed';

export interface PickupDocument {
  id: string; // e.g. 'PU-2026-001'
  orderId: string;
  customerId: string;
  customerName: string;
  scheduledPickupDate: string;
  actualPickupDate?: string;
  status: PickupStatus;
  vendorNotes?: string;
  verifiedBy?: string;
  createdAt: string;
}

export type ReturnCondition = 'excellent' | 'good' | 'damaged';
export type ReturnStatus = 'pending' | 'returned' | 'overdue';

export interface ReturnDocument {
  id: string; // e.g. 'RET-2026-001'
  orderId: string;
  customerId: string;
  customerName: string;
  scheduledReturnDate: string;
  actualReturnDate?: string;
  condition?: ReturnCondition;
  lateHours: number;
  lateFeeAmount: number;
  damageFeeAmount: number;
  refundDepositAmount: number;
  status: ReturnStatus;
  vendorNotes?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'posted' | 'paid' | 'cancelled';

export interface Invoice {
  id: string; // e.g. 'INV-2026-001'
  orderId: string;
  customerId: string;
  customerName: string;
  companyName?: string;
  gstin?: string;
  issueDate: string;
  dueDate: string;
  paymentType: 'full' | 'deposit_partial';
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  securityDeposit: number;
  lateFeeAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  description: string;
}

export interface SystemSettings {
  companyName: string;
  gstin: string;
  gstPercentage: number;
  securityDepositPercentage: number;
  lateFeeHourlyRateMultiplier: number;
  enabledPeriods: PricingPeriod[];
  productCategories: string[];
}
