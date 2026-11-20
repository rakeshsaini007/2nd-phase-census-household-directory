export interface CensusFormValues {
  headName: string;
  mobileNumber: string;
  buildingNumber: string;
  houseNumber: string;
  familyNumber: string;
  plotNumber: string;
  seId: string;
  totalMembers: string;
}

export interface CensusRecord extends CensusFormValues {
  rowIndex: number;
  sheetName?: string;
}

export interface SheetData {
  sheetName: string;
  sheetId?: number;
  headers: string[];
  records: CensusRecord[];
}

export interface SheetFetchResponse {
  status: 'success' | 'error';
  authorized?: boolean;
  spreadsheetUrl?: string;
  sheets?: SheetData[];
  headers?: string[];
  records?: CensusRecord[];
  message?: string;
}

export interface SheetWriteResponse {
  status: 'success' | 'error';
  action?: 'saved' | 'updated';
  sheetName?: string;
  message?: string;
  rowIndex?: number;
  record?: CensusRecord;
}

export interface AlertState {
  id: number;
  type: 'saved' | 'updated' | 'error';
  title: string;
  message: string;
  record?: CensusRecord;
}

export const SHEET_COLUMN_LABELS = {
  headName: {
    hi: 'परिवार के मुखिया का नाम',
    en: 'Head of Family Name',
  },
  mobileNumber: {
    hi: 'मोबाइल नंबर',
    en: 'Mobile Number',
  },
  buildingNumber: {
    hi: 'जनगणना भवन नंबर',
    en: 'Census Building No.',
  },
  houseNumber: {
    hi: 'जनगणना मकान नम्बर',
    en: 'Census House No.',
  },
  familyNumber: {
    hi: 'परिवार क्रमांक',
    en: 'Family Serial No.',
  },
  plotNumber: {
    hi: 'प्लॉट नम्बर',
    en: 'Plot Number',
  },
  seId: {
    hi: 'स्व जनगणना SE ID 2nd Phase',
    en: 'Self Enumeration SE ID (2nd Phase)',
  },
  totalMembers: {
    hi: 'कुल सदस्य',
    en: 'Total number of Members',
  },
} as const;
