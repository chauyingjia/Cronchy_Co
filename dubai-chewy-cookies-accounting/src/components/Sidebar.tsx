import React from 'react';
import { ViewTab } from '../types';
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  BarChart3, 
  Calculator, 
  Settings,
  Cookie,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  fontSizeMode: 'standard' | 'large' | 'extra-large';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  fontSizeMode,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ViewTab,
      label: 'Dashboard',
      sublabel: 'Overview & Trends',
      icon: LayoutDashboard,
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
    {
      id: 'expenses' as ViewTab,
      label: 'Record Expenses',
      sublabel: 'Ingredients & Supplies',
      icon: ArrowDownCircle,
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    {
      id: 'sales' as ViewTab,
      label: 'Record Sales',
      sublabel: 'Cookie Orders & Income',
      icon: ArrowUpCircle,
      color: 'bg-green-500/10 text-green-700 dark:text-green-400',
    },
    {
      id: 'reports' as ViewTab,
      label: 'Expense Reports',
      sublabel: 'Daily, Monthly, Yearly',
      icon: BarChart3,
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    },
    {
      id: 'profit' as ViewTab,
      label: 'Profit Calculator',
      sublabel: 'Profit & Recipe Costs',
      icon: Calculator,
      color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    },
    {
      id: 'settings' as ViewTab,
      label: 'Settings',
      sublabel: 'Currency & Backup',
      icon: Settings,
      color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
    },
  ];

  // Font size multiplier based on setting
  const labelSizeClass = 
    fontSizeMode === 'extra-large' 
      ? 'text-xl' 
      : fontSizeMode === 'large' 
      ? 'text-lg font-semibold' 
      : 'text-base font-semibold';

  const sublabelSizeClass = 
    fontSizeMode === 'extra-large' 
      ? 'text-sm' 
      : 'text-xs';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        id="sidebar-container"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 md:w-80 bg-stone-900 text-stone-100 flex flex-col border-r border-stone-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-900/30 ring-2 ring-amber-300/30">
              <Cookie className="w-7 h-7 text-stone-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-400 tracking-tight leading-tight">
                Dubai Chewy Cookies
              </h1>
              <p className="text-xs text-stone-400 font-medium">
                Simple Accounting App
              </p>
            </div>
          </div>
          <button
            id="close-sidebar-button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 focus:outline-none"
            aria-label="Close Sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="px-3 py-1 text-xs font-bold text-amber-500/80 uppercase tracking-wider">
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left border cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.01]'
                    : 'bg-stone-800/50 text-stone-200 border-stone-700/50 hover:bg-stone-800 hover:text-white hover:border-stone-600'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl flex items-center justify-center ${
                    isActive
                      ? 'bg-stone-950 text-amber-400'
                      : 'bg-stone-700/60 text-amber-300'
                  }`}
                >
                  <Icon className="w-6 h-6 shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`${labelSizeClass} leading-snug truncate`}>
                    {item.label}
                  </div>
                  <div
                    className={`${sublabelSizeClass} ${
                      isActive ? 'text-stone-900 font-medium' : 'text-stone-400'
                    } truncate`}
                  >
                    {item.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Senior Assistance & Business Note Footer */}
        <div className="p-4 m-3 bg-stone-800/80 rounded-2xl border border-stone-700/70 text-stone-300">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300">Ready to Record</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Auto-stamps today's date on new entries. Tap tabs to view profit or reports!
          </p>
        </div>
      </aside>
    </>
  );
};
