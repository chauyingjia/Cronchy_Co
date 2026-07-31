import React, { useState, useEffect } from 'react';
import { ExpenseItem, SalesItem, Transaction, ViewTab } from './types';
import { 
  loadTransactions, 
  saveTransactions, 
  loadSettings, 
  saveSettings, 
  AppSettings,
  getTodayDateString 
} from './utils/storage';
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddSalesModalOpen, setIsAddSalesModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize transactions from localStorage
  useEffect(() => {
    const loaded = loadTransactions();
    setTransactions(loaded);
  }, []);

  // Sync transactions to storage whenever changed
  const updateTransactionsState = (newTxList: Transaction[]) => {
    setTransactions(newTxList);
    saveTransactions(newTxList);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Add Expense
  const handleAddExpense = (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [newExpense, ...transactions];
    updateTransactionsState(updated);
  };

  // Add Sales
  const handleAddSales = (salesData: Omit<SalesItem, 'id' | 'createdAt'>) => {
    const newSales: SalesItem = {
      ...salesData,
      id: `sale-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [newSales, ...transactions];
    updateTransactionsState(updated);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updated = transactions.filter((t) => t.id !== id);
      updateTransactionsState(updated);
    }
  };

  // Reset Sample Data
  const handleResetSampleData = () => {
    if (window.confirm('Reload sample transactions for Dubai Chewy Cookies business?')) {
      updateTransactionsState(INITIAL_TRANSACTIONS);
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
  const handleImportJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        updateTransactionsState(parsed);
        return true;
      }
      return false;
    } catch (e) {
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
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesPage
              expenses={transactions.filter((t): t is ExpenseItem => t.type === 'expense')}
              currencySymbol={settings.currencySymbol}
              fontSizeMode={settings.fontSizeMode}
              onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
              onDeleteExpense={handleDeleteTransaction}
            />
          )}

          {currentTab === 'sales' && (
            <SalesPage
              sales={transactions.filter((t): t is SalesItem => t.type === 'sales')}
              currencySymbol={settings.currencySymbol}
              fontSizeMode={settings.fontSizeMode}
              onOpenAddSales={() => setIsAddSalesModalOpen(true)}
              onDeleteSales={handleDeleteTransaction}
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
              transactions={transactions}
              currencySymbol={settings.currencySymbol}
              fontSizeMode={settings.fontSizeMode}
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
        onClose={() => setIsAddExpenseModalOpen(false)}
        onSaveExpense={handleAddExpense}
        currencySymbol={settings.currencySymbol}
        fontSizeMode={settings.fontSizeMode}
      />

      {/* Sales Modal Form */}
      <SalesFormModal
        isOpen={isAddSalesModalOpen}
        onClose={() => setIsAddSalesModalOpen(false)}
        onSaveSales={handleAddSales}
        currencySymbol={settings.currencySymbol}
        fontSizeMode={settings.fontSizeMode}
      />
    </div>
  );
}
