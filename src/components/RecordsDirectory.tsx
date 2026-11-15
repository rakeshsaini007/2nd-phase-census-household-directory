import { useMemo, useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Database,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { CensusRecord } from '../types/census';
import {
  buildPlotColorMap,
  getPlotColorTheme,
} from '../utils/plotColors';
import {
  DashboardStatsCards,
  type StatsFilterMode,
} from './DashboardStatsCards';

interface RecordsDirectoryProps {
  sheetName: string;
  records: CensusRecord[];
  selectedRowIndex: number | null;
  filterMode: StatsFilterMode;
  onFilterChange: (mode: StatsFilterMode) => void;
  isLoading: boolean;
  onBackToSheets: () => void;
  onSelectRecord: (record: CensusRecord) => void;
  onAddNewRecord: () => void;
}

function getContactLinks(mobileNumber: string) {
  const digits = mobileNumber.replace(/\D/g, '');
  if (!digits) {
    return { hasPhone: false, telHref: '', whatsappHref: '' };
  }
  const waDigits = digits.length === 10 ? `91${digits}` : digits;
  return {
    hasPhone: true,
    telHref: `tel:${digits}`,
    whatsappHref: `https://wa.me/${waDigits}`,
  };
}

export function RecordsDirectory({
  sheetName,
  records,
  selectedRowIndex,
  filterMode,
  onFilterChange,
  isLoading,
  onBackToSheets,
  onSelectRecord,
  onAddNewRecord,
}: RecordsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const plotColorMap = useMemo(() => buildPlotColorMap(records), [records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((record) => {
      const hasSeId = record.seId.trim().length > 0;
      if (filterMode === 'completed' && !hasSeId) return false;
      if (filterMode === 'pending' && hasSeId) return false;

      if (!q) return true;
      return (
        record.headName.toLowerCase().includes(q) ||
        record.mobileNumber.toLowerCase().includes(q) ||
        record.buildingNumber.toLowerCase().includes(q) ||
        record.houseNumber.toLowerCase().includes(q) ||
        record.familyNumber.toLowerCase().includes(q) ||
        record.plotNumber.toLowerCase().includes(q) ||
        record.seId.toLowerCase().includes(q)
      );
    });
  }, [records, searchQuery, filterMode]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Sheet Header & Add Data Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBackToSheets}
            className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 rounded"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Sheets</span>
          </button>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl text-balance">
            {sheetName}
          </h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Tap any household card to edit & update, or add a new record to this sheet.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.14 }}
          onClick={onAddNewRecord}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800 sm:w-auto whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Data</span>
        </motion.button>
      </div>

      {/* 4 Overview Cards for Active Sheet */}
      <DashboardStatsCards
        records={records}
        activeFilter={filterMode}
        onSelectFilter={onFilterChange}
      />

      {/* Search & Segmented Filter Toolbar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, mobile, building, house, family, plot, or SE ID..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20 sm:py-2 sm:text-sm"
            />
          </div>

          <div
            role="group"
            aria-label="Filter by SE ID status"
            className="grid grid-cols-3 rounded-lg bg-slate-100 p-1 md:inline-flex"
          >
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'completed', label: 'Filled' },
              ] as const
            ).map((tab) => {
              const active = filterMode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onFilterChange(tab.key)}
                  className={`relative rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 sm:py-1.5 ${
                    active
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="records-filter-pill"
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 rounded-md bg-white shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Responsive Card Grid: 1 col phone, 2 col tablet, 3 col desktop */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white p-5"
            />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Database className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-sm font-semibold text-slate-900">
            No household records in "{sheetName}" yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
            Tap the button below to add the first household record to this sheet.
          </p>
          <button
            type="button"
            onClick={onAddNewRecord}
            className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-indigo-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-800 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add First Record</span>
          </button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            No matching households found.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onFilterChange('all');
            }}
            className="mt-3 text-xs font-semibold text-indigo-700 hover:underline"
          >
            Clear search & filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Quick Add New Record Card */}
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={onAddNewRecord}
            className="flex min-h-[168px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/80 p-5 text-center transition-colors hover:border-indigo-600 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700">
              <Plus className="h-5 w-5" />
            </div>
            <span className="mt-3 text-sm font-bold text-slate-900">
              Add New Household
            </span>
            <span className="mt-0.5 text-xs text-slate-500">
              Add a row to {sheetName}
            </span>
          </motion.button>

          {filteredRecords.map((record, index) => {
            const isSelected = selectedRowIndex === record.rowIndex;
            const hasSeId = record.seId.trim().length > 0;
            const plotTheme = getPlotColorTheme(record.plotNumber, plotColorMap);
            const { hasPhone, telHref, whatsappHref } = getContactLinks(
              record.mobileNumber
            );

            return (
              <motion.div
                key={`${sheetName}-${record.rowIndex}-${record.mobileNumber}`}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.18,
                  delay: Math.min(index * 0.025, 0.2),
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -2 }}
                onClick={() => onSelectRecord(record)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectRecord(record);
                  }
                }}
                className={`group flex cursor-pointer flex-col justify-between rounded-xl border p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_10px_rgba(15,23,42,0.02)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 ${
                  isSelected
                    ? `${plotTheme.cardClass} ring-2 ring-indigo-700`
                    : `${plotTheme.cardClass} hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)]`
                }`}
              >
                <div className="w-full">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {record.headName || 'Unnamed Household'}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900" />
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-700">
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {record.mobileNumber || 'No Mobile'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Row #{record.rowIndex}
                    </span>
                  </div>

                  <dl
                    className={`mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t pt-3 text-xs sm:grid-cols-4 ${plotTheme.dividerClass}`}
                  >
                    <div>
                      <dt className="text-[11px] font-medium text-slate-600">भवन नं.</dt>
                      <dd className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                        {record.buildingNumber || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium text-slate-600">मकान नं.</dt>
                      <dd className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                        {record.houseNumber || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium text-slate-600">परिवार क्र.</dt>
                      <dd className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                        {record.familyNumber || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium text-slate-600">प्लॉट नं.</dt>
                      <dd
                        className={`mt-0.5 inline-flex items-center gap-1.5 font-mono font-bold tabular-nums ${plotTheme.plotTextClass}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${plotTheme.swatchClass}`}
                        />
                        <span>{record.plotNumber || '—'}</span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4 w-full space-y-3">
                  <div
                    className={`flex w-full items-center justify-between gap-2 border-t pt-3 text-xs ${plotTheme.dividerClass}`}
                  >
                    <span className="font-medium text-slate-700">SE ID 2nd Phase</span>
                    {hasSeId ? (
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 tabular-nums">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[140px]">{record.seId}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-900">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>Pending · Tap to edit</span>
                      </span>
                    )}
                  </div>

                  <div
                    className={`grid grid-cols-2 gap-2 border-t pt-3 ${plotTheme.dividerClass}`}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {hasPhone ? (
                      <>
                        <a
                          href={telHref}
                          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-300/90 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-900 shadow-2xs transition-colors hover:bg-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
                        >
                          <Phone className="h-3.5 w-3.5 text-indigo-700" />
                          <span>Call</span>
                        </a>
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-800 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    ) : (
                      <>
                        <span
                          aria-disabled="true"
                          className="inline-flex min-h-[40px] cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>Call</span>
                        </span>
                        <span
                          aria-disabled="true"
                          className="inline-flex min-h-[40px] cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-slate-200/70 px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
