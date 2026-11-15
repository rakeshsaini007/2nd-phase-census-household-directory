import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export type ActiveTab = 'workspace' | 'setup';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectAllSheets: () => void;
  onSelectSetup: () => void;
  onSyncSheet: () => void;
  isSyncing: boolean;
  isConfigured: boolean;
}

export function Header({
  activeTab,
  onSelectAllSheets,
  onSelectSetup,
  onSyncSheet,
  isSyncing,
  isConfigured,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3 px-3.5 py-3 sm:gap-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onSelectAllSheets}
          className="text-left text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 sm:text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 rounded"
        >
          Census Registry
        </button>

        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-4 text-xs font-medium sm:gap-6 sm:text-sm"
        >
          <button
            type="button"
            onClick={onSelectAllSheets}
            className={`relative py-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 rounded ${
              activeTab === 'workspace'
                ? 'font-semibold text-indigo-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Sheets</span>
            {activeTab === 'workspace' && (
              <motion.span
                layoutId="header-nav-underline"
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-indigo-700"
              />
            )}
          </button>

          <button
            type="button"
            onClick={onSelectSetup}
            className={`relative py-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 rounded ${
              activeTab === 'setup'
                ? 'font-semibold text-indigo-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="sm:hidden">Setup</span>
            <span className="hidden sm:inline">Apps Script Setup</span>
            {activeTab === 'setup' && (
              <motion.span
                layoutId="header-nav-underline"
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-indigo-700"
              />
            )}
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onSyncSheet}
            disabled={isSyncing || !isConfigured}
            title={
              isConfigured
                ? 'Reload all sheets from Google Spreadsheet'
                : 'Configure Google Apps Script URL first'
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0 min-h-[40px] sm:gap-2 sm:px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span className="sm:hidden">{isSyncing ? 'Syncing' : 'Sync'}</span>
            <span className="hidden sm:inline">
              {isSyncing ? 'Syncing...' : 'Sync Sheets'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
