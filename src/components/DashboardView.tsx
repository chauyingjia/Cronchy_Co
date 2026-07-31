import React from 'react';
import { Transaction, ViewTab } from '../types';
import { formatMoney, getTodayDateString, formatDateReadable } from '../utils/storage';
import {
  PlusCircle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Calculator,
  BarChart3,
  Trash2,
  AlertCircle,
  Edit2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface DashboardViewProps {
  transactions: Transaction[];
  currencySymbol: string;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
  onOpenAddExpense: () => void;
  onOpenAddSales: () => void;
  onSelectTab: (tab: ViewTab) => void;
  onDeleteTransaction: (id: string) => void;
  onEditExpense: (expense: any) => void;
  onEditSales: (sales: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  currencySymbol,
  fontSizeMode,
  onOpenAddExpense,
  onOpenAddSales,
  onSelectTab,
  onDeleteTransaction,
  onEditExpense,
  onEditSales,
}) => {
  const todayStr = getTodayDateString();
  const currentYearMonth = todayStr.substring(0, 7); // "YYYY-MM"

  // Filter Today's transactions
  const todayExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date === todayStr)
    .reduce((sum, t) => sum + (t as any).price, 0);

  const todaySales = transactions
    .filter((t) => t.type === 'sales' && t.date === todayStr)
    .reduce((sum, t) => sum + (t as any).totalPrice, 0);

  const todayProfit = todaySales - todayExpenses;

  // Filter This Month's transactions
  const monthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentYearMonth))
    .reduce((sum, t) => sum + (t as any).price, 0);

  const monthSales = transactions
    .filter((t) => t.type === 'sales' && t.date.startsWith(currentYearMonth))
    .reduce((sum, t) => sum + (t as any).totalPrice, 0);

  const monthProfit = monthSales - monthExpenses;

  // Build 6-Month Monthly Trends data for chart
  const monthlyTrendsData = React.useMemo(() => {
    const monthsMap: { [key: string]: { monthName: string; sales: number; expenses: number; profit: number } } = {};
    const now = new Date();

    // Past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      monthsMap[key] = { monthName, sales: 0, expenses: 0, profit: 0 };
    }

    transactions.forEach((t) => {
      const ym = t.date.substring(0, 7);
      if (monthsMap[ym]) {
        if (t.type === 'sales') {
          monthsMap[ym].sales += t.totalPrice;
        } else {
          monthsMap[ym].expenses += t.price;
        }
      }
    });

    return Object.values(monthsMap).map((m) => ({
      ...m,
      profit: m.sales - m.expenses,
    }));
  }, [transactions]);

  // FontSize adjustments
  const statValClass = fontSizeMode === 'extra-large' ? 'text-3xl' : 'text-2xl sm:text-3xl';

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner tailored for Dubai Chewy Cookies */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 p-5 sm:p-6 rounded-3xl border-2 border-amber-600/40 shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wide uppercase mb-1">
            <span>🍪 Dubai Chewy Cookies Studio</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-300 font-semibold">{formatDateReadable(todayStr)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Daily Business Overview
          </h2>
        </div>

        {/* High-Contrast Big Quick Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="dash-add-expense-btn"
            onClick={onOpenAddExpense}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-extrabold px-5 py-3.5 rounded-2xl shadow-md cursor-pointer active:scale-95 transition-all text-base border border-amber-200"
          >
            <PlusCircle className="w-6 h-6 text-slate-950" />
            <span>+ Add Expense</span>
          </button>

          <button
            id="dash-add-sales-btn"
            onClick={onOpenAddSales}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 hover:to-emerald-200 text-slate-950 font-extrabold px-5 py-3.5 rounded-2xl shadow-md cursor-pointer active:scale-95 transition-all text-base border border-emerald-200"
          >
            <TrendingUp className="w-6 h-6 text-slate-950" />
            <span>+ Add Sales</span>
          </button>
        </div>
      </div>

      {/* 3 Large Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* This Month's Sales */}
        <div className="bg-white border-2 border-emerald-200 p-5 rounded-3xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              This Month's Income
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <div className={`${statValClass} font-extrabold text-emerald-700`}>
            {formatMoney(monthSales, currencySymbol)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total sales collected this month
          </p>
        </div>

        {/* This Month's Expenses */}
        <div className="bg-white border-2 border-amber-200 p-5 rounded-3xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              This Month's Expenses
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
          <div className={`${statValClass} font-extrabold text-amber-700`}>
            {formatMoney(monthExpenses, currencySymbol)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total ingredients & supplies this month
          </p>
        </div>

        {/* This Month's Net Profit */}
        <div className={`bg-white border-2 p-5 rounded-3xl shadow-xs hover:shadow-md transition-shadow ${monthProfit >= 0 ? 'border-purple-300' : 'border-rose-300'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${monthProfit >= 0 ? 'bg-purple-50 text-purple-800 border border-purple-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
              This Month's Profit
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${monthProfit >= 0 ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'
              }`}>
              <Calculator className="w-6 h-6" />
            </div>
          </div>
          <div className={`${statValClass} font-extrabold ${monthProfit >= 0 ? 'text-purple-700' : 'text-rose-600'
            }`}>
            {formatMoney(monthProfit, currencySymbol)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Total monthly net profit
          </p>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-600" />
              Monthly Sales vs Expenses Trend
            </h3>
          </div>
          <button
            id="go-to-reports-btn"
            onClick={() => onSelectTab('reports')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-800 text-xs font-bold border border-slate-300 cursor-pointer transition-colors"
          >
            View Full Reports &rarr;
          </button>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="monthName" stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: any) => [formatMoney(value as number, currencySymbol), '']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="sales" name="Sales (Income)" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses (Costs)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          id="dash-profit-calc-card"
          onClick={() => onSelectTab('profit')}
          className="p-5 rounded-3xl bg-white border-2 border-purple-200 hover:border-purple-400 text-left cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🧮</span>
            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Open Tool
            </span>
          </div>
          <h4 className="text-xl font-bold text-slate-900 group-hover:text-purple-900">
            Profit Calculator
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            算profit
          </p>
        </button>

        <button
          id="dash-expense-reports-card"
          onClick={() => onSelectTab('reports')}
          className="p-5 rounded-3xl bg-white border-2 border-blue-200 hover:border-blue-400 text-left cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              View Breakdown
            </span>
          </div>
          <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-900">
            Daily, Monthly & Yearly Reports
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            看报告
          </p>
        </button>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            Recent Entries History
          </h3>
          <span className="text-xs text-slate-500">
            Showing latest {Math.min(6, transactions.length)} entries
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-2" />
            <p className="font-bold text-base">No transactions recorded yet.</p>
            <p className="text-xs mt-1">Tap "+ Expense" or "+ Sales" above to start!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${item.type === 'sales' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                    {item.type === 'sales' ? '💰' : '💸'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-base leading-snug">
                      {item.type === 'sales' ? item.productName : item.itemName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">{formatDateReadable(item.date)}</span>
                      <span>•</span>
                      <span className="text-slate-600">
                        {item.type === 'sales' ? `Qty: ${item.quantity} (${item.paymentMethod})` : item.category}
                      </span>
                    </div>
                    {item.remarks && (
                      <div className="text-xs text-slate-500 italic mt-0.5 truncate max-w-xs sm:max-w-md">
                        "{item.remarks}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`text-right font-extrabold text-base sm:text-lg ${item.type === 'sales' ? 'text-emerald-600' : 'text-amber-700'
                    }`}>
                    {item.type === 'sales' ? '+' : '-'}{formatMoney(item.type === 'sales' ? item.totalPrice : item.price, currencySymbol)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => item.type === 'sales' ? onEditSales(item) : onEditExpense(item)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
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
