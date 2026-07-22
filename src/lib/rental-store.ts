import {
  RentalProduct,
  UserProfile,
  RentalOrder,
  PickupDocument,
  ReturnDocument,
  Invoice,
  SystemSettings,
  Coupon,
  OrderStatus,
  PricingPeriod,
  OrderItem,
  ReturnCondition
} from '@/types/rental';
import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_PICKUPS,
  INITIAL_RETURNS,
  INITIAL_INVOICES,
  INITIAL_SETTINGS,
  INITIAL_COUPONS
} from './mock-data';

const STORAGE_KEYS = {
  PRODUCTS: 'odoo_rental_products',
  USERS: 'odoo_rental_users',
  ORDERS: 'odoo_rental_orders',
  PICKUPS: 'odoo_rental_pickups',
  RETURNS: 'odoo_rental_returns',
  INVOICES: 'odoo_rental_invoices',
  SETTINGS: 'odoo_rental_settings',
  COUPONS: 'odoo_rental_coupons',
  CURRENT_USER: 'odoo_rental_current_user'
};

class RentalStore {
  private products: RentalProduct[] = [];
  private users: UserProfile[] = [];
  private orders: RentalOrder[] = [];
  private pickups: PickupDocument[] = [];
  private returns: ReturnDocument[] = [];
  private invoices: Invoice[] = [];
  private settings: SystemSettings = INITIAL_SETTINGS;
  private coupons: Coupon[] = INITIAL_COUPONS;
  private currentUser: UserProfile = INITIAL_USERS[0]; // Default to Admin for full testing
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.loadDefaults();
      return;
    }

    try {
      const prodData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const userData = localStorage.getItem(STORAGE_KEYS.USERS);
      const orderData = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const pickupData = localStorage.getItem(STORAGE_KEYS.PICKUPS);
      const returnData = localStorage.getItem(STORAGE_KEYS.RETURNS);
      const invoiceData = localStorage.getItem(STORAGE_KEYS.INVOICES);
      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const couponsData = localStorage.getItem(STORAGE_KEYS.COUPONS);
      const curUserData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

      this.products = prodData ? JSON.parse(prodData) : INITIAL_PRODUCTS;
      this.users = userData ? JSON.parse(userData) : INITIAL_USERS;
      this.orders = orderData ? JSON.parse(orderData) : INITIAL_ORDERS;
      this.pickups = pickupData ? JSON.parse(pickupData) : INITIAL_PICKUPS;
      this.returns = returnData ? JSON.parse(returnData) : INITIAL_RETURNS;
      this.invoices = invoiceData ? JSON.parse(invoiceData) : INITIAL_INVOICES;
      this.settings = settingsData ? JSON.parse(settingsData) : INITIAL_SETTINGS;
      this.coupons = couponsData ? JSON.parse(couponsData) : INITIAL_COUPONS;
      this.currentUser = curUserData ? JSON.parse(curUserData) : INITIAL_USERS[0];

      this.saveToStorage();
    } catch {
      this.loadDefaults();
    }
  }

  private loadDefaults() {
    this.products = INITIAL_PRODUCTS;
    this.users = INITIAL_USERS;
    this.orders = INITIAL_ORDERS;
    this.pickups = INITIAL_PICKUPS;
    this.returns = INITIAL_RETURNS;
    this.invoices = INITIAL_INVOICES;
    this.settings = INITIAL_SETTINGS;
    this.coupons = INITIAL_COUPONS;
    this.currentUser = INITIAL_USERS[0];
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(this.pickups));
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(this.returns));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(this.invoices));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(this.coupons));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Getters ---
  public getProducts() { return this.products; }
  public getUsers() { return this.users; }
  public getOrders() { return this.orders; }
  public getPickups() { return this.pickups; }
  public getReturns() { return this.returns; }
  public getInvoices() { return this.invoices; }
  public getSettings() { return this.settings; }
  public getCoupons() { return this.coupons; }
  public getCurrentUser() { return this.currentUser; }

  public setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    this.saveToStorage();
  }

  // --- Core Overbooking & Reservation Logic ---
  public getProductReservedQuantity(
    productId: string,
    startDateStr: string,
    endDateStr: string,
    excludeOrderId?: string
  ): number {
    const reqStart = new Date(startDateStr).getTime();
    const reqEnd = new Date(endDateStr).getTime();

    if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) return 0;

    let reservedCount = 0;

    for (const order of this.orders) {
      if (excludeOrderId && order.id === excludeOrderId) continue;
      // Only active orders block availability (Confirmed or Picked Up)
      if (order.status !== 'confirmed' && order.status !== 'picked_up') continue;

      const orderStart = new Date(order.startDate).getTime();
      const orderEnd = new Date(order.endDate).getTime();

      // Check date range overlap condition: orderStart < reqEnd AND orderEnd > reqStart
      if (orderStart < reqEnd && orderEnd > reqStart) {
        for (const item of order.items) {
          if (item.productId === productId) {
            reservedCount += item.quantity;
          }
        }
      }
    }

    return reservedCount;
  }

  public checkAvailability(
    productId: string,
    quantity: number,
    startDateStr: string,
    endDateStr: string,
    excludeOrderId?: string
  ): { available: boolean; remaining: number; totalOnHands: number; reserved: number } {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return { available: false, remaining: 0, totalOnHands: 0, reserved: 0 };

    const reserved = this.getProductReservedQuantity(productId, startDateStr, endDateStr, excludeOrderId);
    const remaining = Math.max(0, product.quantityOnHand - reserved);

    return {
      available: remaining >= quantity,
      remaining,
      totalOnHands: product.quantityOnHand,
      reserved
    };
  }

  // --- Pricing Calculation Engine ---
  public calculateRentalDuration(startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) {
      return { days: 1, hours: 24 };
    }

    const totalHours = Math.ceil((end - start) / (1000 * 60 * 60));
    const totalDays = Math.ceil(totalHours / 24);
    return { days: Math.max(1, totalDays), hours: Math.max(1, totalHours) };
  }

  public calculateItemPrice(
    product: RentalProduct,
    quantity: number,
    startDateStr: string,
    endDateStr: string,
    variantId?: string,
    ratePeriod: PricingPeriod = 'daily'
  ): { unitRate: number; subtotal: number; durationDays: number; durationHours: number } {
    const { days, hours } = this.calculateRentalDuration(startDateStr, endDateStr);
    
    let variantExtra = 0;
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) variantExtra = variant.extraPricePerDay;
    }

    let unitRate = product.dailyRate + variantExtra;

    if (ratePeriod === 'hourly') {
      unitRate = product.hourlyRate + Math.round(variantExtra / 10);
      const subtotal = unitRate * hours * quantity;
      return { unitRate, subtotal, durationDays: days, durationHours: hours };
    } else if (ratePeriod === 'weekly' && days >= 7) {
      const weeks = Math.ceil(days / 7);
      unitRate = product.weeklyRate + variantExtra * 7;
      const subtotal = unitRate * weeks * quantity;
      return { unitRate, subtotal, durationDays: days, durationHours: hours };
    } else {
      // Daily default
      const subtotal = unitRate * days * quantity;
      return { unitRate, subtotal, durationDays: days, durationHours: hours };
    }
  }

  // --- Order Lifecycle Actions ---

  public createQuotation(params: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    companyName?: string;
    gstin?: string;
    startDate: string;
    endDate: string;
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      rateType?: PricingPeriod;
    }>;
    couponCode?: string;
    notes?: string;
  }): { success: boolean; orderId?: string; message?: string } {
    // Validate date availability for all items
    for (const item of params.items) {
      const avail = this.checkAvailability(item.productId, item.quantity, params.startDate, params.endDate);
      if (!avail.available) {
        const prod = this.products.find((p) => p.id === item.productId);
        return {
          success: false,
          message: `Double-booking prevention: Only ${avail.remaining} units of "${prod?.name || 'Product'}" available for the selected dates (${avail.reserved} reserved).`
        };
      }
    }

    const { days, hours } = this.calculateRentalDuration(params.startDate, params.endDate);
    
    // Group vendor (first vendor for simplicity)
    const firstProduct = this.products.find((p) => p.id === params.items[0].productId);
    const vendorId = firstProduct?.vendorId || 'usr-vendor-1';
    const vendorName = firstProduct?.vendorName || 'Apex Motion Gear';

    let subtotal = 0;
    let totalSecurityDeposit = 0;
    const orderItems: OrderItem[] = [];

    params.items.forEach((item, index) => {
      const product = this.products.find((p) => p.id === item.productId)!;
      const variant = product.variants.find((v) => v.id === item.variantId);
      const priceCalc = this.calculateItemPrice(
        product,
        item.quantity,
        params.startDate,
        params.endDate,
        item.variantId,
        item.rateType || 'daily'
      );

      subtotal += priceCalc.subtotal;
      totalSecurityDeposit += product.securityDepositAmount * item.quantity;

      orderItems.push({
        id: `item-${Date.now()}-${index}`,
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        variantId: variant?.id,
        variantName: variant?.name,
        quantity: item.quantity,
        hourlyRate: product.hourlyRate,
        dailyRate: product.dailyRate,
        weeklyRate: product.weeklyRate,
        rateType: item.rateType || 'daily',
        effectiveDailyRate: priceCalc.unitRate,
        subtotal: priceCalc.subtotal
      });
    });

    let discountAmount = 0;
    if (params.couponCode) {
      const coupon = this.coupons.find((c) => c.code.toUpperCase() === params.couponCode?.toUpperCase());
      if (coupon) {
        discountAmount = Math.round((subtotal * coupon.discountPercentage) / 100);
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round((taxableAmount * this.settings.gstPercentage) / 100);
    const totalAmount = taxableAmount + taxAmount;

    const newOrderId = `RENT-2026-${String(this.orders.length + 1).padStart(3, '0')}`;

    const newOrder: RentalOrder = {
      id: newOrderId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      companyName: params.companyName || this.currentUser.companyName,
      gstin: params.gstin || this.currentUser.gstin,
      vendorId,
      vendorName,
      status: 'draft', // Quotation
      startDate: params.startDate,
      endDate: params.endDate,
      durationDays: days,
      durationHours: hours,
      items: orderItems,
      subtotal,
      securityDeposit: totalSecurityDeposit,
      taxRate: this.settings.gstPercentage,
      taxAmount,
      discountAmount,
      couponCode: params.couponCode,
      totalAmount,
      paidAmount: 0,
      paymentType: 'full',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      notes: params.notes
    };

    this.orders.unshift(newOrder);
    this.saveToStorage();

    return { success: true, orderId: newOrderId, message: 'Rental Quotation created successfully!' };
  }

  public confirmOrder(orderId: string, paymentType: 'full' | 'deposit_partial' = 'full'): { success: boolean; message?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    // Re-verify availability before locking stock
    for (const item of order.items) {
      const avail = this.checkAvailability(item.productId, item.quantity, order.startDate, order.endDate, order.id);
      if (!avail.available) {
        return {
          success: false,
          message: `Cannot confirm order. Overbooking conflict detected for product "${item.productName}".`
        };
      }
    }

    // Update order status to confirmed
    order.status = 'confirmed';
    order.paymentType = paymentType;
    const initialPaid = paymentType === 'deposit_partial' ? order.securityDeposit : order.totalAmount;
    order.paidAmount = initialPaid;
    order.paymentStatus = initialPaid >= order.totalAmount ? 'paid' : 'partial';

    // Generate Pickup Document
    const pickupId = `PU-2026-${String(this.pickups.length + 1).padStart(3, '0')}`;
    const newPickup: PickupDocument = {
      id: pickupId,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      scheduledPickupDate: order.startDate,
      status: 'pending',
      vendorNotes: 'Verified customer details. Ready for dispatch/handover.',
      createdAt: new Date().toISOString()
    };
    this.pickups.unshift(newPickup);
    order.pickupDocId = pickupId;

    // Generate Invoice
    const invoiceId = `INV-2026-${String(this.invoices.length + 1).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      id: invoiceId,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      companyName: order.companyName,
      gstin: order.gstin,
      issueDate: new Date().toISOString(),
      dueDate: order.startDate,
      paymentType,
      items: order.items,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      securityDeposit: order.securityDeposit,
      lateFeeAmount: 0,
      totalAmount: order.totalAmount,
      paidAmount: initialPaid,
      balanceDue: Math.max(0, order.totalAmount - initialPaid),
      status: initialPaid >= order.totalAmount ? 'paid' : 'posted'
    };
    this.invoices.unshift(newInvoice);
    order.invoiceId = invoiceId;

    this.saveToStorage();
    return { success: true, message: `Rental Order ${orderId} confirmed and stock reserved successfully!` };
  }

  // --- Pickup Handover ---
  public processPickup(pickupId: string, notes?: string, verifiedBy?: string): { success: boolean; message?: string } {
    const pickup = this.pickups.find((p) => p.id === pickupId);
    if (!pickup) return { success: false, message: 'Pickup document not found.' };

    const order = this.orders.find((o) => o.id === pickup.orderId);
    if (!order) return { success: false, message: 'Associated order not found.' };

    pickup.status = 'completed';
    pickup.actualPickupDate = new Date().toISOString();
    if (notes) pickup.vendorNotes = notes;
    pickup.verifiedBy = verifiedBy || 'Vendor Ops Team';

    order.status = 'picked_up';

    // Generate Return Document
    const returnId = `RET-2026-${String(this.returns.length + 1).padStart(3, '0')}`;
    const newReturn: ReturnDocument = {
      id: returnId,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      scheduledReturnDate: order.endDate,
      lateHours: 0,
      lateFeeAmount: 0,
      damageFeeAmount: 0,
      refundDepositAmount: order.securityDeposit,
      status: 'pending',
      vendorNotes: 'Awaiting customer return inspection.',
      createdAt: new Date().toISOString()
    };
    this.returns.unshift(newReturn);
    order.returnDocId = returnId;

    this.saveToStorage();
    return { success: true, message: `Handover complete. Stock status updated to 'With Customer'.` };
  }

  // --- Return Processing & Late Fee Logic ---
  public processReturn(
    returnId: string,
    condition: ReturnCondition = 'excellent',
    damageFee: number = 0,
    actualReturnDateStr?: string,
    notes?: string
  ): { success: boolean; message?: string; lateFee: number } {
    const retDoc = this.returns.find((r) => r.id === returnId);
    if (!retDoc) return { success: false, message: 'Return document not found.', lateFee: 0 };

    const order = this.orders.find((o) => o.id === retDoc.orderId);
    if (!order) return { success: false, message: 'Associated order not found.', lateFee: 0 };

    const actualReturnTime = actualReturnDateStr ? new Date(actualReturnDateStr).getTime() : Date.now();
    const scheduledReturnTime = new Date(retDoc.scheduledReturnDate).getTime();

    let lateHours = 0;
    let lateFeeAmount = 0;

    if (actualReturnTime > scheduledReturnTime) {
      lateHours = Math.ceil((actualReturnTime - scheduledReturnTime) / (1000 * 60 * 60));
      // Calculate late fee based on average hourly rate of order items * multiplier
      const totalHourlyBase = order.items.reduce((acc, item) => acc + (item.hourlyRate || (item.dailyRate / 24)), 0);
      lateFeeAmount = Math.round(lateHours * totalHourlyBase * this.settings.lateFeeHourlyRateMultiplier);
    }

    retDoc.status = 'returned';
    retDoc.actualReturnDate = new Date(actualReturnTime).toISOString();
    retDoc.condition = condition;
    retDoc.damageFeeAmount = damageFee;
    retDoc.lateHours = lateHours;
    retDoc.lateFeeAmount = lateFeeAmount;
    retDoc.refundDepositAmount = Math.max(0, order.securityDeposit - damageFee - lateFeeAmount);
    if (notes) retDoc.vendorNotes = notes;

    // Update Order Status to Completed (Returned)
    order.status = 'returned';

    // Update Invoice if late fee / damage fee added
    if (order.invoiceId) {
      const invoice = this.invoices.find((i) => i.id === order.invoiceId);
      if (invoice) {
        invoice.lateFeeAmount = lateFeeAmount + damageFee;
        invoice.totalAmount += (lateFeeAmount + damageFee);
        invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
        if (invoice.balanceDue > 0) invoice.status = 'posted';
      }
    }

    this.saveToStorage();
    return {
      success: true,
      lateFee: lateFeeAmount,
      message: lateHours > 0
        ? `Item returned ${lateHours} hours late. Late return fee of ₹${lateFeeAmount} applied.`
        : `Item returned on time in ${condition} condition. Stock restored to inventory!`
    };
  }

  // --- Invoice & Payment Recording ---
  public recordPayment(invoiceId: string, amount: number): { success: boolean; message?: string } {
    const invoice = this.invoices.find((i) => i.id === invoiceId);
    if (!invoice) return { success: false, message: 'Invoice not found.' };

    invoice.paidAmount += amount;
    invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    if (invoice.balanceDue === 0) {
      invoice.status = 'paid';
    }

    const order = this.orders.find((o) => o.id === invoice.orderId);
    if (order) {
      order.paidAmount = invoice.paidAmount;
      order.paymentStatus = invoice.status === 'paid' ? 'paid' : 'partial';
    }

    this.saveToStorage();
    return { success: true, message: `Payment of ₹${amount} recorded. Remaining balance: ₹${invoice.balanceDue}` };
  }

  // --- Product Management (Vendor/Admin) ---
  public addProduct(productData: Omit<RentalProduct, 'id' | 'createdAt'>): RentalProduct {
    const newProduct: RentalProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.products.unshift(newProduct);
    this.saveToStorage();
    return newProduct;
  }

  public updateProduct(productId: string, updates: Partial<RentalProduct>) {
    const index = this.products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates };
      this.saveToStorage();
    }
  }

  public deleteProduct(productId: string) {
    this.products = this.products.filter((p) => p.id !== productId);
    this.saveToStorage();
  }

  // --- User Registration & Auth ---
  public registerUser(user: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile {
    const newUser: UserProfile = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveToStorage();
    return newUser;
  }

  public updateSettings(newSettings: Partial<SystemSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage();
  }
}

export const rentalStore = new RentalStore();
