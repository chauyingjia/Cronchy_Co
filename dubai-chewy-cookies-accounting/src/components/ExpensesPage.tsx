import React, { useState } from 'react';
import { ExpenseCategory, ExpenseItem } from '../types';
import { formatMoney, formatDateReadable } from '../utils/storage';
import { PlusCircle, Search, Filter, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';

interface ExpensesPageProps {
  expenses: ExpenseItem[];
  currencySymbol: string;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
  onOpenAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES: ('All' | ExpenseCategory)[] = [
  'All',
  'Ingredients',
  'Stall & Equipment',
  'Packaging',
  'Rent & Utilities',
  'Transport',
  'Others',
];

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  expenses,
  currencySymbol,
  fontSizeMode,
  onOpenAddExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ExpenseCategory>('All');
  const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM or exact date

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = 
      exp.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.remarks && exp.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;

    const matchesDate = !dateFilter || exp.date.startsWith(dateFilter);

    return matchesSearch && matchesCategory && matchesDate;
  });

  const totalFilteredPrice = filteredExpenses.reduce((sum, exp) => sum + exp.price, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Top Title Banner */}
      <div className="bg-white border-2 border-amber-300 p-5 sm:p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm tracking-wide uppercase mb-1">
            <span>💸 Expense Tracker (Money Out)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Ingredients & Supplies Purchases
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            View, search, and manage all your business expenses.
          </p>
        </div>

        <button
          id="expenses-page-add-btn"
          onClick={onOpenAddExpense}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-extrabold px-5 py-3.5 rounded-2xl shadow-md cursor-pointer active:scale-95 transition-all text-base border border-amber-300"
        >
          <PlusCircle className="w-6 h-6 text-slate-950" />
          <span>+ Add New Expense</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-slate-200 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses (e.g. Butter, Pistachio, Boxes)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl pl-12 pr-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Month/Date Filter */}
          <div className="relative">
            <Calendar className="w-5 h-5 text-amber-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl pl-12 pr-4 py-3 text-base text-slate-900 focus:outline-none cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Summary Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200 px-5 py-3.5 rounded-2xl shadow-xs">
        <span className="text-sm font-bold text-slate-600">
          Found <span className="text-amber-700 font-extrabold">{filteredExpenses.length}</span> expenses
        </span>
        <span className="text-base sm:text-lg font-extrabold text-slate-900">
          Total Spent: <span className="text-amber-700">{formatMoney(totalFilteredPrice, currencySymbol)}</span>
        </span>
      </div>

      {/* Expenses Table / List */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {filteredExpenses.length === 0 ? (
          <div className="p-10 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800">No Expenses Found</h3>
            <p className="text-sm">Try changing your search term or filter category.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-200">
                      {exp.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      📅 {formatDateReadable(exp.date)}
                    </span>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    {exp.itemName}
                  </h4>
                  {exp.remarks && (
                    <p className="text-xs text-slate-500 italic">
                      Remarks: "{exp.remarks}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-xl sm:text-2xl font-extrabold text-amber-700">
                    {formatMoney(exp.price, currencySymbol)}
                  </div>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete expense"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
