import { FileCheck2, RotateCcw, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { SHEET_COLUMN_LABELS, type CensusRecord } from '../types/census';
import { getPlotColorTheme, type PlotColorTheme } from '../utils/plotColors';

interface ExistingRecordCardProps {
  record: CensusRecord;
  plotTheme?: PlotColorTheme;
  onClearSelection: () => void;
}

export function ExistingRecordCard({
  record,
  plotTheme,
  onClearSelection,
}: ExistingRecordCardProps) {
  const hasSeId = record.seId.trim().length > 0;
  const resolvedPlotTheme = plotTheme ?? getPlotColorTheme(record.plotNumber);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`-mx-5 mb-5 border-y px-5 py-4 sm:-mx-6 sm:px-6 ${resolvedPlotTheme.cardClass}`}
    >
      <div className={`flex flex-wrap items-start justify-between gap-3 border-b pb-3 ${resolvedPlotTheme.dividerClass}`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <FileCheck2 className="h-3.5 w-3.5 text-slate-700" />
            <span>Existing Data Found in Sheet</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Row #{record.rowIndex}</span>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900">
            {record.headName || 'Unnamed Household'}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClearSelection}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>New Entry</span>
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-slate-500">{SHEET_COLUMN_LABELS.mobileNumber.hi}</dt>
          <dd className="mt-0.5 font-mono font-medium text-slate-900 tabular-nums">
            {record.mobileNumber || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{SHEET_COLUMN_LABELS.buildingNumber.hi}</dt>
          <dd className="mt-0.5 font-mono font-medium text-slate-900 tabular-nums">
            {record.buildingNumber || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{SHEET_COLUMN_LABELS.houseNumber.hi}</dt>
          <dd className="mt-0.5 font-mono font-medium text-slate-900 tabular-nums">
            {record.houseNumber || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{SHEET_COLUMN_LABELS.familyNumber.hi}</dt>
          <dd className="mt-0.5 font-mono font-medium text-slate-900 tabular-nums">
            {record.familyNumber || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{SHEET_COLUMN_LABELS.plotNumber.hi}</dt>
          <dd
            className={`mt-0.5 inline-flex items-center gap-1.5 font-mono font-bold tabular-nums ${resolvedPlotTheme.plotTextClass}`}
          >
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-[2px] ${resolvedPlotTheme.swatchClass}`}
            />
            <span>{record.plotNumber || '—'}</span>
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">SE ID (2nd Phase)</dt>
          <dd className="mt-0.5 font-mono font-semibold tabular-nums">
            {hasSeId ? (
              <span className="text-emerald-700">{record.seId}</span>
            ) : (
              <span className="inline-flex items-center gap-1 font-sans font-medium text-amber-800">
                <Clock className="h-3 w-3" />
                Pending
              </span>
            )}
          </dd>
        </div>
      </dl>
    </motion.div>
  );
}
