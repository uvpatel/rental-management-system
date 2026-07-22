import {
  RentalProduct,
  UserProfile,
  RentalOrder,
  PickupDocument,
  ReturnDocument,
  Invoice,
  SystemSettings,
  Coupon
} from '@/types/rental';

export const INITIAL_SETTINGS: SystemSettings = {
  companyName: 'Odoo Rental Hub India Pvt Ltd',
  gstin: '24AAACO1234M1Z5',
  gstPercentage: 18,
  securityDepositPercentage: 20,
  lateFeeHourlyRateMultiplier: 1.5,
  enabledPeriods: ['hourly', 'daily', 'weekly'],
  productCategories: [
    'Audio & Sound',
    'Cameras & Optics',
    'Heavy Equipment & Tools',
    'IT & Computing',
    'Event & Staging',
    'Vehicles & Transport'
  ]
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-1',
    name: 'Alex Rivera (Admin)',
    email: 'admin@odoorental.com',
    role: 'admin',
    companyName: 'Odoo Rental Hub HQ',
    gstin: '24AAACO1234M1Z5',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-vendor-1',
    name: 'Apex Motion Gear (Vendor)',
    email: 'vendor@apexgear.com',
    role: 'vendor',
    companyName: 'Apex Motion Gear Pvt Ltd',
    gstin: '27AABCA5678K1Z9',
    phone: '+91 98111 22233',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'usr-vendor-2',
    name: 'Titan Heavy Machinery (Vendor)',
    email: 'contact@titanequip.com',
    role: 'vendor',
    companyName: 'Titan Industrial Solutions',
    gstin: '07AAACT9988P1Z3',
    phone: '+91 99887 76655',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'usr-cust-1',
    name: 'Sarah Connor (Customer)',
    email: 'sarah@skynetmedia.com',
    role: 'customer',
    companyName: 'Skynet Media Productions',
    gstin: '24BBBCS9876Q1Z2',
    phone: '+91 97777 88888',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T00:00:00.000Z'
  }
];

export const INITIAL_PRODUCTS: RentalProduct[] = [
  {
    id: 'prod-1',
    name: 'Sony FX3 Full-Frame Cinema Line Camera',
    sku: 'CAM-SONY-FX3',
    category: 'Cameras & Optics',
    description: 'Compact cinema camera with high-sensitivity 4K full-frame sensor, 15+ stops dynamic range, S-Cinetone, and active cooling for non-stop shoots.',
    vendorId: 'usr-vendor-1',
    vendorName: 'Apex Motion Gear',
    published: true,
    rentable: true,
    quantityOnHand: 8,
    costPrice: 3200,
    hourlyRate: 25,
    dailyRate: 150,
    weeklyRate: 750,
    securityDepositAmount: 300,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    attributes: [
      { id: 'attr-1', name: 'Lens Mount', options: ['E-Mount Body Only', '24-70mm GM II Kit'] },
      { id: 'attr-2', name: 'Memory Pack', options: ['128GB SD Card', '1TB CFexpress Type A'] }
    ],
    variants: [
      {
        id: 'var-1a',
        name: 'Body Only + 128GB SD',
        attributeValues: { 'Lens Mount': 'E-Mount Body Only', 'Memory Pack': '128GB SD Card' },
        extraPricePerDay: 0,
        sku: 'CAM-SONY-FX3-BODY',
        quantityOnHand: 5
      },
      {
        id: 'var-1b',
        name: '24-70mm GM II Kit + 1TB CFexpress',
        attributeValues: { 'Lens Mount': '24-70mm GM II Kit', 'Memory Pack': '1TB CFexpress Type A' },
        extraPricePerDay: 60,
        sku: 'CAM-SONY-FX3-FULLKIT',
        quantityOnHand: 3
      }
    ],
    createdAt: '2026-02-10T00:00:00.000Z'
  },
  {
    id: 'prod-2',
    name: 'Caterpillar 302.7 CR Mini Excavator',
    sku: 'HVY-CAT-3027',
    category: 'Heavy Equipment & Tools',
    description: 'Compact hydraulic excavators delivering power, versatility, and comfort in tight excavation and trenching job sites.',
    vendorId: 'usr-vendor-2',
    vendorName: 'Titan Heavy Machinery',
    published: true,
    rentable: true,
    quantityOnHand: 4,
    costPrice: 45000,
    hourlyRate: 85,
    dailyRate: 450,
    weeklyRate: 2200,
    securityDepositAmount: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?w=800&auto=format&fit=crop&q=80',
    attributes: [
      { id: 'attr-3', name: 'Bucket Size', options: ['18-inch Trenching', '24-inch Heavy Duty'] }
    ],
    variants: [
      {
        id: 'var-2a',
        name: '18-inch Trenching Bucket',
        attributeValues: { 'Bucket Size': '18-inch Trenching' },
        extraPricePerDay: 0,
        sku: 'HVY-CAT-18B',
        quantityOnHand: 2
      },
      {
        id: 'var-2b',
        name: '24-inch Heavy Duty Bucket',
        attributeValues: { 'Bucket Size': '24-inch Heavy Duty' },
        extraPricePerDay: 40,
        sku: 'HVY-CAT-24B',
        quantityOnHand: 2
      }
    ],
    createdAt: '2026-02-12T00:00:00.000Z'
  },
  {
    id: 'prod-3',
    name: 'JBL VTX A8 Compact 3-Way Line Array Speaker',
    sku: 'AUD-JBL-A8',
    category: 'Audio & Sound',
    description: 'Next-generation compact 3-way line array element designed for mid-to-large live outdoor concerts, stadium events, and festivals.',
    vendorId: 'usr-vendor-1',
    vendorName: 'Apex Motion Gear',
    published: true,
    rentable: true,
    quantityOnHand: 12,
    costPrice: 4800,
    hourlyRate: 40,
    dailyRate: 220,
    weeklyRate: 1100,
    securityDepositAmount: 400,
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    attributes: [],
    variants: [],
    createdAt: '2026-02-15T00:00:00.000Z'
  },
  {
    id: 'prod-4',
    name: 'Apple MacBook Pro 16" M3 Max Studio Rig',
    sku: 'IT-MBP16-M3MAX',
    category: 'IT & Computing',
    description: '16-core CPU, 40-core GPU, 64GB Unified Memory, 2TB SSD workstation pre-loaded with DaVinci Resolve Studio, Premiere Pro, and Final Cut.',
    vendorId: 'usr-vendor-1',
    vendorName: 'Apex Motion Gear',
    published: true,
    rentable: true,
    quantityOnHand: 10,
    costPrice: 4200,
    hourlyRate: 20,
    dailyRate: 110,
    weeklyRate: 550,
    securityDepositAmount: 350,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    attributes: [
      { id: 'attr-4', name: 'Software Suite', options: ['Standard Editing', 'Full VFX & Colorist Pack'] }
    ],
    variants: [],
    createdAt: '2026-02-20T00:00:00.000Z'
  },
  {
    id: 'prod-5',
    name: 'DJI Inspire 3 8K Cinema Droning Rig',
    sku: 'CAM-DJI-INS3',
    category: 'Cameras & Optics',
    description: 'Full-frame 8K/75fps ProRes RAW aerial cinema system with Waypoint Pro, 360-degree pan dual-control radio station.',
    vendorId: 'usr-vendor-1',
    vendorName: 'Apex Motion Gear',
    published: true,
    rentable: true,
    quantityOnHand: 3,
    costPrice: 16500,
    hourlyRate: 95,
    dailyRate: 500,
    weeklyRate: 2500,
    securityDepositAmount: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
    attributes: [],
    variants: [],
    createdAt: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'prod-6',
    name: 'Aputure Electro Storm CS15 1500W RGB LED Light',
    sku: 'EVT-APT-CS15',
    category: 'Event & Staging',
    description: 'Ultra-powerful point source full-color LED fixture outputting continuous daylight intensity equivalent to 1.8kW HMI.',
    vendorId: 'usr-vendor-1',
    vendorName: 'Apex Motion Gear',
    published: true,
    rentable: true,
    quantityOnHand: 6,
    costPrice: 6500,
    hourlyRate: 30,
    dailyRate: 180,
    weeklyRate: 880,
    securityDepositAmount: 400,
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    attributes: [],
    variants: [],
    createdAt: '2026-03-05T00:00:00.000Z'
  }
];

export const INITIAL_ORDERS: RentalOrder[] = [
  {
    id: 'RENT-2026-001',
    customerId: 'usr-cust-1',
    customerName: 'Sarah Connor',
    customerEmail: 'sarah@skynetmedia.com',
    customerPhone: '+91 97777 88888',
    companyName: 'Skynet Media Productions',
    gstin: '24BBBCS9876Q1Z2',
    vendorId: 'usr-vendor-1',
    vendorName: 'Apex Motion Gear',
    status: 'picked_up',
    startDate: '2026-07-20T09:00:00.000Z',
    endDate: '2026-07-23T18:00:00.000Z',
    durationDays: 3,
    durationHours: 81,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Sony FX3 Full-Frame Cinema Line Camera',
        productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        quantity: 2,
        hourlyRate: 25,
        dailyRate: 150,
        weeklyRate: 750,
        rateType: 'daily',
        effectiveDailyRate: 150,
        subtotal: 900 // 2 units * $150 * 3 days
      }
    ],
    subtotal: 900,
    securityDeposit: 300,
    taxRate: 18,
    taxAmount: 162,
    discountAmount: 90,
    couponCode: 'HACKATHON10',
    totalAmount: 972,
    paidAmount: 972,
    paymentType: 'full',
    paymentStatus: 'paid',
    pickupDocId: 'PU-2026-001',
    returnDocId: 'RET-2026-001',
    invoiceId: 'INV-2026-001',
    createdAt: '2026-07-18T10:30:00.000Z',
    notes: 'Commercial advertisement shoot location at Gandhinagar studio.'
  },
  {
    id: 'RENT-2026-002',
    customerId: 'usr-cust-1',
    customerName: 'Sarah Connor',
    customerEmail: 'sarah@skynetmedia.com',
    customerPhone: '+91 97777 88888',
    companyName: 'Skynet Media Productions',
    gstin: '24BBBCS9876Q1Z2',
    vendorId: 'usr-vendor-2',
    vendorName: 'Titan Heavy Machinery',
    status: 'confirmed',
    startDate: '2026-07-25T08:00:00.000Z',
    endDate: '2026-07-28T17:00:00.000Z',
    durationDays: 3,
    durationHours: 81,
    items: [
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Caterpillar 302.7 CR Mini Excavator',
        productImage: 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?w=800&auto=format&fit=crop&q=80',
        quantity: 1,
        hourlyRate: 85,
        dailyRate: 450,
        weeklyRate: 2200,
        rateType: 'daily',
        effectiveDailyRate: 450,
        subtotal: 1350
      }
    ],
    subtotal: 1350,
    securityDeposit: 1000,
    taxRate: 18,
    taxAmount: 243,
    discountAmount: 0,
    totalAmount: 1593,
    paidAmount: 1000,
    paymentType: 'deposit_partial',
    paymentStatus: 'partial',
    pickupDocId: 'PU-2026-002',
    invoiceId: 'INV-2026-002',
    createdAt: '2026-07-19T14:15:00.000Z'
  }
];

export const INITIAL_PICKUPS: PickupDocument[] = [
  {
    id: 'PU-2026-001',
    orderId: 'RENT-2026-001',
    customerId: 'usr-cust-1',
    customerName: 'Sarah Connor',
    scheduledPickupDate: '2026-07-20T09:00:00.000Z',
    actualPickupDate: '2026-07-20T09:15:00.000Z',
    status: 'completed',
    vendorNotes: 'Verified ID proof and handed over 2x Sony FX3 bodies with pelican cases.',
    verifiedBy: 'Alex (Warehouse Lead)',
    createdAt: '2026-07-18T10:30:00.000Z'
  },
  {
    id: 'PU-2026-002',
    orderId: 'RENT-2026-002',
    customerId: 'usr-cust-1',
    customerName: 'Sarah Connor',
    scheduledPickupDate: '2026-07-25T08:00:00.000Z',
    status: 'pending',
    vendorNotes: 'Transport flatbed trailer scheduled for pickup at 8 AM.',
    createdAt: '2026-07-19T14:15:00.000Z'
  }
];

export const INITIAL_RETURNS: ReturnDocument[] = [
  {
    id: 'RET-2026-001',
    orderId: 'RENT-2026-001',
    customerId: 'usr-cust-1',
    customerName: 'Sarah Connor',
    scheduledReturnDate: '2026-07-23T18:00:00.000Z',
    lateHours: 0,
    lateFeeAmount: 0,
    damageFeeAmount: 0,
    refundDepositAmount: 300,
    status: 'pending',
    createdAt: '2026-07-20T09:15:00.000Z'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-001',
    orderId: 'RENT-2026-001',
    customerId: 'usr-cust-1',
    customerName: 'Sarah Connor',
    companyName: 'Skynet Media Productions',
    gstin: '24BBBCS9876Q1Z2',
    issueDate: '2026-07-18T10:30:00.000Z',
    dueDate: '2026-07-23T18:00:00.000Z',
    paymentType: 'full',
    items: INITIAL_ORDERS[0].items,
    subtotal: 900,
    taxAmount: 162,
    securityDeposit: 300,
    lateFeeAmount: 0,
    totalAmount: 972,
    paidAmount: 972,
    balanceDue: 0,
    status: 'paid'
  },
  {
    id: 'INV-2026-002',
    orderId: 'RENT-2026-002',
    customerId: 'usr-cust-1',
    customerName: 'Sarah Connor',
    companyName: 'Skynet Media Productions',
    gstin: '24BBBCS9876Q1Z2',
    issueDate: '2026-07-19T14:15:00.000Z',
    dueDate: '2026-07-25T08:00:00.000Z',
    paymentType: 'deposit_partial',
    items: INITIAL_ORDERS[1].items,
    subtotal: 1350,
    taxAmount: 243,
    securityDeposit: 1000,
    lateFeeAmount: 0,
    totalAmount: 1593,
    paidAmount: 1000,
    balanceDue: 593,
    status: 'posted'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'HACKATHON10', discountPercentage: 10, description: '10% off for Hackathon participants' },
  { code: 'ODOO20', discountPercentage: 20, description: '20% off for Odoo Virtual Hackathon Special' }
];
