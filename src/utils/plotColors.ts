import type { CensusRecord } from '../types/census';

export interface PlotColorTheme {
  cardClass: string;
  dividerClass: string;
  plotTextClass: string;
  swatchClass: string;
}

export const NEUTRAL_PLOT_THEME: PlotColorTheme = {
  cardClass: 'border-slate-300 bg-slate-100/90 hover:border-slate-400',
  dividerClass: 'border-slate-200',
  plotTextClass: 'text-slate-900',
  swatchClass: 'bg-slate-500',
};

const PLOT_COLOR_PALETTE: PlotColorTheme[] = [
  {
    cardClass: 'border-indigo-300 bg-indigo-100/80 hover:border-indigo-500',
    dividerClass: 'border-indigo-200',
    plotTextClass: 'text-indigo-900',
    swatchClass: 'bg-indigo-600',
  },
  {
    cardClass: 'border-teal-300 bg-teal-100/80 hover:border-teal-500',
    dividerClass: 'border-teal-200',
    plotTextClass: 'text-teal-900',
    swatchClass: 'bg-teal-600',
  },
  {
    cardClass: 'border-amber-300 bg-amber-100/85 hover:border-amber-500',
    dividerClass: 'border-amber-200',
    plotTextClass: 'text-amber-950',
    swatchClass: 'bg-amber-600',
  },
  {
    cardClass: 'border-rose-300 bg-rose-100/80 hover:border-rose-500',
    dividerClass: 'border-rose-200',
    plotTextClass: 'text-rose-900',
    swatchClass: 'bg-rose-600',
  },
  {
    cardClass: 'border-sky-300 bg-sky-100/80 hover:border-sky-500',
    dividerClass: 'border-sky-200',
    plotTextClass: 'text-sky-900',
    swatchClass: 'bg-sky-600',
  },
  {
    cardClass: 'border-violet-300 bg-violet-100/80 hover:border-violet-500',
    dividerClass: 'border-violet-200',
    plotTextClass: 'text-violet-900',
    swatchClass: 'bg-violet-600',
  },
  {
    cardClass: 'border-emerald-300 bg-emerald-100/80 hover:border-emerald-500',
    dividerClass: 'border-emerald-200',
    plotTextClass: 'text-emerald-900',
    swatchClass: 'bg-emerald-600',
  },
  {
    cardClass: 'border-orange-300 bg-orange-100/80 hover:border-orange-500',
    dividerClass: 'border-orange-200',
    plotTextClass: 'text-orange-950',
    swatchClass: 'bg-orange-600',
  },
  {
    cardClass: 'border-cyan-300 bg-cyan-100/80 hover:border-cyan-500',
    dividerClass: 'border-cyan-200',
    plotTextClass: 'text-cyan-900',
    swatchClass: 'bg-cyan-600',
  },
  {
    cardClass: 'border-fuchsia-300 bg-fuchsia-100/80 hover:border-fuchsia-500',
    dividerClass: 'border-fuchsia-200',
    plotTextClass: 'text-fuchsia-900',
    swatchClass: 'bg-fuchsia-600',
  },
  {
    cardClass: 'border-lime-400/80 bg-lime-100/85 hover:border-lime-600',
    dividerClass: 'border-lime-300/70',
    plotTextClass: 'text-lime-950',
    swatchClass: 'bg-lime-600',
  },
  {
    cardClass: 'border-blue-300 bg-blue-100/80 hover:border-blue-500',
    dividerClass: 'border-blue-200',
    plotTextClass: 'text-blue-900',
    swatchClass: 'bg-blue-600',
  },
];

export function normalizePlotKey(plotNumber: string): string {
  return plotNumber.trim().toLowerCase();
}

export function buildPlotColorMap(
  records: CensusRecord[]
): Map<string, PlotColorTheme> {
  const map = new Map<string, PlotColorTheme>();
  let nextColorIndex = 0;

  for (const record of records) {
    const key = normalizePlotKey(record.plotNumber);
    if (!key || map.has(key)) continue;
    map.set(
      key,
      PLOT_COLOR_PALETTE[nextColorIndex % PLOT_COLOR_PALETTE.length]
    );
    nextColorIndex += 1;
  }

  return map;
}

export function getPlotColorTheme(
  plotNumber: string,
  plotColorMap?: Map<string, PlotColorTheme>
): PlotColorTheme {
  const key = normalizePlotKey(plotNumber);
  if (!key) return NEUTRAL_PLOT_THEME;

  if (plotColorMap) {
    const mapped = plotColorMap.get(key);
    if (mapped) return mapped;
  }

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PLOT_COLOR_PALETTE[hash % PLOT_COLOR_PALETTE.length];
}
