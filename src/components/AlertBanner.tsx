import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { AlertState } from '../types/census';

interface AlertBannerProps {
  alert: AlertState | null;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 6500;

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!alert || isPaused || alert.type === 'error') return;
    const timer = window.setTimeout(() => {
      onDismiss();
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [alert, isPaused, onDismiss]);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-3.5 pt-2 sm:inset-x-auto sm:right-6 sm:top-20 sm:justify-end sm:px-0"
    >
      <AnimatePresence mode="wait">
        {alert && (
          <motion.div
            key={alert.id}
            role="alert"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto relative w-full max-w-md overflow-hidden rounded-xl border shadow-lg backdrop-blur-md ${
              alert.type === 'error'
                ? 'border-red-200 bg-red-50/95 text-red-950'
                : alert.type === 'updated'
                ? 'border-emerald-200 bg-white/95 text-slate-900'
                : 'border-indigo-200 bg-white/95 text-slate-900'
            }`}
          >
            <div className="flex items-start gap-3.5 p-4">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  alert.type === 'error'
                    ? 'bg-red-100 text-red-700'
                    : alert.type === 'updated'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {alert.type === 'error' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : alert.type === 'updated' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold leading-snug">
                    {alert.title}
                  </h3>
                  <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss notification"
                    className="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  {alert.message}
                </p>

                {alert.record && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {alert.record.headName || 'Unnamed'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {alert.record.mobileNumber || '—'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Row #{alert.record.rowIndex}
                    </span>
                    {alert.record.totalMembers && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Members: {alert.record.totalMembers}
                        </span>
                      </>
                    )}
                    {alert.record.seId && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                          SE ID: {alert.record.seId}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {alert.type !== 'error' && !isPaused && (
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{
                  duration: AUTO_DISMISS_MS / 1000,
                  ease: 'linear',
                }}
                style={{ transformOrigin: 'left' }}
                className={`h-1 w-full ${
                  alert.type === 'updated' ? 'bg-emerald-600' : 'bg-indigo-700'
                }`}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
