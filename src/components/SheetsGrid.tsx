import { useMemo, useState } from 'react';
import {
  FileSpreadsheet,
  ArrowUpRight,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { SheetData } from '../types/census';

interface SheetsGridProps {
  sheets: SheetData[];
  isLoading: boolean;
  isConfigured: boolean;
  onSelectSheet: (sheetName: string) => void;
  onOpenSetup: () => void;
}

export function SheetsGrid({
  sheets,
  isLoading,
  isConfigured,
  onSelectSheet,
  onOpenSetup,
}: SheetsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const totals = useMemo(() => {
    let households = 0;
    let filled = 0;
    for (const sheet of sheets) {
      households += sheet.records.length;
      filled += sheet.records.filter((r) => r.seId.trim().length > 0).length;
    }
    return {
      sheetCount: sheets.length,
      households,
      filled,
      pending: households - filled,
    };
  }, [sheets]);

  const filteredSheets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sheets;
    return sheets.filter((s) => s.sheetName.toLowerCase().includes(q));
  }, [sheets, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Overview Stat Cards across all sheets */}
      <section
        aria-label="Spreadsheet Overview"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Total Sheets
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Layers className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-1">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums sm:text-3xl">
              {totals.sheetCount}
            </span>
            <span className="text-[11px] text-slate-500 sm:text-xs">
              Workbook tabs
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Total Households
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Users className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-1">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums sm:text-3xl">
              {totals.households}
            </span>
            <span className="text-[11px] text-slate-500 sm:text-xs">
              कुल परिवार
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              SE ID Filled
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-1">
            <span className="font-mono text-2xl font-bold text-emerald-700 tabular-nums sm:text-3xl">
              {totals.filled}
            </span>
            <span className="font-mono text-[11px] font-medium text-slate-500 tabular-nums sm:text-xs">
              {totals.households > 0
                ? `${Math.round((totals.filled / totals.households) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              SE ID Pending
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-1">
            <span className="font-mono text-2xl font-bold text-amber-700 tabular-nums sm:text-3xl">
              {totals.pending}
            </span>
            <span className="text-[11px] text-slate-500 sm:text-xs">
              Remaining
            </span>
          </div>
        </div>
      </section>

      {/* Heading & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl text-balance">
            All Google Sheets
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Select any sheet card to inspect household records, edit details, or add new entries.
          </p>
        </div>

        {sheets.length > 1 && (
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter sheets by name..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20 sm:py-2 sm:text-sm"
            />
          </div>
        )}
      </div>

      {/* Sheet Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white p-6"
            />
          ))}
        </div>
      ) : filteredSheets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <FileSpreadsheet className="mx-auto h-9 w-9 text-slate-400" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">
            {isConfigured
              ? 'No matching sheets found'
              : 'Google Apps Script URL not connected'}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
            {isConfigured
              ? 'Try clearing your filter or click Sync Sheets in the top bar.'
              : 'Add your deployed Google Apps Script URL in src/config/appsScriptConfig.ts to load all sheets from your spreadsheet.'}
          </p>
          {!isConfigured && (
            <button
              type="button"
              onClick={onOpenSetup}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800"
            >
              Open Setup Guide
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSheets.map((sheet, index) => {
            const total = sheet.records.length;
            const filled = sheet.records.filter(
              (r) => r.seId.trim().length > 0
            ).length;
            const pending = total - filled;
            const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

            return (
              <motion.button
                key={sheet.sheetName}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(index * 0.04, 0.24),
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectSheet(sheet.sheetName)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.03)] transition-colors hover:border-indigo-300 hover:shadow-[0_6px_18px_rgba(55,48,163,0.08)] sm:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
              >
                <div className="w-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-900">
                          {sheet.sheetName}
                        </h2>
                        <p className="text-xs text-slate-500">
                          Open household cards
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-700" />
                  </div>

                  <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-xs">
                    <div>
                      <dt className="text-slate-500">Records</dt>
                      <dd className="mt-0.5 font-mono text-lg font-bold text-slate-900 tabular-nums">
                        {total}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Filled</dt>
                      <dd className="mt-0.5 font-mono text-lg font-bold text-emerald-700 tabular-nums">
                        {filled}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Pending</dt>
                      <dd className="mt-0.5 font-mono text-lg font-bold text-amber-700 tabular-nums">
                        {pending}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4 w-full border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>SE ID Completion</span>
                    <span className="font-mono font-semibold text-slate-700 tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: pct / 100 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transformOrigin: 'left' }}
                      className="h-full w-full rounded-full bg-emerald-600"
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
