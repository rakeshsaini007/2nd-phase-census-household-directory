import {
  RefreshCw,
  Lock,
  Table2,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';

export type ActiveTab = 'workspace' | 'setup';

interface HeaderProps {
  activeTab: ActiveTab;
  isAdminUnlocked: boolean;
  isGoogleSheetVisible: boolean;
  directSpreadsheetUrl: string | null;
  onSelectAllSheets: () => void;
  onToggleGoogleSheetView: () => void;
  onRequestAdminForNavigate: () => void;
  onNavigateSheetFallback: () => void;
  onSyncSheet: () => void;
  isSyncing: boolean;
  isConfigured: boolean;
}

export function Header({
  activeTab,
  isAdminUnlocked,
  isGoogleSheetVisible,
  directSpreadsheetUrl,
  onSelectAllSheets,
  onToggleGoogleSheetView,
  onRequestAdminForNavigate,
  onNavigateSheetFallback,
  onSyncSheet,
  isSyncing,
  isConfigured,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3.5 py-2.5 sm:flex-nowrap sm:gap-6 sm:px-6 sm:py-3 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-7">
          <button
            type="button"
            onClick={onSelectAllSheets}
            className="rounded text-left text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 sm:text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
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
              className={`relative rounded py-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 ${
                activeTab === 'workspace' && !isGoogleSheetVisible
                  ? 'font-semibold text-indigo-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Sheets</span>
              {activeTab === 'workspace' && !isGoogleSheetVisible && (
                <motion.span
                  layoutId="header-nav-underline"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-x-0 -bottom-[9px] sm:-bottom-[13px] h-0.5 bg-indigo-700"
                />
              )}
            </button>
          </nav>
        </div>

        {/* Sync button stays on top row on mobile */}
        <div className="flex items-center gap-2 sm:order-3 shrink-0">
          <button
            type="button"
            onClick={onSyncSheet}
            disabled={isSyncing || !isConfigured}
            title={
              isConfigured
                ? 'Reload all sheets from Google Spreadsheet'
                : 'Configure Google Apps Script URL first'
            }
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0 sm:min-h-[40px] sm:gap-2 sm:px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2"
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

        {/* Admin Show Sheet & Navigate Google Sheet buttons */}
        <div className="flex w-full items-center gap-2 border-t border-slate-100 pt-2 sm:order-2 sm:ml-auto sm:w-auto sm:border-t-0 sm:pt-0">
          <button
            type="button"
            onClick={onToggleGoogleSheetView}
            title={
              isAdminUnlocked
                ? isGoogleSheetVisible
                  ? 'Return to household cards'
                  : 'Show Google Sheet view (Admin unlocked)'
                : 'Admin / App Developer only — click to verify and show Google Sheet'
            }
            className={`inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap sm:min-h-[40px] sm:flex-initial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 ${
              isGoogleSheetVisible
                ? 'border-indigo-700 bg-indigo-50 text-indigo-900'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {isAdminUnlocked ? (
              <Table2 className="h-3.5 w-3.5 text-indigo-700" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-amber-700" />
            )}
            <span>{isGoogleSheetVisible ? 'Hide Sheet' : 'Show Google Sheet'}</span>
          </button>

          {!isAdminUnlocked ? (
            <button
              type="button"
              onClick={onRequestAdminForNavigate}
              title="Admin / App Developer only — click to verify and navigate to Google Sheet"
              className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap sm:min-h-[40px] sm:flex-initial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
            >
              <Lock className="h-3.5 w-3.5 text-amber-700" />
              <span>Navigate Sheet</span>
            </button>
          ) : directSpreadsheetUrl ? (
            <a
              href={directSpreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Navigate directly to the Google Sheet (Admin unlocked)"
              className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 whitespace-nowrap sm:min-h-[40px] sm:flex-initial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <ExternalLink className="h-3.5 w-3.5 text-emerald-700" />
              <span>Navigate Sheet</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={onNavigateSheetFallback}
              title="Connect Google Sheet URL to navigate"
              className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 whitespace-nowrap sm:min-h-[40px] sm:flex-initial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <ExternalLink className="h-3.5 w-3.5 text-emerald-700" />
              <span>Navigate Sheet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
