import { Home, CheckCircle2, Clock, Users } from 'lucide-react';
import { motion } from 'motion/react';
import type { CensusRecord } from '../types/census';

export type StatsFilterMode = 'all' | 'pending' | 'completed';

interface DashboardStatsCardsProps {
  records: CensusRecord[];
  activeFilter: StatsFilterMode;
  onSelectFilter: (filter: StatsFilterMode) => void;
}

export function DashboardStatsCards({
  records,
  activeFilter,
  onSelectFilter,
}: DashboardStatsCardsProps) {
  const total = records.length;
  const completed = records.filter((r) => r.seId.trim().length > 0).length;
  const pending = total - completed;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const uniqueBuildings = new Set(
    records.map((r) => r.buildingNumber.trim()).filter(Boolean)
  ).size;
  const uniquePlots = new Set(
    records.map((r) => r.plotNumber.trim()).filter(Boolean)
  ).size;
  const totalMembersCount = records.reduce(
    (sum, r) => sum + (parseInt(r.totalMembers.trim(), 10) || 0),
    0
  );

  return (
    <section
      aria-label="Dashboard Overview Cards"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => onSelectFilter('all')}
        className={`flex flex-col justify-between rounded-xl border bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 ${
          activeFilter === 'all'
            ? 'border-indigo-600 ring-1 ring-indigo-600'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Total Households
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Home className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-1">
          <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums sm:text-3xl">
            {total}
          </span>
          <span className="text-[11px] text-slate-500 sm:text-xs">कुल परिवार</span>
        </div>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => onSelectFilter('completed')}
        className={`flex flex-col justify-between rounded-xl border bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 ${
          activeFilter === 'completed'
            ? 'border-emerald-600 ring-1 ring-emerald-600'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">
            SE ID Filled
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-1">
          <span className="font-mono text-2xl font-bold text-emerald-700 tabular-nums sm:text-3xl">
            {completed}
          </span>
          <span className="font-mono text-[11px] font-medium text-slate-500 tabular-nums sm:text-xs">
            {completionPct}% done
          </span>
        </div>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => onSelectFilter('pending')}
        className={`flex flex-col justify-between rounded-xl border bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 ${
          activeFilter === 'pending'
            ? 'border-amber-600 ring-1 ring-amber-600'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">
            SE ID Pending
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Clock className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-1">
          <span className="font-mono text-2xl font-bold text-amber-700 tabular-nums sm:text-3xl">
            {pending}
          </span>
          <span className="text-[11px] text-slate-500 sm:text-xs">To fill</span>
        </div>
      </motion.button>

      <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Total Members
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <Users className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-1">
          <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums sm:text-3xl">
            {totalMembersCount}
          </span>
          <span className="font-mono text-[11px] text-slate-500 tabular-nums sm:text-xs">
            {uniqueBuildings} bldgs · {uniquePlots} plots
          </span>
        </div>
      </div>
    </section>
  );
}
