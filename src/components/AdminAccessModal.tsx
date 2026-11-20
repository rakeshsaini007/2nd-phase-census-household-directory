import { useEffect, useState, type FormEvent } from 'react';
import { ShieldCheck, X, KeyRound, RefreshCw, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AdminAccessModalProps {
  isOpen: boolean;
  isVerifying: boolean;
  errorMessage: string | null;
  onVerify: (adminKey: string) => void;
  onClose: () => void;
}

export function AdminAccessModal({
  isOpen,
  isVerifying,
  errorMessage,
  onVerify,
  onClose,
}: AdminAccessModalProps) {
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setAdminKey('');
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isVerifying) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isVerifying, onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onVerify(adminKey);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => {
              if (!isVerifying) onClose();
            }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Developer Access Required
                  </p>
                  <h2
                    id="admin-modal-title"
                    className="mt-0.5 text-base font-bold tracking-tight text-slate-900 sm:text-lg"
                  >
                    Admin / App Developer Only
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isVerifying}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              Viewing the Google Sheet is restricted to the Admin (App Developer). Enter your developer access key to unlock the sheet view.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="admin-access-key"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Admin / Developer Access Key
                </label>
                <div className="relative mt-1.5">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-access-key"
                    type="password"
                    autoFocus
                    required
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter developer key"
                    className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3.5 font-mono text-base text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20 sm:text-sm"
                  />
                </div>
                {errorMessage && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errorMessage}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isVerifying}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || adminKey.trim().length === 0}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Unlock Google Sheet</span>
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

interface SheetUrlModalProps {
  isOpen: boolean;
  initialUrl: string;
  onSaveUrl: (url: string) => void;
  onClose: () => void;
}

export function SheetUrlModal({
  isOpen,
  initialUrl,
  onSaveUrl,
  onClose,
}: SheetUrlModalProps) {
  const [urlValue, setUrlValue] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrlValue(initialUrl);
      setError(null);
    }
  }, [isOpen, initialUrl]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = urlValue.trim();
    if (
      !trimmed.startsWith('https://docs.google.com/spreadsheets/')
    ) {
      setError(
        'Enter a valid Google Sheets URL starting with https://docs.google.com/spreadsheets/'
      );
      return;
    }
    onSaveUrl(trimmed);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-url-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Google Sheet Navigation Link
                </p>
                <h2
                  id="sheet-url-modal-title"
                  className="mt-0.5 text-base font-bold tracking-tight text-slate-900 sm:text-lg"
                >
                  Connect Google Sheet URL
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              Re-deploy <code className="font-mono text-slate-800">code.js</code> to auto-detect your Google Sheet URL, or paste your Google Spreadsheet URL below to enable direct navigation.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="google-sheet-url-input"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Google Spreadsheet URL
                </label>
                <input
                  id="google-sheet-url-input"
                  type="url"
                  required
                  value={urlValue}
                  onChange={(e) => {
                    setUrlValue(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-base text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700/20 sm:text-sm"
                />
                {error && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Save & Open Google Sheet</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
