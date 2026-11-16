import { useEffect, type FormEvent } from 'react';
import { X, Save, RefreshCw, Eraser, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SHEET_COLUMN_LABELS,
  type CensusFormValues,
  type CensusRecord,
} from '../types/census';
import {
  getPlotColorTheme,
  type PlotColorTheme,
} from '../utils/plotColors';
import { ExistingRecordCard } from './ExistingRecordCard';

interface RecordEditorModalProps {
  isOpen: boolean;
  sheetName: string;
  formValues: CensusFormValues;
  matchedRecord: CensusRecord | null;
  plotColorMap?: Map<string, PlotColorTheme>;
  isSubmitting: boolean;
  onFieldChange: (field: keyof CensusFormValues, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onResetToNew: () => void;
  onClose: () => void;
}

export function RecordEditorModal({
  isOpen,
  sheetName,
  formValues,
  matchedRecord,
  plotColorMap,
  isSubmitting,
  onFieldChange,
  onSubmit,
  onResetToNew,
  onClose,
}: RecordEditorModalProps) {
  const isUpdateMode = matchedRecord !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-card-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span>{sheetName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{isUpdateMode ? 'Edit Household' : 'New Household'}</span>
                </div>
                <h2
                  id="editor-card-title"
                  className="mt-0.5 text-lg font-bold tracking-tight text-slate-900"
                >
                  {isUpdateMode ? 'Edit & Update Record' : 'Add New Record'}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close card"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {matchedRecord && (
              <ExistingRecordCard
                record={matchedRecord}
                plotTheme={getPlotColorTheme(
                  matchedRecord.plotNumber,
                  plotColorMap
                )}
              />
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="modal-headName"
                  className="block text-sm font-semibold text-slate-800"
                >
                  {SHEET_COLUMN_LABELS.headName.hi}
                  <span className="ml-1.5 text-xs font-normal text-slate-500">
                    ({SHEET_COLUMN_LABELS.headName.en})
                  </span>
                </label>
                <input
                  id="modal-headName"
                  type="text"
                  required
                  value={formValues.headName}
                  onChange={(e) => onFieldChange('headName', e.target.value)}
                  placeholder="e.g. SHASHIBALA"
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label
                    htmlFor="modal-mobileNumber"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    {SHEET_COLUMN_LABELS.mobileNumber.hi}
                    <span className="ml-1.5 text-xs font-normal text-slate-500">
                      ({SHEET_COLUMN_LABELS.mobileNumber.en})
                    </span>
                  </label>
                  <input
                    id="modal-mobileNumber"
                    type="tel"
                    inputMode="numeric"
                    required
                    value={formValues.mobileNumber}
                    onChange={(e) => onFieldChange('mobileNumber', e.target.value)}
                    placeholder="e.g. 9013007304"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-base text-slate-900 tabular-nums placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-totalMembers"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    {SHEET_COLUMN_LABELS.totalMembers.hi}
                    <span className="ml-1.5 text-xs font-normal text-slate-500">
                      ({SHEET_COLUMN_LABELS.totalMembers.en})
                    </span>
                  </label>
                  <input
                    id="modal-totalMembers"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={formValues.totalMembers}
                    onChange={(e) =>
                      onFieldChange('totalMembers', e.target.value.replace(/[^\d]/g, ''))
                    }
                    placeholder="e.g. 4"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-base text-slate-900 tabular-nums placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label
                    htmlFor="modal-buildingNumber"
                    className="flex items-center justify-between gap-1 text-sm font-semibold text-slate-800"
                  >
                    <span>{SHEET_COLUMN_LABELS.buildingNumber.hi}</span>
                    {isUpdateMode && (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-label="Not editable" />
                    )}
                  </label>
                  <span className="block text-xs font-normal text-slate-500">
                    {SHEET_COLUMN_LABELS.buildingNumber.en}
                  </span>
                  <input
                    id="modal-buildingNumber"
                    type="text"
                    readOnly={isUpdateMode}
                    disabled={isUpdateMode}
                    value={formValues.buildingNumber}
                    onChange={(e) =>
                      onFieldChange('buildingNumber', e.target.value)
                    }
                    placeholder="e.g. 3"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 font-mono text-base tabular-nums sm:text-sm ${
                      isUpdateMode
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-600'
                        : 'border-slate-300 bg-white text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-houseNumber"
                    className="flex items-center justify-between gap-1 text-sm font-semibold text-slate-800"
                  >
                    <span>{SHEET_COLUMN_LABELS.houseNumber.hi}</span>
                    {isUpdateMode && (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-label="Not editable" />
                    )}
                  </label>
                  <span className="block text-xs font-normal text-slate-500">
                    {SHEET_COLUMN_LABELS.houseNumber.en}
                  </span>
                  <input
                    id="modal-houseNumber"
                    type="text"
                    readOnly={isUpdateMode}
                    disabled={isUpdateMode}
                    value={formValues.houseNumber}
                    onChange={(e) => onFieldChange('houseNumber', e.target.value)}
                    placeholder="e.g. 0005"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 font-mono text-base tabular-nums sm:text-sm ${
                      isUpdateMode
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-600'
                        : 'border-slate-300 bg-white text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-familyNumber"
                    className="flex items-center justify-between gap-1 text-sm font-semibold text-slate-800"
                  >
                    <span>{SHEET_COLUMN_LABELS.familyNumber.hi}</span>
                    {isUpdateMode && (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-label="Not editable" />
                    )}
                  </label>
                  <span className="block text-xs font-normal text-slate-500">
                    {SHEET_COLUMN_LABELS.familyNumber.en}
                  </span>
                  <input
                    id="modal-familyNumber"
                    type="text"
                    readOnly={isUpdateMode}
                    disabled={isUpdateMode}
                    value={formValues.familyNumber}
                    onChange={(e) =>
                      onFieldChange('familyNumber', e.target.value)
                    }
                    placeholder="e.g. 002"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 font-mono text-base tabular-nums sm:text-sm ${
                      isUpdateMode
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-600'
                        : 'border-slate-300 bg-white text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-plotNumber"
                    className="flex items-center justify-between gap-1 text-sm font-semibold text-slate-800"
                  >
                    <span>{SHEET_COLUMN_LABELS.plotNumber.hi}</span>
                    {isUpdateMode && (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-label="Not editable" />
                    )}
                  </label>
                  <span className="block text-xs font-normal text-slate-500">
                    {SHEET_COLUMN_LABELS.plotNumber.en}
                  </span>
                  <input
                    id="modal-plotNumber"
                    type="text"
                    readOnly={isUpdateMode}
                    disabled={isUpdateMode}
                    value={formValues.plotNumber}
                    onChange={(e) => onFieldChange('plotNumber', e.target.value)}
                    placeholder="e.g. 459"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 font-mono text-base tabular-nums sm:text-sm ${
                      isUpdateMode
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-600'
                        : 'border-slate-300 bg-white text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="modal-seId"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    {SHEET_COLUMN_LABELS.seId.hi}
                    <span className="ml-1.5 text-xs font-normal text-slate-500">
                      ({SHEET_COLUMN_LABELS.seId.en})
                    </span>
                  </label>
                  <span className="font-mono text-[11px] font-medium text-slate-500 tabular-nums">
                    {formValues.seId.trim().startsWith('P')
                      ? `${Math.max(0, formValues.seId.trim().length - 1)}/11 digits`
                      : 'Optional · P + 11 digits'}
                  </span>
                </div>
                <input
                  id="modal-seId"
                  type="text"
                  maxLength={12}
                  pattern="^P[0-9]{11}$"
                  title='Optional. If provided, must start with "P" followed by exactly 11 digits (e.g. P12345678901)'
                  value={formValues.seId}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .toUpperCase()
                      .replace(/\s+/g, '');
                    onFieldChange('seId', cleaned);
                  }}
                  placeholder="e.g. P12345678901"
                  className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 font-mono text-base text-slate-900 tabular-nums placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 sm:text-sm ${
                    formValues.seId.trim().length === 0
                      ? 'border-slate-300 focus:border-indigo-700 focus:ring-indigo-700/20'
                      : /^P\d{11}$/.test(formValues.seId.trim())
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600/20'
                      : 'border-red-400 focus:border-red-600 focus:ring-red-600/20'
                  }`}
                />
                {formValues.seId.trim().length > 0 &&
                  !/^P\d{11}$/.test(formValues.seId.trim()) && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      SE ID must start with "P" followed by exactly 11 digits (e.g. P12345678901).
                    </p>
                  )}
                {/^P\d{11}$/.test(formValues.seId.trim()) && (
                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    Valid SE ID format (P + 11 digits).
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={onResetToNew}
                  disabled={isSubmitting}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
                >
                  <Eraser className="h-4 w-4" />
                  <span>Reset</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isUpdateMode
                      ? 'bg-emerald-700 hover:bg-emerald-800 focus-visible:ring-emerald-700'
                      : 'bg-indigo-700 hover:bg-indigo-800 focus-visible:ring-indigo-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>{isUpdateMode ? 'Updating...' : 'Saving...'}</span>
                    </>
                  ) : isUpdateMode ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Update Data</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Submit Data</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
