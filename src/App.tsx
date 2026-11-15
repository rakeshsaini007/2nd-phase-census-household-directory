import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import { MotionConfig, AnimatePresence, motion } from 'motion/react';
import { Header, type ActiveTab } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { SheetsGrid } from './components/SheetsGrid';
import { RecordsDirectory } from './components/RecordsDirectory';
import { RecordEditorModal } from './components/RecordEditorModal';
import { SetupGuide } from './components/SetupGuide';
import type { StatsFilterMode } from './components/DashboardStatsCards';
import {
  fetchAllSheets,
  isAppsScriptConfigured,
  saveOrUpdateSheetRecord,
} from './services/sheetApi';
import { buildPlotColorMap } from './utils/plotColors';
import type {
  AlertState,
  CensusFormValues,
  CensusRecord,
  SheetData,
} from './types/census';

const EMPTY_FORM: CensusFormValues = {
  headName: '',
  mobileNumber: '',
  buildingNumber: '',
  houseNumber: '',
  familyNumber: '',
  plotNumber: '',
  seId: '',
};

function normalize(val: string): string {
  return val.trim();
}

export default function App() {
  const configured = isAppsScriptConfigured();

  const [activeTab, setActiveTab] = useState<ActiveTab>('workspace');
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string | null>(null);
  const [showAllSheets, setShowAllSheets] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<StatsFilterMode>('all');
  const [isLoading, setIsLoading] = useState<boolean>(configured);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<CensusFormValues>(EMPTY_FORM);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = useCallback((nextAlert: AlertState) => {
    setAlert(nextAlert);
  }, []);

  const loadAllSheets = useCallback(async () => {
    if (!isAppsScriptConfigured()) return;
    setIsLoading(true);
    try {
      const loadedSheets = await fetchAllSheets();
      setSheets(loadedSheets);
      setSelectedSheetName((current) => {
        if (current && loadedSheets.some((s) => s.sheetName === current)) {
          return current;
        }
        return loadedSheets[0]?.sheetName ?? null;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to fetch Google Sheets.';
      showAlert({
        id: Date.now(),
        type: 'error',
        title: 'Sheet Sync Failed',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    if (configured) {
      void loadAllSheets();
    }
  }, [configured, loadAllSheets]);

  const activeSheet = useMemo(() => {
    if (!selectedSheetName) return null;
    return sheets.find((s) => s.sheetName === selectedSheetName) ?? null;
  }, [sheets, selectedSheetName]);

  const activeRecords = activeSheet?.records ?? [];

  const plotColorMap = useMemo(
    () => buildPlotColorMap(activeRecords),
    [activeRecords]
  );

  const matchedRecord = useMemo(() => {
    if (!activeSheet) return null;

    if (selectedRowIndex !== null) {
      return (
        activeRecords.find((r) => r.rowIndex === selectedRowIndex) ?? null
      );
    }

    const mobile = normalize(formValues.mobileNumber);
    if (mobile.length >= 10) {
      const byMobile = activeRecords.find(
        (r) => normalize(r.mobileNumber) === mobile
      );
      if (byMobile) return byMobile;
    }

    const house = normalize(formValues.houseNumber);
    const family = normalize(formValues.familyNumber);
    if (house && family) {
      const byHouseFamily = activeRecords.find(
        (r) =>
          normalize(r.houseNumber) === house &&
          normalize(r.familyNumber) === family
      );
      if (byHouseFamily) return byHouseFamily;
    }

    return null;
  }, [
    activeSheet,
    activeRecords,
    selectedRowIndex,
    formValues.mobileNumber,
    formValues.houseNumber,
    formValues.familyNumber,
  ]);

  const handleOpenSheet = (sheetName: string) => {
    setShowAllSheets(false);
    setSelectedSheetName(sheetName);
    setFilterMode('all');
    setSelectedRowIndex(null);
    setFormValues(EMPTY_FORM);
    setIsEditorOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRecordEditor = (record: CensusRecord) => {
    setSelectedRowIndex(record.rowIndex);
    setFormValues({
      headName: record.headName,
      mobileNumber: record.mobileNumber,
      buildingNumber: record.buildingNumber,
      houseNumber: record.houseNumber,
      familyNumber: record.familyNumber,
      plotNumber: record.plotNumber,
      seId: record.seId,
    });
    setIsEditorOpen(true);
  };

  const handleOpenAddNew = () => {
    setSelectedRowIndex(null);
    setFormValues(EMPTY_FORM);
    setIsEditorOpen(true);
  };

  const handleResetToNew = () => {
    setSelectedRowIndex(null);
    setFormValues(EMPTY_FORM);
  };

  const handleFieldChange = (field: keyof CensusFormValues, value: string) => {
    setFormValues((prev) => {
      const updated = { ...prev, [field]: value };

      if (selectedRowIndex === null && field === 'mobileNumber') {
        const cleanMobile = normalize(value);
        if (cleanMobile.length >= 10) {
          const found = activeRecords.find(
            (r) => normalize(r.mobileNumber) === cleanMobile
          );
          if (found) {
            setSelectedRowIndex(found.rowIndex);
            return {
              headName: found.headName,
              mobileNumber: found.mobileNumber,
              buildingNumber: found.buildingNumber,
              houseNumber: found.houseNumber,
              familyNumber: found.familyNumber,
              plotNumber: found.plotNumber,
              seId: found.seId || updated.seId,
            };
          }
        }
      }

      if (
        selectedRowIndex === null &&
        (field === 'houseNumber' || field === 'familyNumber')
      ) {
        const h = normalize(updated.houseNumber);
        const f = normalize(updated.familyNumber);
        if (h && f) {
          const found = activeRecords.find(
            (r) =>
              normalize(r.houseNumber) === h && normalize(r.familyNumber) === f
          );
          if (found) {
            setSelectedRowIndex(found.rowIndex);
            return {
              headName: found.headName,
              mobileNumber: found.mobileNumber,
              buildingNumber: found.buildingNumber,
              houseNumber: found.houseNumber,
              familyNumber: found.familyNumber,
              plotNumber: found.plotNumber,
              seId: found.seId || updated.seId,
            };
          }
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeSheet) return;

    const trimmedSeId = formValues.seId.trim().toUpperCase();
    if (!/^P\d{11}$/.test(trimmedSeId)) {
      showAlert({
        id: Date.now(),
        type: 'error',
        title: 'Invalid SE ID (2nd Phase)',
        message:
          'SE ID (2nd Phase) must start with "P" followed by exactly 11 digits (e.g. P12345678901).',
      });
      return;
    }

    const isUpdate = matchedRecord !== null;
    setIsSubmitting(true);

    try {
      const normalizedValues: CensusFormValues = {
        ...formValues,
        seId: trimmedSeId,
      };
      const payloadValues: CensusFormValues = matchedRecord
        ? {
            ...normalizedValues,
            buildingNumber: matchedRecord.buildingNumber,
            houseNumber: matchedRecord.houseNumber,
            familyNumber: matchedRecord.familyNumber,
            plotNumber: matchedRecord.plotNumber,
          }
        : normalizedValues;

      const res = await saveOrUpdateSheetRecord({
        ...payloadValues,
        sheetName: activeSheet.sheetName,
        rowIndex: matchedRecord ? matchedRecord.rowIndex : null,
        action: isUpdate ? 'update' : 'save',
      });

      const returnedRecord: CensusRecord = res.record ?? {
        rowIndex:
          res.rowIndex ??
          (matchedRecord?.rowIndex || activeSheet.records.length + 2),
        sheetName: activeSheet.sheetName,
        ...payloadValues,
      };

      setSheets((prevSheets) =>
        prevSheets.map((sheet) => {
          if (sheet.sheetName !== activeSheet.sheetName) return sheet;
          const exists = sheet.records.some(
            (r) => r.rowIndex === returnedRecord.rowIndex
          );
          const nextRecords = exists
            ? sheet.records.map((r) =>
                r.rowIndex === returnedRecord.rowIndex ? returnedRecord : r
              )
            : [...sheet.records, returnedRecord];
          return { ...sheet, records: nextRecords };
        })
      );

      setIsEditorOpen(false);
      setSelectedRowIndex(null);
      setFormValues(EMPTY_FORM);

      const actionDone =
        res.action === 'updated' || isUpdate ? 'updated' : 'saved';
      showAlert({
        id: Date.now(),
        type: actionDone,
        title:
          actionDone === 'updated'
            ? 'Data Updated Successfully'
            : 'Data Saved Successfully',
        message:
          res.message ||
          (actionDone === 'updated'
            ? `Updated '${activeSheet.sheetName}' Row #${returnedRecord.rowIndex}.`
            : `Saved new record to '${activeSheet.sheetName}' Row #${returnedRecord.rowIndex}.`),
        record: returnedRecord,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to save record.';
      showAlert({
        id: Date.now(),
        type: 'error',
        title: isUpdate ? 'Update Failed' : 'Save Failed',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentViewKey =
    activeTab === 'setup'
      ? 'setup'
      : showAllSheets
      ? 'all-sheets'
      : activeSheet
      ? `sheet-${activeSheet.sheetName}`
      : isLoading
      ? 'sheet-loading'
      : 'all-sheets';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
        <Header
          activeTab={activeTab}
          onSelectAllSheets={() => {
            setActiveTab('workspace');
            setShowAllSheets(true);
            setSelectedSheetName(null);
            setIsEditorOpen(false);
          }}
          onSelectSetup={() => setActiveTab('setup')}
          onSyncSheet={() => void loadAllSheets()}
          isSyncing={isLoading}
          isConfigured={configured}
        />

        <AlertBanner alert={alert} onDismiss={() => setAlert(null)} />

        <main className="mx-auto max-w-[1360px] px-3.5 py-5 sm:px-6 sm:py-7 lg:px-8">
          {!configured && activeTab === 'workspace' && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <p className="text-xs sm:text-sm">
                  Enter your Google Apps Script Web App URL in{' '}
                  <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-semibold">
                    src/config/appsScriptConfig.ts
                  </code>{' '}
                  to connect your live Google Sheets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('setup')}
                className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950 whitespace-nowrap"
              >
                Open Setup Guide
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentViewKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'setup' ? (
                <SetupGuide />
              ) : !showAllSheets && (activeSheet || isLoading) ? (
                <>
                  <RecordsDirectory
                    sheetName={activeSheet?.sheetName ?? 'Loading Sheet...'}
                    records={activeSheet?.records ?? []}
                    selectedRowIndex={selectedRowIndex}
                    filterMode={filterMode}
                    onFilterChange={setFilterMode}
                    isLoading={isLoading && !activeSheet}
                    onBackToSheets={() => {
                      setShowAllSheets(true);
                      setSelectedSheetName(null);
                      setIsEditorOpen(false);
                    }}
                    onSelectRecord={handleOpenRecordEditor}
                    onAddNewRecord={handleOpenAddNew}
                  />

                  {activeSheet && (
                    <RecordEditorModal
                      isOpen={isEditorOpen}
                      sheetName={activeSheet.sheetName}
                      formValues={formValues}
                      matchedRecord={matchedRecord}
                      plotColorMap={plotColorMap}
                      isSubmitting={isSubmitting}
                      onFieldChange={handleFieldChange}
                      onSubmit={handleSubmit}
                      onResetToNew={handleResetToNew}
                      onClose={() => {
                        if (!isSubmitting) setIsEditorOpen(false);
                      }}
                    />
                  )}
                </>
              ) : (
                <SheetsGrid
                  sheets={sheets}
                  isLoading={isLoading}
                  isConfigured={configured}
                  onSelectSheet={handleOpenSheet}
                  onOpenSetup={() => setActiveTab('setup')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}
