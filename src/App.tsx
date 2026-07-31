import React, { useState, useEffect } from 'react';
import { ExpenseItem, SalesItem, Transaction, ViewTab } from './types';
import { 
  loadSettings, 
  saveSettings, 
  AppSettings,
  getTodayDateString 
} from './utils/storage';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  doc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { INITIAL_TRANSACTIONS } from './data/initialData';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { SalesFormModal } from './components/SalesFormModal';
import { ExpensesPage } from './components/ExpensesPage';
import { SalesPage } from './components/SalesPage';
import { ReportsPage } from './components/ReportsPage';
import { ProfitCalculator } from './components/ProfitCalculator';
import { SettingsPage } from './components/SettingsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [expensesList, setExpensesList] = useState<ExpenseItem[]>([]);
  const [salesList, setSalesList] = useState<SalesItem[]>([]);
  
  const transactions: Transaction[] = [...expensesList, ...salesList].sort((a, b) => b.createdAt - a.createdAt);
  
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddSalesModalOpen, setIsAddSalesModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | undefined>(undefined);
  const [editingSales, setEditingSales] = useState<SalesItem | undefined>(undefined);

  // Initialize transactions from Firestore collections
  useEffect(() => {
    const qExpenses = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubscribeExpenses = onSnapshot(qExpenses, (querySnapshot) => {
      const exps: ExpenseItem[] = [];
      querySnapshot.forEach((document) => {
        exps.push({ id: document.id, ...document.data() } as ExpenseItem);
      });
      setExpensesList(exps);
    }, (error) => {
      console.error("Error fetching expenses: ", error);
    });

    const qSales = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribeSales = onSnapshot(qSales, (querySnapshot) => {
      const sls: SalesItem[] = [];
      querySnapshot.forEach((document) => {
        sls.push({ id: document.id, ...document.data() } as SalesItem);
      });
      setSalesList(sls);
    }, (error) => {
      console.error("Error fetching sales: ", error);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeSales();
    };
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Add or Edit Expense
  const handleSaveExpense = async (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    try {
      if (editingExpense) {
        await setDoc(doc(db, 'expenses', editingExpense.id), {
          ...expenseData,
          createdAt: editingExpense.createdAt,
          type: 'expense'
        });
        setEditingExpense(undefined);
      } else {
        await addDoc(collection(db, 'expenses'), {
          ...expenseData,
          createdAt: Date.now(),
          type: 'expense'
        });
      }
    } catch (e) {
      console.error("Error saving expense: ", e);
    }
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setIsAddExpenseModalOpen(true);
  };

  // Add or Edit Sales
  const handleSaveSales = async (salesData: Omit<SalesItem, 'id' | 'createdAt'>) => {
    try {
      if (editingSales) {
        await setDoc(doc(db, 'sales', editingSales.id), {
          ...salesData,
          createdAt: editingSales.createdAt,
          type: 'sales'
        });
        setEditingSales(undefined);
      } else {
        await addDoc(collection(db, 'sales'), {
          ...salesData,
          createdAt: Date.now(),
          type: 'sales'
        });
      }
    } catch (e) {
      console.error("Error saving sales: ", e);
    }
  };

  const handleEditSales = (sales: SalesItem) => {
    setEditingSales(sales);
    setIsAddSalesModalOpen(true);
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string, type: 'expense' | 'sales' | string = 'expense') => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const collectionName = type === 'sales' ? 'sales' : 'expenses';
        await deleteDoc(doc(db, collectionName, id));
      } catch (e) {
        console.error("Error deleting transaction: ", e);
      }
    }
  };

  // Reset Sample Data
  const handleResetSampleData = async () => {
    if (window.confirm('Reload sample transactions for Dubai Chewy Cookies business? This will wipe existing data.')) {
      try {
        const batch = writeBatch(db);
        
        // Wipe existing
        expensesList.forEach((t) => {
          batch.delete(doc(db, 'expenses', t.id));
        });
        salesList.forEach((t) => {
          batch.delete(doc(db, 'sales', t.id));
        });
        
        // Add samples
        INITIAL_TRANSACTIONS.forEach((t) => {
          const { id, ...data } = t;
          const collectionName = t.type === 'sales' ? 'sales' : 'expenses';
          const newDocRef = doc(collection(db, collectionName));
          batch.set(newDocRef, data);
        });
        
        await batch.commit();
      } catch (e) {
        console.error("Error resetting data: ", e);
      }
    }
  };

  // Export Backup JSON file
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Dubai_Cookie_Accounting_Backup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Backup JSON string
  const handleImportJSON = async (jsonStr: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        const batch = writeBatch(db);
        parsed.forEach((t) => {
          const { id, type, ...data } = t;
          const collectionName = type === 'sales' ? 'sales' : 'expenses';
          const newDocRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
          batch.set(newDocRef, { type, ...data });
        });
        await batch.commit();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error importing JSON: ", e);
      return false;
    }
  };

  // Font Size Container Class mapping for senior accessibility
  const fontSizeContainerClass = 
    settings.fontSizeMode === 'extra-large' 
      ? 'text-lg space-y-7' 
      : settings.fontSizeMode === 'large' 
      ? 'text-base space-y-6' 
      : 'text-sm space-y-5';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        fontSizeMode={settings.fontSizeMode}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSelectTab={setCurrentTab}
          onOpenAddExpenseModal={() => setIsAddExpenseModalOpen(true)}
          onOpenAddSalesModal={() => setIsAddSalesModalOpen(true)}
          fontSizeMode={settings.fontSizeMode}
          onChangeFontSize={(mode) => handleUpdateSettings({ ...settings, fontSizeMode: mode })}
          currencySymbol={settings.currencySymbol}
        />

        {/* Page Views Body */}
        <main className={`flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto ${fontSizeContainerClass}`}>
          {currentTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              currencySymbol={settings.currencySymbol}
              fontSizeMode={settings.fontSizeMode}
              onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
              onOpenAddSales={() => setIsAddSalesModalOpen(true)}
              onSelectTab={setCurrentTab}
              onDeleteTransaction={(id) => {
                const item = transactions.find(t => t.id === id);
                if (item) handleDeleteTransaction(id, item.type);
              }}
              onEditExpense={handleEditExpense}
              onEditSales={handleEditSales}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesPage
              expenses={transactions.filter((t): t is ExpenseItem => t.type === 'expense')}
              currencySymbol={settings.currencySymbol}
              fontSizeMode={settings.fontSizeMode}
              onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
              onDeleteExpense={(id) => handleDeleteTransaction(id, 'expense')}
              onEditExpense={handleEditExpense}
            />
          )}

          {currentTab === 'sales' && (
            <SalesPage
              sales={transactions.filter((t): t is SalesItem => t.type === 'sales')}
              currencySymbol={settings.currencySymbol}
              fontSizeMode={settings.fontSizeMode}
              onOpenAddSales={() => setIsAddSalesModalOpen(true)}
              onDeleteSales={(id) => handleDeleteTransaction(id, 'sales')}
              onEditSales={handleEditSales}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage
              transactions={transactions}
              currencySymbol={settings.currencySymbol}
              fontSizeMode={settings.fontSizeMode}
            />
          )}

          {currentTab === 'profit' && (
            <ProfitCalculator
              currencySymbol={settings.currencySymbol}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetSampleData={handleResetSampleData}
              onImportJSON={handleImportJSON}
              onExportJSON={handleExportJSON}
              fontSizeMode={settings.fontSizeMode}
            />
          )}
        </main>
      </div>

      {/* Expense Modal Form */}
      <ExpenseFormModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => {
          setIsAddExpenseModalOpen(false);
          setEditingExpense(undefined);
        }}
        onSaveExpense={handleSaveExpense}
        currencySymbol={settings.currencySymbol}
        fontSizeMode={settings.fontSizeMode}
        initialData={editingExpense}
      />

      {/* Sales Modal Form */}
      <SalesFormModal
        isOpen={isAddSalesModalOpen}
        onClose={() => {
          setIsAddSalesModalOpen(false);
          setEditingSales(undefined);
        }}
        onSaveSales={handleSaveSales}
        currencySymbol={settings.currencySymbol}
        fontSizeMode={settings.fontSizeMode}
        initialData={editingSales}
      />
    </div>
  );
}
