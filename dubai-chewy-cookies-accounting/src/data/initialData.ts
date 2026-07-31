import { ExpenseItem, SalesItem, Transaction } from '../types';

// Get realistic dates relative to current date
const getRelativeDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    type: 'expense',
    date: getRelativeDate(0), // Today
    itemName: 'Fresh French Butter (5 blocks)',
    category: 'Ingredients',
    price: 68.50,
    remarks: 'Bought from wholesale bakery supply store',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'exp-2',
    type: 'expense',
    date: getRelativeDate(0), // Today
    itemName: 'Pistachio Cream Paste (1kg)',
    category: 'Ingredients',
    price: 145.00,
    remarks: '100% pure pistachio paste for chewy cookie filling',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'exp-3',
    type: 'expense',
    date: getRelativeDate(1), // Yesterday
    itemName: 'Crispy Kataifi / Kunafa Dough (2kg)',
    category: 'Ingredients',
    price: 52.00,
    remarks: 'Crispy filling for authentic Dubai style crunch',
    createdAt: Date.now() - 86400000 * 1 - 3600000 * 3,
  },
  {
    id: 'exp-4',
    type: 'expense',
    date: getRelativeDate(2),
    itemName: 'Custom Dubai Cookie Gift Boxes (100 pcs)',
    category: 'Packaging',
    price: 85.00,
    remarks: 'Gold foil printed boxes',
    createdAt: Date.now() - 86400000 * 2 - 3600000 * 4,
  },
  {
    id: 'exp-5',
    type: 'expense',
    date: getRelativeDate(3),
    itemName: 'Callebaut Belgian Dark Chocolate Chips (2.5kg)',
    category: 'Ingredients',
    price: 180.00,
    remarks: 'High quality chocolate shell',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'exp-6',
    type: 'expense',
    date: getRelativeDate(5),
    itemName: 'Pop-Up Stall Table Rental Fee',
    category: 'Rent & Utilities',
    price: 150.00,
    remarks: 'Weekend Market Stall Space #B12',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'exp-7',
    type: 'expense',
    date: getRelativeDate(7),
    itemName: 'Acrylic Cookie Display Case & Tongs',
    category: 'Stall & Equipment',
    price: 120.00,
    remarks: 'Hygiene display for stall setup',
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'exp-8',
    type: 'expense',
    date: getRelativeDate(12),
    itemName: 'Flour, Sugar & Vanilla Beans',
    category: 'Ingredients',
    price: 45.00,
    remarks: 'Baking staples batch',
    createdAt: Date.now() - 86400000 * 12,
  },
];

export const INITIAL_SALES: SalesItem[] = [
  {
    id: 'sale-1',
    type: 'sales',
    date: getRelativeDate(0), // Today
    productName: 'Signature Pistachio Kunafa Cookie Box (4-Pack)',
    quantity: 8,
    totalPrice: 280.00,
    paymentMethod: 'Online / QR',
    remarks: 'Stall morning walk-in customers',
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'sale-2',
    type: 'sales',
    date: getRelativeDate(0), // Today
    productName: 'Single Dubai Chewy Cookies',
    quantity: 12,
    totalPrice: 132.00,
    paymentMethod: 'Cash',
    remarks: 'Single piece loose orders',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'sale-3',
    type: 'sales',
    date: getRelativeDate(1), // Yesterday
    productName: 'Pistachio Kunafa Cookie Box (4-Pack)',
    quantity: 15,
    totalPrice: 525.00,
    paymentMethod: 'Online / QR',
    remarks: 'Pre-orders for office delivery',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'sale-4',
    type: 'sales',
    date: getRelativeDate(2),
    productName: 'Assorted Dubai Cookie Party Tray',
    quantity: 3,
    totalPrice: 360.00,
    paymentMethod: 'Card',
    remarks: 'Event catering deposit',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'sale-5',
    type: 'sales',
    date: getRelativeDate(3),
    productName: 'Signature Pistachio Kunafa Cookie Box',
    quantity: 10,
    totalPrice: 350.00,
    paymentMethod: 'Online / QR',
    remarks: 'Instagram pre-orders',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'sale-6',
    type: 'sales',
    date: getRelativeDate(5),
    productName: 'Weekend Market Stall Sales',
    quantity: 35,
    totalPrice: 1120.00,
    paymentMethod: 'Cash',
    remarks: 'Full day stall sales revenue',
    createdAt: Date.now() - 86400000 * 5,
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  ...INITIAL_EXPENSES,
  ...INITIAL_SALES,
].sort((a, b) => b.createdAt - a.createdAt);

export const COMMON_INGREDIENT_PRESETS = [
  { name: 'French Butter', category: 'Ingredients' as const, defaultPrice: 28.00 },
  { name: 'Pistachio Paste', category: 'Ingredients' as const, defaultPrice: 145.00 },
  { name: 'Kataifi / Kunafa Dough', category: 'Ingredients' as const, defaultPrice: 35.00 },
  { name: 'Belgian Chocolate Chips', category: 'Ingredients' as const, defaultPrice: 75.00 },
  { name: 'Flour & Baking Powder', category: 'Ingredients' as const, defaultPrice: 18.00 },
  { name: 'Cookie Gift Boxes (50pcs)', category: 'Packaging' as const, defaultPrice: 45.00 },
  { name: 'Parchment Paper & Bags', category: 'Packaging' as const, defaultPrice: 22.00 },
  { name: 'Stall Day Rental Fee', category: 'Rent & Utilities' as const, defaultPrice: 80.00 },
  { name: 'Baking Foil & Trays', category: 'Stall & Equipment' as const, defaultPrice: 30.00 },
];
