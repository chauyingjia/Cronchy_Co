import React, { useState } from 'react';
import { AppSettings } from '../utils/storage';
import { Settings as SettingsIcon, Type, DollarSign, Download, Upload, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetSampleData: () => void;
  onImportJSON: (jsonStr: string) => boolean;
  onExportJSON: () => void;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
}

const CURRENCIES = ['RM', '$', 'S$', 'RM (MYR)', 'RM / MYR', '฿', '£', '€', '¥', '₹'];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetSampleData,
  onImportJSON,
  onExportJSON,
  fontSizeMode,
}) => {
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || 'RM');
  const [importedJson, setImportedJson] = useState('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [importMessage, setImportMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleSaveSettings = () => {
    onUpdateSettings({
      ...settings,
      currencySymbol,
    });
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  const handleFontSizeChange = (mode: 'standard' | 'large' | 'extra-large') => {
    onUpdateSettings({
      ...settings,
      fontSizeMode: mode,
    });
  };

  const handleProcessImport = () => {
    if (!importedJson.trim()) return;
    const ok = onImportJSON(importedJson);
    if (ok) {
      setImportMessage({ text: 'Data imported successfully!', success: true });
      setImportedJson('');
    } else {
      setImportMessage({ text: 'Invalid JSON data format. Please check the file.', success: false });
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Title Banner */}
      <div className="bg-white border-2 border-amber-200 p-5 sm:p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-wide mb-1">
          <SettingsIcon className="w-5 h-5 text-amber-600" />
          <span>App Preferences & Data Management</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Settings & Data Backup
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Customize currency symbol, adjust text sizes for easier reading, and export data backups.
        </p>
      </div>

      {showSaveMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 font-bold text-base">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Senior Reading Text Size Preference */}
      <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          <Type className="w-5 h-5 text-amber-600" />
          Text & Display Size (Senior Friendly)
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Select font size for clear reading. Designed for 55+ parents and easy navigation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleFontSizeChange('standard')}
            className={`p-4 rounded-2xl border-2 font-bold text-center cursor-pointer transition-all ${
              fontSizeMode === 'standard'
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-base font-bold">Standard Size</div>
            <div className="text-xs opacity-80">Default compact text</div>
          </button>

          <button
            onClick={() => handleFontSizeChange('large')}
            className={`p-4 rounded-2xl border-2 font-bold text-center cursor-pointer transition-all ${
              fontSizeMode === 'large'
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-lg font-extrabold">Large Text (Recommended)</div>
            <div className="text-xs opacity-80">Clear & comfortable reading</div>
          </button>

          <button
            onClick={() => handleFontSizeChange('extra-large')}
            className={`p-4 rounded-2xl border-2 font-bold text-center cursor-pointer transition-all ${
              fontSizeMode === 'extra-large'
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-xl font-extrabold">Extra Large Text</div>
            <div className="text-xs opacity-80">Maximum legibility</div>
          </button>
        </div>
      </div>

      {/* Currency Preferences */}
      <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Currency Symbol
        </h3>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 block">
            Choose or type your currency symbol:
          </label>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrencySymbol(c)}
                className={`px-3.5 py-2 rounded-xl border font-bold text-sm cursor-pointer transition-colors ${
                  currencySymbol === c
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              placeholder="e.g. RM, $, S$"
              className="bg-slate-50 border-2 border-slate-300 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-base font-bold text-slate-900 focus:outline-none max-w-xs"
            />
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer transition-colors"
            >
              Save Currency
            </button>
          </div>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-5">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Data Backup & Safe Export
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Export JSON Backup */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Download className="w-5 h-5 text-amber-600" />
              Download Full Data Backup
            </div>
            <p className="text-xs text-slate-600">
              Save a complete copy of all your expense & sales records to your device.
            </p>
            <button
              onClick={onExportJSON}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer transition-colors"
            >
              📥 Download Backup (.json)
            </button>
          </div>

          {/* Reset Sample Data */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              Restore Sample Demo Data
            </div>
            <p className="text-xs text-slate-600">
              Reload initial sample transactions for Dubai Chewy Cookies business.
            </p>
            <button
              onClick={onResetSampleData}
              className="w-full py-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-sm border border-purple-300 cursor-pointer transition-colors"
            >
              🔄 Reload Sample Data
            </button>
          </div>
        </div>

        {/* Import JSON */}
        <div className="pt-2 space-y-2">
          <label className="text-sm font-bold text-slate-700 block">
            Import JSON Data Backup:
          </label>
          {importMessage && (
            <p className={`text-xs font-bold ${importMessage.success ? 'text-emerald-700' : 'text-rose-600'}`}>
              {importMessage.text}
            </p>
          )}
          <textarea
            rows={3}
            value={importedJson}
            onChange={(e) => setImportedJson(e.target.value)}
            placeholder="Paste raw JSON backup string here..."
            className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleProcessImport}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Backup Data
          </button>
        </div>
      </div>
    </div>
  );
};
