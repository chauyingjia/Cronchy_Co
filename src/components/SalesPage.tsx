import React, { useState } from 'react';
import { PaymentMethod, SalesItem } from '../types';
import { formatMoney, formatDateReadable } from '../utils/storage';
import { PlusCircle, Search, Filter, Trash2, Calendar, AlertCircle, Edit2 } from 'lucide-react';

interface SalesPageProps {
  sales: SalesItem[];
  currencySymbol: string;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
  onOpenAddSales: () => void;
  onDeleteSales: (id: string) => void;
  onEditSales: (sales: SalesItem) => void;
}

const PAYMENT_METHODS: ('All' | PaymentMethod)[] = ['All', 'Cash', 'Online / QR', 'Card'];

export const SalesPage: React.FC<SalesPageProps> = ({
  sales,
  currencySymbol,
  fontSizeMode,
  onOpenAddSales,
  onDeleteSales,
  onEditSales,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'All' | PaymentMethod>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredSales = sales.filter((item) => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.remarks && item.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = selectedMethod === 'All' || item.paymentMethod === selectedMethod;

    const matchesDate = !dateFilter || item.date.startsWith(dateFilter);

    return matchesSearch && matchesMethod && matchesDate;
  });

  const totalFilteredSales = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner */}
      <div className="bg-white border-2 border-emerald-300 p-5 sm:p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm tracking-wide uppercase mb-1">
            <span>💰 Sales Tracker (Money In)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Cookie Orders & Stall Revenue
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            View, search, and manage all your sales income entries.
          </p>
        </div>

        <button
          id="sales-page-add-btn"
          onClick={onOpenAddSales}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-slate-950 font-extrabold px-5 py-3.5 rounded-2xl shadow-md cursor-pointer active:scale-95 transition-all text-base border border-emerald-300"
        >
          <PlusCircle className="w-6 h-6 text-slate-950" />
          <span>+ Add New Sales</span>
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
              placeholder="Search sales (e.g. Pistachio Box, Stall orders)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <Calendar className="w-5 h-5 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-3 text-base text-slate-900 focus:outline-none cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Payment Method Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Payment Method:
          </span>
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer ${
                selectedMethod === method
                  ? 'bg-emerald-500 text-slate-950 shadow-xs scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Summary Banner */}
      <div className="flex items-center justify-between bg-white border border-slate-200 px-5 py-3.5 rounded-2xl shadow-xs">
        <span className="text-sm font-bold text-slate-600">
          Found <span className="text-emerald-700 font-extrabold">{filteredSales.length}</span> sales entries
        </span>
        <span className="text-base sm:text-lg font-extrabold text-slate-900">
          Total Sales: <span className="text-emerald-700">{formatMoney(totalFilteredSales, currencySymbol)}</span>
        </span>
      </div>

      {/* Sales List */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {filteredSales.length === 0 ? (
          <div className="p-10 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-12 h-12 mx-auto text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-800">No Sales Entries Found</h3>
            <p className="text-sm">Try changing search keywords or date filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSales.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                      {item.paymentMethod}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      📅 {formatDateReadable(item.date)}
                    </span>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    {item.productName}
                  </h4>
                  <div className="text-xs text-slate-600">
                    Quantity: <span className="text-slate-900 font-bold">{item.quantity}</span>
                  </div>
                  {item.remarks && (
                    <p className="text-xs text-slate-500 italic">
                      Remarks: "{item.remarks}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                    {formatMoney(item.totalPrice, currencySymbol)}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onEditSales(item)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit sales"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDeleteSales(item.id)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete sales"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
