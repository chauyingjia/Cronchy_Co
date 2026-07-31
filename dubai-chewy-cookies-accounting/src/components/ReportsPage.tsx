import React, { useState, useMemo } from 'react';
import { ExpenseCategory, ReportTimeframe, Transaction } from '../types';
import { formatMoney, getTodayDateString, formatDateReadable, exportToCSV } from '../utils/storage';
import { BarChart3, Calendar, Download, DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface ReportsPageProps {
  transactions: Transaction[];
  currencySymbol: string;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Ingredients: '#f59e0b', // Amber
  'Stall & Equipment': '#3b82f6', // Blue
  Packaging: '#ec4899', // Pink
  'Rent & Utilities': '#a855f7', // Purple
  Transport: '#14b8a6', // Teal
  Others: '#64748b', // Slate
};

export const ReportsPage: React.FC<ReportsPageProps> = ({
  transactions,
  currencySymbol,
  fontSizeMode,
}) => {
  const today = getTodayDateString();
  const currentMonth = today.substring(0, 7); // "YYYY-MM"
  const currentYear = today.substring(0, 4); // "YYYY"

  const [timeframe, setTimeframe] = useState<ReportTimeframe>('monthly');
  const [selectedDay, setSelectedDay] = useState<string>(today);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  // Filter transactions according to chosen timeframe and date
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (timeframe === 'daily') {
        return t.date === selectedDay;
      } else if (timeframe === 'monthly') {
        return t.date.startsWith(selectedMonth);
      } else {
        return t.date.startsWith(selectedYear);
      }
    });
  }, [transactions, timeframe, selectedDay, selectedMonth, selectedYear]);

  // Expenses & Sales totals for this period
  const totalSales = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'sales')
      .reduce((sum, t) => sum + (t as any).totalPrice, 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (t as any).price, 0);
  }, [filteredTransactions]);

  const netProfit = totalSales - totalExpenses;

  // Expense breakdown by Category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {
      Ingredients: 0,
      'Stall & Equipment': 0,
      Packaging: 0,
      'Rent & Utilities': 0,
      Transport: 0,
      Others: 0,
    };

    filteredTransactions.forEach((t) => {
      if (t.type === 'expense') {
        map[t.category] = (map[t.category] || 0) + t.price;
      }
    });

    const totalExp = Object.values(map).reduce((a, b) => a + b, 0);

    return Object.entries(map)
      .map(([category, amount]) => ({
        name: category as ExpenseCategory,
        value: amount,
        percentage: totalExp > 0 ? (amount / totalExp) * 100 : 0,
        color: CATEGORY_COLORS[category as ExpenseCategory] || '#94a3b8',
      }))
      .filter((item) => item.value > 0);
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    exportToCSV(filteredTransactions, currencySymbol);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title & Timeframe Selector Banner */}
      <div className="bg-white border-2 border-blue-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm uppercase tracking-wide mb-1">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Financial Reports & Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Expense & Profit Breakdown
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Analyze where your money is spent by Day, Month, or Year.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-amber-800 font-bold px-4 py-2.5 rounded-2xl border border-slate-300 shadow-xs cursor-pointer transition-colors text-sm"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Export Report (CSV)</span>
          </button>
        </div>

        {/* Big High-Contrast Timeframe Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            id="report-tab-daily"
            onClick={() => setTimeframe('daily')}
            className={`py-3 px-2 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
              timeframe === 'daily'
                ? 'bg-blue-600 text-white shadow-xs scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📅 Daily
          </button>

          <button
            id="report-tab-monthly"
            onClick={() => setTimeframe('monthly')}
            className={`py-3 px-2 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
              timeframe === 'monthly'
                ? 'bg-blue-600 text-white shadow-xs scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗓️ Monthly
          </button>

          <button
            id="report-tab-yearly"
            onClick={() => setTimeframe('yearly')}
            className={`py-3 px-2 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
              timeframe === 'yearly'
                ? 'bg-blue-600 text-white shadow-xs scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Yearly
          </button>
        </div>

        {/* Specific Date / Month / Year Picker */}
        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="text-sm font-bold text-slate-700">
            Select {timeframe === 'daily' ? 'Day' : timeframe === 'monthly' ? 'Month' : 'Year'}:
          </span>

          {timeframe === 'daily' && (
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="bg-white border-2 border-slate-300 focus:border-blue-500 rounded-xl px-3 py-1.5 text-blue-700 font-bold focus:outline-none cursor-pointer"
            />
          )}

          {timeframe === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border-2 border-slate-300 focus:border-blue-500 rounded-xl px-3 py-1.5 text-blue-700 font-bold focus:outline-none cursor-pointer"
            />
          )}

          {timeframe === 'yearly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border-2 border-slate-300 focus:border-blue-500 rounded-xl px-3 py-1.5 text-blue-700 font-bold focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr.toString()}>
                  {yr}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards for Chosen Timeframe */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Sales */}
        <div className="bg-white border-2 border-emerald-200 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Total Sales Income
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {formatMoney(totalSales, currencySymbol)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Revenue collected in period
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border-2 border-amber-200 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Total Expenses
            </span>
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            {formatMoney(totalExpenses, currencySymbol)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Costs incurred in period
          </p>
        </div>

        {/* Net Profit */}
        <div className={`bg-white border-2 p-5 rounded-3xl shadow-xs ${
          netProfit >= 0 ? 'border-emerald-300' : 'border-rose-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'
            }`}>
              Net Profit / Loss
            </span>
            <DollarSign className={`w-5 h-5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold ${
            netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {formatMoney(netProfit, currencySymbol)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sales minus Expenses
          </p>
        </div>
      </div>

      {/* Expense Breakdown Category Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <PieChartIcon className="w-5 h-5 text-amber-600" />
            Expense Category Distribution
          </h3>

          {categoryBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 font-bold">
              No expenses recorded for this timeframe.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(val: any) => [formatMoney(val as number, currencySymbol), 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Progress Bars Breakdown */}
        <div className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-xs space-y-4">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            Category Totals & Percentages
          </h3>

          {categoryBreakdown.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No category data available for selected period.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="text-amber-800">
                      {formatMoney(cat.value, currencySymbol)} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Itemized Transactions Table for this period */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
          All Entries in Selected Period ({filteredTransactions.length})
        </h3>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No entries found in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-800 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                  <th className="p-3">Type</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Item / Product</th>
                  <th className="p-3">Category / Method</th>
                  <th className="p-3 text-right">Amount ({currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm sm:text-base">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold">
                      {t.type === 'sales' ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs border border-emerald-200 font-extrabold">
                          Sales
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-xs border border-amber-200 font-extrabold">
                          Expense
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">
                      {formatDateReadable(t.date)}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {t.type === 'sales' ? t.productName : t.itemName}
                      {t.remarks && <div className="text-xs text-slate-500 font-normal italic">{t.remarks}</div>}
                    </td>
                    <td className="p-3 text-slate-600">
                      {t.type === 'sales' ? `${t.paymentMethod} (Qty: ${t.quantity})` : t.category}
                    </td>
                    <td className={`p-3 text-right font-extrabold text-base ${
                      t.type === 'sales' ? 'text-emerald-600' : 'text-amber-700'
                    }`}>
                      {t.type === 'sales' ? '+' : '-'}{formatMoney(t.type === 'sales' ? t.totalPrice : t.price, currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
