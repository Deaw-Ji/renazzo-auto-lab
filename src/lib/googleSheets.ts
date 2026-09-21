import { CarWashRecord, GoogleSheetConfig } from '../types';

export const SPREADSHEET_TITLE = 'Car Wash Records - ระบบบันทึกรถล้าง';
export const SHEET_NAME = 'บันทึกรายการล้างรถ';

export const SHEET_HEADERS = [
  'ID',
  'วันที่ (Date)',
  'ทะเบียนรถ (Plate)',
  'เลข VIN (VIN)',
  'ยี่ห้อ (Brand)',
  'รุ่น (Model)',
  'สี (Color)',
  'สถานะการล้าง (Status)',
  'สาขา (Branch)',
  'พนักงานผู้รับผิดชอบ (Staff)',
  'หมายเหตุ (Notes)',
  'ผู้บันทึก (Logged By)',
  'สร้างเมื่อ (CreatedAt)',
  'แก้ไขล่าสุด (UpdatedAt)'
];

/**
 * Extract spreadsheet ID from URL or return ID as is
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Connect to an existing Master Google Sheet by ID or URL
 */
export async function connectExistingSpreadsheet(
  accessToken: string,
  spreadsheetIdOrUrl: string
): Promise<GoogleSheetConfig> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdOrUrl);
  if (!spreadsheetId) {
    throw new Error('กรุณาระบุ Spreadsheet ID หรือ URL ของ Google Sheet ที่ถูกต้อง');
  }

  // Verify access by fetching metadata
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    if (res.status === 403 || res.status === 404) {
      throw new Error('ไม่สามารถเข้าถึง Google Sheet นี้ได้ (โปรดตรวจสอบสิทธิ์การแชร์ให้บัญชีนี้สามารถแก้ไขได้)');
    }
    const errText = await res.text();
    throw new Error(`ไม่สามารถเชื่อมต่อชีตได้: ${errText}`);
  }

  const data = await res.json();
  const title = data.properties?.title || SPREADSHEET_TITLE;

  // Ensure header row exists
  await initializeSheetHeaders(accessToken, spreadsheetId);

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    sheetName: SHEET_NAME,
    autoSync: true,
    isConnected: true,
    lastSyncedAt: new Date().toISOString()
  };
}

/**
 * Find existing spreadsheet or create a new one
 */
export async function getOrCreateSpreadsheet(accessToken: string): Promise<GoogleSheetConfig> {
  // 1. Search Google Drive for existing sheet by title
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(SPREADSHEET_TITLE)}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,webViewLink)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        const file = data.files[0];
        // Ensure sheet headers exist
        await initializeSheetHeaders(accessToken, file.id);
        return {
          spreadsheetId: file.id,
          spreadsheetUrl: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`,
          sheetName: SHEET_NAME,
          autoSync: true,
          isConnected: true,
          lastSyncedAt: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('Drive search failed, proceeding to create new sheet:', err);
  }

  // 2. Create new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE
      },
      sheets: [
        {
          properties: {
            title: SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${errorText}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Write header row & formatting
  await initializeSheetHeaders(accessToken, spreadsheetId, true);

  return {
    spreadsheetId,
    spreadsheetUrl,
    sheetName: SHEET_NAME,
    autoSync: true,
    isConnected: true,
    lastSyncedAt: new Date().toISOString()
  };
}

/**
 * Initializes sheet headers and styles
 */
export async function initializeSheetHeaders(
  accessToken: string,
  spreadsheetId: string,
  isNew: boolean = false
): Promise<void> {
  try {
    // Check if headers already exist
    const checkRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(SHEET_NAME)}'!A1:N1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.values && data.values.length > 0 && data.values[0].length >= 5) {
        return; // Headers already initialized
      }
    }

    // Set headers
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(SHEET_NAME)}'!A1:N1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: `'${SHEET_NAME}'!A1:N1`,
          majorDimension: 'ROWS',
          values: [SHEET_HEADERS]
        })
      }
    );
  } catch (error) {
    console.error('Error initializing sheet headers:', error);
  }
}

/**
 * Fetch all records from Google Sheet
 */
export async function fetchRecordsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<CarWashRecord[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(SHEET_NAME)}'!A2:N10000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch records: ${res.statusText}`);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  const records: CarWashRecord[] = [];
  rows.forEach((row, index) => {
    if (!row || row.length < 2 || !row[0]) return;
    records.push({
      id: String(row[0] || `CW-${index + 1}`),
      date: String(row[1] || ''),
      licensePlate: String(row[2] || ''),
      vinNumber: String(row[3] || ''),
      brand: String(row[4] || ''),
      model: String(row[5] || ''),
      color: String(row[6] || ''),
      washStatus: (row[7] || 'Detailing New Car Deliver') as any,
      branch: String(row[8] || ''),
      staffNames: row[9] ? String(row[9]).split(',').map(s => s.trim()).filter(Boolean) : [],
      notes: String(row[10] || ''),
      loggedBy: String(row[11] || ''),
      createdAt: String(row[12] || new Date().toISOString()),
      updatedAt: String(row[13] || new Date().toISOString()),
      syncedToSheet: true,
      sheetRowIndex: index + 2
    });
  });

  return records;
}

/**
 * Append single record to Google Sheet
 */
export async function appendRecordToSheet(
  accessToken: string,
  spreadsheetId: string,
  record: CarWashRecord
): Promise<void> {
  const rowValues = [
    record.id,
    record.date,
    record.licensePlate || '-',
    record.vinNumber || '-',
    record.brand,
    record.model,
    record.color,
    record.washStatus,
    record.branch,
    record.staffNames.join(', '),
    record.notes || '',
    record.loggedBy,
    record.createdAt,
    record.updatedAt
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(SHEET_NAME)}'!A:N:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append record to sheet: ${errText}`);
  }
}

/**
 * Bulk sync all records to sheet (Overwrites data rows from row 2 onwards)
 */
export async function fullSyncRecordsToSheet(
  accessToken: string,
  spreadsheetId: string,
  records: CarWashRecord[]
): Promise<void> {
  // 1. Clear old data from row 2 downwards
  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(SHEET_NAME)}'!A2:N:clear`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
  } catch (err) {
    console.warn('Clear sheet failed:', err);
  }

  if (records.length === 0) return;

  const rows = records.map(record => [
    record.id,
    record.date,
    record.licensePlate || '-',
    record.vinNumber || '-',
    record.brand,
    record.model,
    record.color,
    record.washStatus,
    record.branch,
    record.staffNames.join(', '),
    record.notes || '',
    record.loggedBy,
    record.createdAt,
    record.updatedAt
  ]);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(SHEET_NAME)}'!A2:N${rows.length + 1}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: `'${SHEET_NAME}'!A2:N${rows.length + 1}`,
      majorDimension: 'ROWS',
      values: rows
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to bulk sync: ${err}`);
  }
}
