import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatMoney } from '../utils/storage';
import { Calculator, DollarSign, Sparkles, RefreshCw, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ProfitCalculatorProps {
  transactions: Transaction[];
  currencySymbol: string;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  transactions,
  currencySymbol,
  fontSizeMode,
}) => {
  // 1. Overall Business Profit Calculator State
  const [salesInput, setSalesInput] = useState<string>('');
  const [expenseInput, setExpenseInput] = useState<string>('');

  // 2. Cookie Recipe Unit Economics Calculator State (Preset with default realistic values for Dubai Chewy Cookies)
  const [pistachioCost, setPistachioCost] = useState<string>('28.00');
  const [kataifiCost, setKataifiCost] = useState<string>('12.00');
  const [chocolateCost, setChocolateCost] = useState<string>('18.00');
  const [butterFlourCost, setButterFlourCost] = useState<string>('10.00');
  const [packagingBoxCost, setPackagingBoxCost] = useState<string>('8.00');
  const [batchYield, setBatchYield] = useState<string>('20'); // 20 cookies per batch
  const [sellingPricePerCookie, setSellingPricePerCookie] = useState<string>('11.00');
  const [stallRentalPerDay, setStallRentalPerDay] = useState<string>('80.00');

  // Load totals from actual recorded database
  const loadRecordedTotals = (period: 'today' | 'month' | 'all') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const monthStr = todayStr.substring(0, 7);

    let filtered = transactions;
    if (period === 'today') {
      filtered = transactions.filter((t) => t.date === todayStr);
    } else if (period === 'month') {
      filtered = transactions.filter((t) => t.date.startsWith(monthStr));
    }

    const s = filtered
      .filter((t) => t.type === 'sales')
      .reduce((sum, t) => sum + (t as any).totalPrice, 0);

    const e = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (t as any).price, 0);

    setSalesInput(s.toFixed(2));
    setExpenseInput(e.toFixed(2));
  };

  // Section 1 Calculations
  const salesVal = parseFloat(salesInput) || 0;
  const expenseVal = parseFloat(expenseInput) || 0;
  const netProfitVal = salesVal - expenseVal;
  const profitMarginPercent = salesVal > 0 ? (netProfitVal / salesVal) * 100 : 0;

  // Section 2 Cookie Batch Unit Calculations
  const pCost = parseFloat(pistachioCost) || 0;
  const kCost = parseFloat(kataifiCost) || 0;
  const cCost = parseFloat(chocolateCost) || 0;
  const bfCost = parseFloat(butterFlourCost) || 0;
  const boxCost = parseFloat(packagingBoxCost) || 0;
  const qtyYield = parseInt(batchYield) || 1;
  const pricePerCookie = parseFloat(sellingPricePerCookie) || 0;
  const stallRental = parseFloat(stallRentalPerDay) || 0;

  const totalBatchCost = pCost + kCost + cCost + bfCost + boxCost;
  const costPerCookie = totalBatchCost / qtyYield;
  const profitPerCookie = pricePerCookie - costPerCookie;
  const cookieMarginPercent = pricePerCookie > 0 ? (profitPerCookie / pricePerCookie) * 100 : 0;
  
  // Break-even cookies needed to cover stall rental
  const breakEvenCookies = profitPerCookie > 0 ? Math.ceil(stallRental / profitPerCookie) : 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-stone-900 to-purple-950 p-5 sm:p-6 rounded-3xl border-2 border-purple-500/40 shadow-lg text-white">
        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm tracking-wide uppercase mb-1">
          <Calculator className="w-5 h-5 text-purple-300" />
          <span>Smart Profit Tools</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Profit & Recipe Cost Calculators
        </h2>
        <p className="text-stone-200 text-sm sm:text-base mt-1">
          Calculate overall profits (Sales - Expenses) and estimate your Dubai cookie recipe production costs.
        </p>
      </div>

      {/* SECTION 1: Overall Sales - Expenses Profit Calculator */}
      <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-purple-600" />
              1. Overall Business Profit Calculator
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Formula: Net Profit = Total Sales - Total Expenses
            </p>
          </div>

          {/* Quick Load Buttons from Database */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-bold">Auto-Load:</span>
            <button
              id="load-today-profit-btn"
              onClick={() => loadRecordedTotals('today')}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 cursor-pointer transition-colors"
            >
              Today's Data
            </button>
            <button
              id="load-month-profit-btn"
              onClick={() => loadRecordedTotals('month')}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 cursor-pointer transition-colors"
            >
              This Month
            </button>
            <button
              id="load-all-profit-btn"
              onClick={() => loadRecordedTotals('all')}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 cursor-pointer transition-colors"
            >
              All Time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Inputs */}
          <div className="space-y-4">
            {/* Sales Input */}
            <div className="space-y-1.5">
              <label className="text-emerald-800 font-bold text-base block">
                Total Sales Revenue ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-700">
                  {currencySymbol}
                </span>
                <input
                  id="calc-sales-input"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={salesInput}
                  onChange={(e) => setSalesInput(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-3.5 text-2xl font-bold text-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Expenses Input */}
            <div className="space-y-1.5">
              <label className="text-amber-800 font-bold text-base block">
                Total Expenses / Costs ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-700">
                  {currencySymbol}
                </span>
                <input
                  id="calc-expense-input"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={expenseInput}
                  onChange={(e) => setExpenseInput(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl pl-12 pr-4 py-3.5 text-2xl font-bold text-amber-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Results Box */}
          <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-3xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Calculated Net Profit
              </span>
              <div className={`text-3xl sm:text-4xl font-extrabold ${
                netProfitVal >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {formatMoney(netProfitVal, currencySymbol)}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm sm:text-base">
              <span className="text-slate-700 font-bold">Profit Margin:</span>
              <span className={`font-extrabold px-3 py-1 rounded-xl text-lg ${
                profitMarginPercent >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {profitMarginPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Dubai Chewy Cookie Recipe Unit Economics Calculator */}
      <div className="bg-white border-2 border-amber-300 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Tailored for Dubai Chewy Cookies</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            🍪 2. Cookie Batch Cost & Unit Economics Estimator
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Input ingredient costs for a single baking batch to discover cost per cookie and break-even points!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ingredient Cost Inputs */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                1. Pistachio Cream Paste ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.10"
                value={pistachioCost}
                onChange={(e) => setPistachioCost(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-base text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                2. Kataifi / Kunafa Dough ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.10"
                value={kataifiCost}
                onChange={(e) => setKataifiCost(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-base text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                3. Chocolate Shell / Coating ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.10"
                value={chocolateCost}
                onChange={(e) => setChocolateCost(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-base text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                4. Butter, Flour & Sugar ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.10"
                value={butterFlourCost}
                onChange={(e) => setButterFlourCost(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-base text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                5. Packaging Boxes & Foil ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.10"
                value={packagingBoxCost}
                onChange={(e) => setPackagingBoxCost(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-xl px-3 py-2 text-base text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-800 block">
                6. Cookies Produced Per Batch (Yield)
              </label>
              <input
                type="number"
                min="1"
                value={batchYield}
                onChange={(e) => setBatchYield(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-base text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-800 block">
                7. Selling Price Per Cookie ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.50"
                value={sellingPricePerCookie}
                onChange={(e) => setSellingPricePerCookie(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-base text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-purple-800 block">
                8. Daily Stall Rental Fee ({currencySymbol})
              </label>
              <input
                type="number"
                step="5.00"
                value={stallRentalPerDay}
                onChange={(e) => setStallRentalPerDay(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-purple-500 rounded-xl px-3 py-2 text-base text-slate-900 font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Unit Economics Results Summary Panel */}
          <div className="bg-amber-50/60 border-2 border-amber-200 p-5 rounded-3xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block border-b border-amber-200 pb-2">
                Batch Analysis Results
              </span>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Total Batch Cost:</span>
                <span className="text-base font-bold text-amber-900">
                  {formatMoney(totalBatchCost, currencySymbol)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Cost Per Cookie:</span>
                <span className="text-base font-bold text-amber-800">
                  {formatMoney(costPerCookie, currencySymbol)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Selling Price:</span>
                <span className="text-base font-bold text-emerald-700">
                  {formatMoney(pricePerCookie, currencySymbol)}
                </span>
              </div>

              <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Profit Per Cookie:</span>
                <span className={`text-xl font-extrabold ${
                  profitPerCookie >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {formatMoney(profitPerCookie, currencySymbol)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Recipe Margin:</span>
                <span className="font-bold text-purple-800">
                  {cookieMarginPercent.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Break-Even Insight Box */}
            <div className="bg-amber-100/80 border border-amber-300 p-3.5 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-700" />
                <span>Stall Rental Break-Even Target</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed">
                Sell at least <span className="font-extrabold text-amber-900 underline">{breakEvenCookies} cookies</span> today to cover your {formatMoney(stallRental, currencySymbol)} stall rental!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
