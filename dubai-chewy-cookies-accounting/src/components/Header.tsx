import React from 'react';
import { ViewTab } from '../types';
import { Menu, Calendar, PlusCircle, TrendingUp, Type } from 'lucide-react';
import { getTodayDateString, formatDateReadable } from '../utils/storage';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onSelectTab: (tab: ViewTab) => void;
  onOpenAddExpenseModal: () => void;
  onOpenAddSalesModal: () => void;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
  onChangeFontSize: (mode: 'standard' | 'large' | 'extra-large') => void;
  currencySymbol: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenAddExpenseModal,
  onOpenAddSalesModal,
  fontSizeMode,
  onChangeFontSize,
  currencySymbol,
}) => {
  const todayStr = getTodayDateString();
  const readableToday = formatDateReadable(todayStr);

  const cycleFontSize = () => {
    if (fontSizeMode === 'standard') onChangeFontSize('large');
    else if (fontSizeMode === 'large') onChangeFontSize('extra-large');
    else onChangeFontSize('standard');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 px-4 py-3 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Mobile Menu & Real Date */}
        <div className="flex items-center gap-3">
          <button
            id="open-mobile-sidebar-button"
            onClick={onOpenMobileSidebar}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 lg:hidden focus:outline-none ring-1 ring-slate-200 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Today's Real Date Badge */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-2xl shadow-xs">
            <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Today's Date:
              </span>
              <span className="text-sm font-bold text-slate-900">
                {readableToday}
              </span>
            </div>
          </div>
        </div>

        {/* High-Contrast Quick Action Buttons & Font Resizer */}
        <div className="flex items-center gap-2 sm:gap-3">


          {/* Large "+ Expense" High-Contrast Button */}
          <button
            id="quick-add-expense-button"
            onClick={onOpenAddExpenseModal}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-bold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md cursor-pointer active:scale-95 transition-all text-sm sm:text-base border border-amber-300"
          >
            <PlusCircle className="w-5 h-5 text-slate-950 shrink-0" />
            <span className="whitespace-nowrap">+ Expense</span>
          </button>

          {/* Large "+ Sales" High-Contrast Button */}
          <button
            id="quick-add-sales-button"
            onClick={onOpenAddSalesModal}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-slate-950 font-bold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md cursor-pointer active:scale-95 transition-all text-sm sm:text-base border border-emerald-300"
          >
            <TrendingUp className="w-5 h-5 text-slate-950 shrink-0" />
            <span className="whitespace-nowrap">+ Sales</span>
          </button>
        </div>
      </div>
    </header>
  );
};
