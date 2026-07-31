import React, { useState, useEffect } from 'react';
import { PaymentMethod, SalesItem } from '../types';
import { getTodayDateString, formatDateReadable } from '../utils/storage';
import { X, Calendar, DollarSign, CreditCard, Sparkles, Plus, CheckCircle2, ShoppingBag } from 'lucide-react';

interface SalesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSales: (sales: Omit<SalesItem, 'id' | 'createdAt'>) => void;
  currencySymbol: string;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
  initialData?: SalesItem;
}

const COOKIE_PRESETS = [
  { name: 'Pistachio Kunafa Box (4-Pack)', unitPrice: 35.00 },
  { name: 'Single Dubai Chewy Cookie', unitPrice: 11.00 },
  { name: 'Assorted Dubai Party Tray', unitPrice: 120.00 },
  { name: 'Stall Walk-in Day Batch', unitPrice: 200.00 },
];

const PAYMENT_METHODS: { method: PaymentMethod; icon: string }[] = [
  { method: 'Cash', icon: '💵' },
  { method: 'Online / QR', icon: '📱' },
  { method: 'Card', icon: '💳' },
];

export const SalesFormModal: React.FC<SalesFormModalProps> = ({
  isOpen,
  onClose,
  onSaveSales,
  currencySymbol,
  fontSizeMode,
  initialData,
}) => {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [productName, setProductName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Online / QR');
  const [remarks, setRemarks] = useState<string>('');
  const [showSuccessBadge, setShowSuccessBadge] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ productName?: string; totalPrice?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date);
        setProductName(initialData.productName);
        setQuantity(initialData.quantity.toString());
        setTotalPrice(initialData.totalPrice.toString());
        setPaymentMethod(initialData.paymentMethod);
        setRemarks(initialData.remarks || '');
      } else {
        setDate(getTodayDateString());
        setProductName('');
        setQuantity('1');
        setTotalPrice('');
        setPaymentMethod('Online / QR');
        setRemarks('');
      }
      setErrors({});
      setShowSuccessBadge(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof COOKIE_PRESETS[0]) => {
    setProductName(preset.name);
    const qty = parseInt(quantity) || 1;
    setTotalPrice((preset.unitPrice * qty).toFixed(2));
    setErrors((prev) => ({ ...prev, productName: undefined, totalPrice: undefined }));
  };

  const handleQuantityChange = (newQtyStr: string) => {
    setQuantity(newQtyStr);
    // If we have a preset matched, auto calculate price
    const qty = parseInt(newQtyStr) || 1;
    const matchedPreset = COOKIE_PRESETS.find((p) => p.name === productName);
    if (matchedPreset) {
      setTotalPrice((matchedPreset.unitPrice * qty).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { productName?: string; totalPrice?: string } = {};

    if (!productName.trim()) {
      newErrors.productName = 'Please enter product or order name';
    }

    const numPrice = parseFloat(totalPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.totalPrice = 'Please enter valid total sales amount';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSaveSales({
      type: 'sales',
      date: date || getTodayDateString(),
      productName: productName.trim(),
      quantity: parseInt(quantity) || 1,
      totalPrice: numPrice,
      paymentMethod,
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
        id="sales-modal-container"
        className="w-full max-w-lg bg-white border-2 border-slate-200 rounded-3xl shadow-xl text-slate-900 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-emerald-600 p-5 border-b border-emerald-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white font-bold flex items-center justify-center text-xl shadow-md">
              💰
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {initialData ? 'Edit Sales' : 'Record New Sales'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                {initialData ? 'Update sales details' : 'Cookie orders & stall income'}
              </p>
            </div>
          </div>
          <button
            id="close-sales-modal-button"
            onClick={onClose}
            className="p-2 rounded-xl text-white hover:bg-emerald-700 focus:outline-none cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Alert */}
        {showSuccessBadge && (
          <div className="m-4 p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center gap-3 text-emerald-800 font-bold text-lg animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <span>{initialData ? 'Sales Updated Successfully!' : 'Sales Recorded Successfully!'}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Quick Cookie Presets */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              1-Tap Common Cookie Items:
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {COOKIE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-800 text-xs sm:text-sm font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Date of Sale
            </label>
            <div className="flex items-center gap-3">
              <input
                id="sales-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 ${inputSizeClass} text-slate-900 font-bold focus:border-emerald-500 focus:outline-none`}
              />
              <button
                type="button"
                onClick={() => setDate(getTodayDateString())}
                className="px-3.5 py-3 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold hover:bg-emerald-600 hover:text-white whitespace-nowrap cursor-pointer transition-colors"
              >
                Set Today
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Selected: <span className="text-emerald-800 font-semibold">{formatDateReadable(date)}</span>
            </p>
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-slate-800 font-bold text-base">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Product / Item Name *
              </span>
            </label>
            <input
              id="sales-product-name-input"
              type="text"
              placeholder="e.g. Pistachio Kunafa Box, 10x Cookies"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setErrors((prev) => ({ ...prev, productName: undefined }));
              }}
              className={`w-full bg-slate-50 border-2 ${
                errors.productName ? 'border-rose-500' : 'border-slate-300 focus:border-emerald-500'
              } rounded-2xl px-4 ${inputSizeClass} text-slate-900 placeholder-slate-400 focus:outline-none`}
            />
            {errors.productName && (
              <p className="text-sm font-bold text-rose-600">{errors.productName}</p>
            )}
          </div>

          {/* Quantity and Total Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-slate-800 font-bold text-base block">
                Quantity (Units)
              </label>
              <input
                id="sales-quantity-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`w-full bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-2xl px-4 py-3 text-xl font-bold text-slate-900 focus:outline-none`}
              />
            </div>

            {/* Total Price */}
            <div className="space-y-1.5">
              <label className="text-slate-800 font-bold text-base block">
                Total Price ({currencySymbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-700">
                  {currencySymbol}
                </span>
                <input
                  id="sales-total-price-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={totalPrice}
                  onChange={(e) => {
                    setTotalPrice(e.target.value);
                    setErrors((prev) => ({ ...prev, totalPrice: undefined }));
                  }}
                  className={`w-full bg-slate-50 border-2 ${
                    errors.totalPrice ? 'border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  } rounded-2xl pl-12 pr-3 py-3 text-xl font-bold text-emerald-800 focus:outline-none`}
                />
              </div>
              {errors.totalPrice && (
                <p className="text-xs font-bold text-rose-600">{errors.totalPrice}</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-slate-800 font-bold text-base">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.method}
                  type="button"
                  onClick={() => setPaymentMethod(pm.method)}
                  className={`p-2.5 rounded-2xl border-2 font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    paymentMethod === pm.method
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg">{pm.icon}</span>
                  <span className="truncate">{pm.method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-medium text-sm block">
              Remarks / Customer Notes (Optional)
            </label>
            <input
              id="sales-remarks-input"
              type="text"
              placeholder="e.g. Instagram DM order, Cash from stall customer"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-base text-slate-900 focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-base border border-slate-300 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-sales-submit-button"
              type="submit"
              className="flex-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-md cursor-pointer active:scale-98 transition-all border border-emerald-700"
            >
              💾 {initialData ? 'Save Changes' : 'Save Sales'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
