import { GOOGLE_APPS_SCRIPT_URL } from '../config/appsScriptConfig';
import type {
  CensusFormValues,
  SheetData,
  SheetFetchResponse,
  SheetWriteResponse,
} from '../types/census';

export function isAppsScriptConfigured(): boolean {
  const trimmed = GOOGLE_APPS_SCRIPT_URL.trim();
  return (
    trimmed.length > 0 &&
    !trimmed.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_DEPLOY_URL_HERE') &&
    (trimmed.startsWith('https://script.google.com/') ||
      trimmed.startsWith('https://script.googleusercontent.com/'))
  );
}

export async function fetchAllSheets(): Promise<SheetData[]> {
  if (!isAppsScriptConfigured()) {
    throw new Error(
      'Google Apps Script URL is not configured in src/config/appsScriptConfig.ts.'
    );
  }

  const separator = GOOGLE_APPS_SCRIPT_URL.includes('?') ? '&' : '?';
  const url = `${GOOGLE_APPS_SCRIPT_URL}${separator}_t=${Date.now()}`;

  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Sheet fetch failed with HTTP ${response.status}`);
  }

  const data = (await response.json()) as SheetFetchResponse;
  if (data.status === 'error') {
    throw new Error(data.message || 'Apps Script returned an error.');
  }

  // Multi-sheet format returned by updated code.js
  if (Array.isArray(data.sheets) && data.sheets.length > 0) {
    return data.sheets.map((s) => ({
      sheetName: s.sheetName,
      sheetId: s.sheetId,
      headers: s.headers ?? [],
      records: (s.records ?? []).map((r) => ({
        ...r,
        sheetName: r.sheetName ?? s.sheetName,
      })),
    }));
  }

  // Backward-compatible fallback if Apps Script deployment returns single-sheet payload
  return [
    {
      sheetName: 'Sheet1',
      headers: data.headers ?? [],
      records: (data.records ?? []).map((r) => ({
        ...r,
        sheetName: r.sheetName ?? 'Sheet1',
      })),
    },
  ];
}

export async function saveOrUpdateSheetRecord(
  payload: CensusFormValues & {
    sheetName?: string;
    rowIndex?: number | null;
    action?: 'save' | 'update';
  }
): Promise<SheetWriteResponse> {
  if (!isAppsScriptConfigured()) {
    throw new Error(
      'Google Apps Script URL is not configured in src/config/appsScriptConfig.ts.'
    );
  }

  // Using text/plain avoids CORS OPTIONS preflight which Google Apps Script does not support.
  const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Sheet write failed with HTTP ${response.status}`);
  }

  const data = (await response.json()) as SheetWriteResponse;
  if (data.status === 'error') {
    throw new Error(data.message || 'Apps Script rejected the write request.');
  }

  return data;
}
