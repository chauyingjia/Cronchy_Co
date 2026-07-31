import { ExpenseItem, SalesItem, Transaction } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEY = 'dubai_cookie_accounting_data_v2';
const SETTINGS_KEY = 'dubai_cookie_accounting_settings_v2';

export interface AppSettings {
  currencySymbol: string;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
}

export const DEFAULT_SETTINGS: AppSettings = {
  currencySymbol: 'RM', // Default to RM or $
  fontSizeMode: 'standard', // Default to standard text size as requested
};

export const loadTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time init
      saveTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : INITIAL_TRANSACTIONS;
  } catch (e) {
    console.error('Failed to load transactions:', e);
    return INITIAL_TRANSACTIONS;
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const formatMoney = (amount: number, symbol: string = 'RM'): string => {
  const rounded = Number(amount || 0).toFixed(2);
  return `${symbol} ${Number(rounded).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateReadable = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const exportToCSV = (transactions: Transaction[], currencySymbol: string = 'RM') => {
  const headers = ['Type', 'Date', 'Item / Product', 'Category / Method', 'Amount (' + currencySymbol + ')', 'Quantity', 'Remarks'];
  const rows = transactions.map((t) => {
    if (t.type === 'expense') {
      return [
        'Expense',
        t.date,
        `"${t.itemName.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        t.price.toFixed(2),
        '1',
        `"${(t.remarks || '').replace(/"/g, '""')}"`,
      ];
    } else {
      return [
        'Sales',
        t.date,
        `"${t.productName.replace(/"/g, '""')}"`,
        `"${t.paymentMethod}"`,
        t.totalPrice.toFixed(2),
        t.quantity,
        `"${(t.remarks || '').replace(/"/g, '""')}"`,
      ];
    }
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Dubai_Cookie_Accounting_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
