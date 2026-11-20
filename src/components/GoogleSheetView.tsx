import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  Lock,
  Search,
  CheckCircle2,
  Clock,
  Pencil,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  SHEET_COLUMN_LABELS,
  type CensusRecord,
  type SheetData,
} from '../types/census';
import { buildPlotColorMap, getPlotColorTheme } from '../utils/plotColors';

interface GoogleSheetViewProps {
  sheets: SheetData[];
  activeSheet: SheetData;
  spreadsheetUrl: string | null;
  onSelectSheet: (sheetName: string) => void;
  onSelectRecord: (record: CensusRecord) => void;
  onBackToCards: () => void;
  onLockAdmin: () => void;
  onRequestSheetUrl: () => void;
}

const COLUMN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

export function buildActiveSpreadsheetUrl(
  baseUrl: string | null,
  sheetId?: number
): string | null {
  if (!baseUrl || !baseUrl.trim()) return null;
  const cleanBase = baseUrl.split('#')[0].trim();
  if (sheetId !== undefined && sheetId !== null) {
    return `${cleanBase}#gid=${sheetId}`;
  }
  return cleanBase;
}

export function GoogleSheetView({
  sheets,
  activeSheet,
  spreadsheetUrl,
  onSelectSheet,
  onSelectRecord,
  onBackToCards,
  onLockAdmin,
  onRequestSheetUrl,
}: GoogleSheetViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const activeIndex = sheets.findIndex(
    (s) => s.sheetName === activeSheet.sheetName
  );
  const prevSheet = activeIndex > 0 ? sheets[activeIndex - 1] : null;
  const nextSheet =
    activeIndex >= 0 && activeIndex < sheets.length - 1
      ? sheets[activeIndex + 1]
      : null;

  const plotColorMap = useMemo(
    () => buildPlotColorMap(activeSheet.records),
    [activeSheet.records]
  );

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeSheet.records;
    return activeSheet.records.filter(
      (r) =>
        r.headName.toLowerCase().includes(q) ||
        r.mobileNumber.toLowerCase().includes(q) ||
        r.buildingNumber.toLowerCase().includes(q) ||
        r.houseNumber.toLowerCase().includes(q) ||
        r.familyNumber.toLowerCase().includes(q) ||
        r.plotNumber.toLowerCase().includes(q) ||
        r.totalMembers.toLowerCase().includes(q) ||
        r.seId.toLowerCase().includes(q)
    );
  }, [activeSheet.records, searchQuery]);

  const directSheetUrl = buildActiveSpreadsheetUrl(
    spreadsheetUrl,
    activeSheet.sheetId
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {/* Admin Sheet Header Toolbar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-emerald-800">
                <span>Admin Developer View</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {activeSheet.records.length} rows
                </span>
                <span aria-hidden="true">·</span>
                <span>Columns A–H</span>
              </div>
              <h1 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Google Sheet: {activeSheet.sheetName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBackToCards}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Cards View</span>
            </button>

            {directSheetUrl ? (
              <a
                href={directSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Navigate to Google Sheet</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={onRequestSheetUrl}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Navigate to Google Sheet</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLockAdmin}
              title="Lock Admin View"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Sheet Navigation Tabs + Search */}
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => prevSheet && onSelectSheet(prevSheet.sheetName)}
              disabled={!prevSheet}
              aria-label="Previous sheet tab"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {sheets.map((sheet) => {
                const isActive = sheet.sheetName === activeSheet.sheetName;
                return (
                  <button
                    key={sheet.sheetName}
                    type="button"
                    onClick={() => onSelectSheet(sheet.sheetName)}
                    className={`min-h-[36px] shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-emerald-700 bg-emerald-700 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {sheet.sheetName}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => nextSheet && onSelectSheet(nextSheet.sheetName)}
              disabled={!nextSheet}
              aria-label="Next sheet tab"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter rows in sheet..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              {/* Column Letters Row */}
              <tr className="border-b border-slate-200 bg-slate-100 text-[11px] font-semibold text-slate-500">
                <th className="sticky left-0 z-20 w-12 border-r border-slate-200 bg-slate-100 px-2.5 py-1.5 text-center font-mono">
                  Row
                </th>
                {COLUMN_LETTERS.map((letter) => (
                  <th
                    key={letter}
                    className="border-r border-slate-200 px-3 py-1.5 text-center font-mono"
                  >
                    {letter}
                  </th>
                ))}
                <th className="px-3 py-1.5 text-center font-mono">Edit</th>
              </tr>

              {/* Sheet Column Headers Row */}
              <tr className="border-b-2 border-slate-300 bg-slate-50 text-xs font-bold text-slate-800">
                <th className="sticky left-0 z-20 border-r border-slate-200 bg-slate-50 px-2.5 py-2.5 text-center font-mono text-slate-500">
                  1
                </th>
                <th className="min-w-[170px] border-r border-slate-200 px-3 py-2.5">
                  {SHEET_COLUMN_LABELS.headName.hi}
                </th>
                <th className="min-w-[120px] border-r border-slate-200 px-3 py-2.5">
                  {SHEET_COLUMN_LABELS.mobileNumber.hi}
                </th>
                <th className="min-w-[100px] border-r border-slate-200 px-3 py-2.5">
                  {SHEET_COLUMN_LABELS.buildingNumber.hi}
                </th>
                <th className="min-w-[100px] border-r border-slate-200 px-3 py-2.5">
                  {SHEET_COLUMN_LABELS.houseNumber.hi}
                </th>
                <th className="min-w-[95px] border-r border-slate-200 px-3 py-2.5">
                  {SHEET_COLUMN_LABELS.familyNumber.hi}
                </th>
                <th className="min-w-[95px] border-r border-slate-200 px-3 py-2.5">
                  {SHEET_COLUMN_LABELS.plotNumber.hi}
                </th>
                <th className="min-w-[160px] border-r border-slate-200 px-3 py-2.5">
                  {SHEET_COLUMN_LABELS.seId.hi}
                </th>
                <th className="min-w-[120px] border-r border-slate-200 px-3 py-2.5">
                  {SHEET_COLUMN_LABELS.totalMembers.en}
                </th>
                <th className="w-16 px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No matching rows found in "{activeSheet.sheetName}".
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const plotTheme = getPlotColorTheme(
                    record.plotNumber,
                    plotColorMap
                  );
                  const hasSeId = record.seId.trim().length > 0;

                  return (
                    <tr
                      key={`${activeSheet.sheetName}-${record.rowIndex}`}
                      onClick={() => onSelectRecord(record)}
                      className="cursor-pointer transition-colors hover:bg-indigo-50/50"
                    >
                      <td className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-2.5 py-2.5 text-center font-mono font-semibold text-slate-500 tabular-nums">
                        {record.rowIndex}
                      </td>
                      <td className="border-r border-slate-200 px-3 py-2.5 font-semibold text-slate-900">
                        {record.headName || '—'}
                      </td>
                      <td className="border-r border-slate-200 px-3 py-2.5 font-mono text-slate-800 tabular-nums">
                        {record.mobileNumber || '—'}
                      </td>
                      <td className="border-r border-slate-200 px-3 py-2.5 font-mono text-slate-800 tabular-nums">
                        {record.buildingNumber || '—'}
                      </td>
                      <td className="border-r border-slate-200 px-3 py-2.5 font-mono text-slate-800 tabular-nums">
                        {record.houseNumber || '—'}
                      </td>
                      <td className="border-r border-slate-200 px-3 py-2.5 font-mono text-slate-800 tabular-nums">
                        {record.familyNumber || '—'}
                      </td>
                      <td className="border-r border-slate-200 px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 font-mono font-bold tabular-nums ${plotTheme.plotTextClass}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-2 w-2 shrink-0 rounded-[2px] ${plotTheme.swatchClass}`}
                          />
                          <span>{record.plotNumber || '—'}</span>
                        </span>
                      </td>
                      <td className="border-r border-slate-200 px-3 py-2.5 font-mono tabular-nums">
                        {hasSeId ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>{record.seId}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-sans text-amber-700">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="border-r border-slate-200 px-3 py-2.5 font-mono font-semibold text-slate-900 tabular-nums">
                        {record.totalMembers || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecord(record);
                          }}
                          aria-label={`Edit row ${record.rowIndex}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
