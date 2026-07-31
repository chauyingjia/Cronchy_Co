import React, { useState, useEffect } from 'react';
import { ExpenseCategory, ExpenseItem } from '../types';
import { COMMON_INGREDIENT_PRESETS } from '../data/initialData';
import { getTodayDateString, formatDateReadable } from '../utils/storage';
import { X, Calendar, DollarSign, Tag, FileText, CheckCircle2, Sparkles, Plus } from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  currencySymbol: string;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
}

const CATEGORIES: { label: ExpenseCategory; icon: string }[] = [
  { label: 'Ingredients', icon: '🧈' },
  { label: 'Stall & Equipment', icon: '🎪' },
  { label: 'Packaging', icon: '📦' },
  { label: 'Rent & Utilities', icon: '⚡' },
  { label: 'Transport', icon: '🚚' },
  { label: 'Others', icon: '📝' },
];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  currencySymbol,
  fontSizeMode,
}) => {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [itemName, setItemName] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Ingredients');
  const [price, setPrice] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [showSuccessBadge, setShowSuccessBadge] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ itemName?: string; price?: string }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(getTodayDateString()); // Defaults to current real date
      setItemName('');
      setCategory('Ingredients');
      setPrice('');
      setRemarks('');
      setErrors({});
      setShowSuccessBadge(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof COMMON_INGREDIENT_PRESETS[0]) => {
    setItemName(preset.name);
    setCategory(preset.category);
    if (!price) {
      setPrice(preset.defaultPrice.toString());
    }
    setErrors((prev) => ({ ...prev, itemName: undefined, price: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { itemName?: string; price?: string } = {};

    if (!itemName.trim()) {
      newErrors.itemName = 'Please enter what you bought (e.g. Butter, Flour)';
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Please enter a valid price amount';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSaveExpense({
      type: 'expense',
      date: date || getTodayDateString(),
      itemName: itemName.trim(),
      category,
      price: numPrice,
      remarks: remarks.trim() || undefined,
    });

    setShowSuccessBadge(true);
    setTimeout(() => {
      setShowSuccessBadge(false);
      onClose();
    }, 800);
  };

  const inputSizeClass = fontSizeMode === 'extra-large' ? 'text-xl py-3.5' : 'text-lg py-3';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="expense-modal-container"
        className="w-full max-w-lg bg-white border-2 border-slate-200 rounded-3xl shadow-xl text-slate-900 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-amber-500 p-5 border-b border-amber-600 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white font-bold flex items-center justify-center text-xl shadow-md">
              💸
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
                Record New Expense
              </h2>
              <p className="text-xs sm:text-sm text-slate-900 font-medium">
                Bought ingredients or stall equipment
              </p>
            </div>
          </div>
          <button
            id="close-expense-modal-button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-900 hover:text-black hover:bg-amber-400 focus:outline-none cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Alert */}
        {showSuccessBadge && (
          <div className="m-4 p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center gap-3 text-emerald-800 font-bold text-lg animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <span>Expense Recorded Successfully!</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Quick Preset Buttons for 55+ Parents */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              1-Tap Common Ingredients (Saves Typing):
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {COMMON_INGREDIENT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-500 hover:text-slate-950 text-slate-800 text-xs sm:text-sm font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker (Auto Today's Date) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <Calendar className="w-5 h-5 text-amber-600" />
              Date of Purchase
            </label>
            <div className="flex items-center gap-3">
              <input
                id="expense-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 ${inputSizeClass} text-slate-900 font-bold focus:border-amber-500 focus:outline-none`}
              />
              <button
                type="button"
                onClick={() => setDate(getTodayDateString())}
                className="px-3.5 py-3 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 whitespace-nowrap cursor-pointer transition-colors"
              >
                Set Today
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Selected: <span className="text-amber-800 font-semibold">{formatDateReadable(date)}</span>
            </p>
          </div>

          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-slate-800 font-bold text-base">
              <span>Item / Description *</span>
              <span className="text-xs font-normal text-slate-500">What did you buy?</span>
            </label>
            <input
              id="expense-item-name-input"
              type="text"
              placeholder="e.g. 2kg Butter, Pistachio Paste, Packaging Boxes"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                setErrors((prev) => ({ ...prev, itemName: undefined }));
              }}
              className={`w-full bg-slate-50 border-2 ${
                errors.itemName ? 'border-rose-500' : 'border-slate-300 focus:border-amber-500'
              } rounded-2xl px-4 ${inputSizeClass} text-slate-900 placeholder-slate-400 focus:outline-none`}
            />
            {errors.itemName && (
              <p className="text-sm font-bold text-rose-600">{errors.itemName}</p>
            )}
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <Tag className="w-5 h-5 text-amber-600" />
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`p-2.5 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
                    category === cat.label
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Amount */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-slate-800 font-bold text-base">
              <span className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                Total Price ({currencySymbol}) *
              </span>
              <span className="text-xs text-slate-500">Total amount paid</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-amber-700">
                {currencySymbol}
              </span>
              <input
                id="expense-price-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setErrors((prev) => ({ ...prev, price: undefined }));
                }}
                className={`w-full bg-slate-50 border-2 ${
                  errors.price ? 'border-rose-500' : 'border-slate-300 focus:border-amber-500'
                } rounded-2xl pl-14 pr-4 py-3.5 text-2xl font-bold text-amber-800 focus:outline-none`}
              />
            </div>
            {errors.price && (
              <p className="text-sm font-bold text-rose-600">{errors.price}</p>
            )}
          </div>

          {/* Remarks (Optional) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
              <FileText className="w-4 h-4 text-slate-500" />
              Remarks / Notes (Optional)
            </label>
            <input
              id="expense-remarks-input"
              type="text"
              placeholder="e.g. Bought from Lotus supermarket, wholesale discount"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-base text-slate-900 focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-base border border-slate-300 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-expense-submit-button"
              type="submit"
              className="flex-2 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg shadow-md cursor-pointer active:scale-98 transition-all border border-amber-600"
            >
              💾 Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
