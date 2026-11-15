import { useState } from 'react';
import { Check, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_URL } from '../config/appsScriptConfig';
import { isAppsScriptConfigured } from '../services/sheetApi';

const CODE_JS_SNIPPET = `var EXPECTED_HEADERS = [
  "परिवार के मुखिया का नाम",
  "मोबाइल नंबर",
  "जनगणना भवन नंबर",
  "जनगणना मकान नम्बर",
  "परिवार क्रमांक",
  "प्लॉट नम्बर",
  "स्व जनगणना SE ID 2nd Phase"
];`;

export function SetupGuide() {
  const [copiedPath, setCopiedPath] = useState(false);
  const configured = isAppsScriptConfigured();

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText('src/config/appsScriptConfig.ts');
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 1800);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Google Apps Script & Vercel Setup
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Connect all tabs in your Google Spreadsheet using the standalone <code className="font-mono text-slate-800">code.js</code> file and hardcode the deployment URL in one file.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {configured ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Apps Script URL Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <AlertCircle className="h-4 w-4" />
                URL Not Set Yet
              </span>
            )}
          </div>
        </div>

        <ol className="mt-6 space-y-6 text-sm text-slate-700">
          <li>
            <h2 className="font-semibold text-slate-900">
              01. Deploy <code className="font-mono">code.js</code> in Google Apps Script
            </h2>
            <p className="mt-1 leading-relaxed text-slate-600">
              Open your Google Spreadsheet, go to <strong>Extensions → Apps Script</strong>, replace the editor contents with the full code from <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">code.js</code>, and click <strong>Deploy → New deployment</strong> (or <strong>Manage deployments → Edit → New version</strong> if updating).
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
              <li>Select type: <strong>Web app</strong></li>
              <li>Execute as: <strong>Me</strong></li>
              <li>Who has access: <strong>Anyone</strong></li>
              <li>Authorize permissions and copy the generated <code className="font-mono">/exec</code> Web App URL.</li>
              <li>Reads all sheet tabs automatically and displays each sheet in card form.</li>
            </ul>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-3.5 font-mono text-xs text-slate-100">
              {CODE_JS_SNIPPET}
            </pre>
          </li>

          <li className="border-t border-slate-100 pt-5">
            <h2 className="font-semibold text-slate-900">
              02. Enter the Deploy URL in the Config File
            </h2>
            <p className="mt-1 leading-relaxed text-slate-600">
              Open the dedicated config file below and paste your Google Apps Script URL into <code className="font-mono text-xs text-slate-800">GOOGLE_APPS_SCRIPT_URL</code>:
            </p>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <code className="font-mono text-xs font-semibold text-slate-900">
                src/config/appsScriptConfig.ts
              </code>
              <button
                type="button"
                onClick={handleCopyPath}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {copiedPath ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Path</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Current value:{' '}
              <code className="break-all font-mono text-slate-700">
                {GOOGLE_APPS_SCRIPT_URL}
              </code>
            </p>
          </li>

          <li className="border-t border-slate-100 pt-5">
            <h2 className="font-semibold text-slate-900">
              03. Deploy to Vercel
            </h2>
            <p className="mt-1 leading-relaxed text-slate-600">
              This project includes <code className="font-mono text-xs text-slate-800">vercel.json</code> and builds as a static Vite React app (<code className="font-mono text-xs text-slate-800">npm run build</code> → <code className="font-mono text-xs text-slate-800">dist</code>). Push the repository to GitHub and import it in Vercel, or run <code className="font-mono text-xs text-slate-800">vercel --prod</code> directly.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
