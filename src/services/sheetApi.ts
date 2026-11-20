import {
  ADMIN_DEVELOPER_KEY,
  GOOGLE_APPS_SCRIPT_URL,
} from '../config/appsScriptConfig';
import type {
  CensusFormValues,
  SheetData,
  SheetFetchResponse,
  SheetWriteResponse,
} from '../types/census';

export interface FetchSheetsResult {
  sheets: SheetData[];
  spreadsheetUrl?: string;
}

export function isAppsScriptConfigured(): boolean {
  const trimmed = GOOGLE_APPS_SCRIPT_URL.trim();
  return (
    trimmed.length > 0 &&
    !trimmed.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_DEPLOY_URL_HERE') &&
    (trimmed.startsWith('https://script.google.com/') ||
      trimmed.startsWith('https://script.googleusercontent.com/'))
  );
}

export async function fetchAllSheets(): Promise<FetchSheetsResult> {
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
    return {
      spreadsheetUrl: data.spreadsheetUrl,
      sheets: data.sheets.map((s) => ({
        sheetName: s.sheetName,
        sheetId: s.sheetId,
        headers: s.headers ?? [],
        records: (s.records ?? []).map((r) => ({
          ...r,
          totalMembers: r.totalMembers ?? '',
          sheetName: r.sheetName ?? s.sheetName,
        })),
      })),
    };
  }

  // Backward-compatible fallback if Apps Script deployment returns single-sheet payload
  return {
    spreadsheetUrl: data.spreadsheetUrl,
    sheets: [
      {
        sheetName: 'Sheet1',
        headers: data.headers ?? [],
        records: (data.records ?? []).map((r) => ({
          ...r,
          totalMembers: r.totalMembers ?? '',
          sheetName: r.sheetName ?? 'Sheet1',
        })),
      },
    ],
  };
}

export async function verifyAdminAccess(adminKey: string): Promise<{
  authorized: boolean;
  spreadsheetUrl?: string;
  message?: string;
}> {
  const trimmedKey = adminKey.trim();
  if (!trimmedKey) {
    return {
      authorized: false,
      message: 'Please enter the App Developer / Admin access key.',
    };
  }

  const expectedLocalKey =
    (import.meta.env.VITE_ADMIN_KEY as string | undefined)?.trim() ||
    ADMIN_DEVELOPER_KEY;

  if (!isAppsScriptConfigured()) {
    return {
      authorized: trimmedKey === expectedLocalKey,
      message:
        trimmedKey === expectedLocalKey
          ? undefined
          : 'Invalid Admin / App Developer access key.',
    };
  }

  const separator = GOOGLE_APPS_SCRIPT_URL.includes('?') ? '&' : '?';
  const url = `${GOOGLE_APPS_SCRIPT_URL}${separator}action=verifyAdmin&adminKey=${encodeURIComponent(
    trimmedKey
  )}&_t=${Date.now()}`;

  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Verification request failed with HTTP ${response.status}`);
  }

  const data = (await response.json()) as SheetFetchResponse;

  // If the deployed Apps Script implements verifyAdmin, trust its decision
  if (typeof data.authorized === 'boolean') {
    return {
      authorized: data.authorized,
      spreadsheetUrl: data.spreadsheetUrl,
      message: data.message,
    };
  }

  // Fallback for older Apps Script deployments without verifyAdmin handler
  const matchesLocal = trimmedKey === expectedLocalKey;
  return {
    authorized: matchesLocal,
    spreadsheetUrl: data.spreadsheetUrl,
    message: matchesLocal
      ? undefined
      : 'Invalid Admin / App Developer access key.',
  };
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
