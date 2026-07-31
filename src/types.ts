export type TransactionType = 'expense' | 'sales';

export type ExpenseCategory = 
  | 'Ingredients' 
  | 'Stall & Equipment' 
  | 'Packaging' 
  | 'Rent & Utilities' 
  | 'Transport' 
  | 'Others';

export type PaymentMethod = 'Cash' | 'Online / QR' | 'Card';

export interface ExpenseItem {
  id: string;
  type: 'expense';
  date: string; // YYYY-MM-DD
  itemName: string;
  category: ExpenseCategory;
  price: number;
  remarks?: string;
  createdAt: number;
}

export interface SalesItem {
  id: string;
  type: 'sales';
  date: string; // YYYY-MM-DD
  productName: string;
  quantity: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  remarks?: string;
  createdAt: number;
}

export type Transaction = ExpenseItem | SalesItem;

export type ViewTab = 'dashboard' | 'expenses' | 'sales' | 'reports' | 'profit' | 'settings';

export type ReportTimeframe = 'daily' | 'monthly' | 'yearly';

export interface BatchRecipeCost {
  pistachioPaste: number;
  kataifiKunafa: number;
  chocolate: number;
  butterFlourSugar: number;
  packagingBox: number;
  otherIngredients: number;
  yieldQuantity: number; // e.g. 20 cookies
  sellingPricePerCookie: number;
  stallRentalPerDay: number;
}
