import * as XLSX from 'xlsx';
import { 
  CarWashRecord, 
  UserProfile, 
  MasterSettingsData, 
  CarColor, 
  Branch, 
  CarBrand, 
  Employee 
} from '../types';

export const APPS_SCRIPT_TEMPLATE = `/**
 * ======================================================================
 * ระบบเชื่อมต่อ Google Sheets API สำหรับ Car Wash Management
 * รองรับ 3 แท็บ: Jobs, Users, Settings_MasterData
 * ======================================================================
 * 
 * วิธีการติดตั้ง (ครั้งเดียว):
 * 1. เปิด Google Sheet ของท่าน
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมดใน Code.gs แล้ววางโค้ดชุดนี้ลงไปทั้งหมด
 * 4. กดปุ่มบันทึก (Save - ไอคอนแผ่นดิสก์)
 * 5. กดปุ่ม "การทำให้ใช้งานได้" (Deploy) มุมบนขวา > "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอป" (Web app)
 *    - คำอธิบาย: Car Care Web App API
 *    - ดำเนินการในฐานะ: "ฉัน" (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง: "ทุกคน" (Anyone) **สำคัญมาก ต้องเลือก Anyone**
 * 7. กด "ทำให้ใช้งานได้" (Deploy) แล้วอนุมัติสิทธิ์ (Authorize access)
 * 8. คัดลอก "URL ของเว็บแอป" (ขึ้นต้นด้วย https://script.google.com/macros/s/...)
 *    นำมาวางในช่อง Web App URL ในโปรแกรมได้เลยครับ
 */

const SHEET_NAMES = {
  JOBS: 'Jobs',
  USERS: 'Users',
  SETTINGS: 'Settings_MasterData'
};

const JOB_HEADERS = [
  'ID', 'วันที่ (Date)', 'ทะเบียนรถ (Plate)', 'เลข VIN (VIN)', 
  'ยี่ห้อ (Brand)', 'รุ่น (Model)', 'สี (Color)', 'สถานะการล้าง (Status)', 
  'สาขา (Branch)', 'พนักงานผู้รับผิดชอบ (Staff)', 'หมายเหตุ (Notes)', 
  'ผู้บันทึก (Logged By)', 'สร้างเมื่อ (CreatedAt)', 'แก้ไขล่าสุด (UpdatedAt)'
];

const USER_HEADERS = [
  'User ID', 'อีเมล (Email)', 'ชื่อ-นามสกุล (Name)', 'สิทธิ์ (Role)', 
  'วันที่สร้าง (CreatedAt)', 'เข้าสู่ระบบล่าสุด (LastLoginAt)', 'รหัสผ่าน (Password)'
];

const SETTING_HEADERS = [
  'Category', 'Key', 'Value / JSON Data', 'แก้ไขล่าสุด (UpdatedAt)'
];

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E2E8F0');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function initAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateSheet(ss, SHEET_NAMES.JOBS, JOB_HEADERS);
  getOrCreateSheet(ss, SHEET_NAMES.USERS, USER_HEADERS);
  getOrCreateSheet(ss, SHEET_NAMES.SETTINGS, SETTING_HEADERS);
}

// ----------------------------------------------------------------------
// GET: ดึงข้อมูลเดิมที่มีอยู่ใน Google Sheet ทั้งหมด (Jobs, Users, Settings)
// ----------------------------------------------------------------------
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initAllSheets();

    const jobsSheet = ss.getSheetByName(SHEET_NAMES.JOBS);
    const usersSheet = ss.getSheetByName(SHEET_NAMES.USERS);
    const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);

    // Read Jobs
    const jobs = [];
    const jobRows = jobsSheet.getDataRange().getValues();
    if (jobRows.length > 1) {
      for (let i = 1; i < jobRows.length; i++) {
        const r = jobRows[i];
        if (!r[0]) continue;
        jobs.push({
          id: String(r[0]),
          date: r[1] ? (r[1] instanceof Date ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(r[1])) : '',
          licensePlate: String(r[2] || ''),
          vinNumber: String(r[3] || ''),
          brand: String(r[4] || ''),
          model: String(r[5] || ''),
          color: String(r[6] || ''),
          washStatus: String(r[7] || 'Detailing New Car Deliver'),
          branch: String(r[8] || ''),
          staffNames: r[9] ? String(r[9]).split(',').map(s => s.trim()).filter(Boolean) : [],
          notes: String(r[10] || ''),
          loggedBy: String(r[11] || ''),
          createdAt: String(r[12] || new Date().toISOString()),
          updatedAt: String(r[13] || new Date().toISOString()),
          syncedToSheet: true
        });
      }
    }

    // Read Users
    const users = [];
    const userRows = usersSheet.getDataRange().getValues();
    if (userRows.length > 1) {
      for (let i = 1; i < userRows.length; i++) {
        const r = userRows[i];
        if (!r[1]) continue;
        users.push({
          uid: String(r[0] || 'user-' + i),
          email: String(r[1]),
          displayName: String(r[2] || r[1].split('@')[0]),
          role: String(r[3] || 'Administration Officer'),
          createdAt: String(r[4] || new Date().toISOString()),
          lastLoginAt: String(r[5] || ''),
          password: String(r[6] || '')
        });
      }
    }

    // Read Settings
    let settings = null;
    const settingRows = settingsSheet.getDataRange().getValues();
    if (settingRows.length > 1) {
      settings = {};
      for (let i = 1; i < settingRows.length; i++) {
        const cat = String(settingRows[i][0] || '');
        const key = String(settingRows[i][1] || '');
        const val = String(settingRows[i][2] || '');
        if (key && val) {
          try {
            settings[key] = JSON.parse(val);
          } catch (e) {
            settings[key] = val;
          }
        }
      }
    }

    const result = {
      status: 'success',
      data: {
        jobs: jobs,
        users: users,
        settings: settings
      },
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ----------------------------------------------------------------------
// POST: รับข้อมูลซิงค์จากโปรแกรม (Push, Save Job, Save User, Full Sync)
// ----------------------------------------------------------------------
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initAllSheets();

    const postData = JSON.parse(e.postData.contents);
    const action = postData.action || 'syncAll';

    const jobsSheet = ss.getSheetByName(SHEET_NAMES.JOBS);
    const usersSheet = ss.getSheetByName(SHEET_NAMES.USERS);
    const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);

    if (action === 'pull') {
      return doGet(e);
    }

    // 1. FULL SYNC
    if (action === 'syncAll') {
      const { jobs, users, settings } = postData.payload || {};

      // Sync Jobs (Preserve sheet headers)
      if (jobs && Array.isArray(jobs)) {
        if (jobsSheet.getLastRow() > 1) {
          jobsSheet.getRange(2, 1, jobsSheet.getLastRow() - 1, JOB_HEADERS.length).clearContent();
        }
        if (jobs.length > 0) {
          const rows = jobs.map(j => [
            j.id,
            j.date,
            j.licensePlate || '-',
            j.vinNumber || '-',
            j.brand,
            j.model,
            j.color,
            j.washStatus,
            j.branch,
            Array.isArray(j.staffNames) ? j.staffNames.join(', ') : (j.staffNames || ''),
            j.notes || '',
            j.loggedBy || '',
            j.createdAt || new Date().toISOString(),
            j.updatedAt || new Date().toISOString()
          ]);
          jobsSheet.getRange(2, 1, rows.length, JOB_HEADERS.length).setValues(rows);
        }
      }

      // Sync Users
      if (users && Array.isArray(users)) {
        if (usersSheet.getLastRow() > 1) {
          usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, USER_HEADERS.length).clearContent();
        }
        if (users.length > 0) {
          const userRows = users.map(u => [
            u.uid,
            u.email,
            u.displayName,
            u.role,
            u.createdAt,
            u.lastLoginAt || '',
            u.password || ''
          ]);
          usersSheet.getRange(2, 1, userRows.length, USER_HEADERS.length).setValues(userRows);
        }
      }

      // Sync Settings
      if (settings) {
        if (settingsSheet.getLastRow() > 1) {
          settingsSheet.getRange(2, 1, settingsSheet.getLastRow() - 1, SETTING_HEADERS.length).clearContent();
        }
        const now = new Date().toISOString();
        const settingRows = [
          ['MasterData', 'colors', JSON.stringify(settings.colors || []), now],
          ['MasterData', 'branches', JSON.stringify(settings.branches || []), now],
          ['MasterData', 'brands', JSON.stringify(settings.brands || []), now],
          ['MasterData', 'employees', JSON.stringify(settings.employees || []), now]
        ];
        settingsSheet.getRange(2, 1, settingRows.length, SETTING_HEADERS.length).setValues(settingRows);
      }
    }

    // 2. SAVE SINGLE JOB (Insert or Update by ID)
    else if (action === 'saveJob') {
      const j = postData.job;
      if (j && j.id) {
        const rows = jobsSheet.getDataRange().getValues();
        let targetRowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
          if (String(rows[i][0]) === String(j.id)) {
            targetRowIndex = i + 1;
            break;
          }
        }

        const rowValues = [
          j.id,
          j.date,
          j.licensePlate || '-',
          j.vinNumber || '-',
          j.brand,
          j.model,
          j.color,
          j.washStatus,
          j.branch,
          Array.isArray(j.staffNames) ? j.staffNames.join(', ') : (j.staffNames || ''),
          j.notes || '',
          j.loggedBy || '',
          j.createdAt || new Date().toISOString(),
          j.updatedAt || new Date().toISOString()
        ];

        if (targetRowIndex > 0) {
          jobsSheet.getRange(targetRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
        } else {
          jobsSheet.appendRow(rowValues);
        }
      }
    }

    // 3. DELETE SINGLE JOB (by ID)
    else if (action === 'deleteJob') {
      const jobId = postData.jobId;
      if (jobId) {
        const rows = jobsSheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (String(rows[i][0]) === String(jobId)) {
            jobsSheet.deleteRow(i + 1);
            break;
          }
        }
      }
    }

    // 4. SAVE USERS
    else if (action === 'saveUsers') {
      const users = postData.users;
      if (Array.isArray(users)) {
        if (usersSheet.getLastRow() > 1) {
          usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, USER_HEADERS.length).clearContent();
        }
        if (users.length > 0) {
          const userRows = users.map(u => [
            u.uid,
            u.email,
            u.displayName,
            u.role,
            u.createdAt,
            u.lastLoginAt || '',
            u.password || ''
          ]);
          usersSheet.getRange(2, 1, userRows.length, USER_HEADERS.length).setValues(userRows);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      action: action,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export interface SheetPullResult {
  jobs: CarWashRecord[];
  users: UserProfile[];
  settings?: MasterSettingsData | null;
}

/**
 * Fetch / Pull existing data from Google Apps Script Web App
 * CRITICAL: This is called on initial connection or manual pull to read whatever
 * is already on the sheet so existing data is never wiped!
 */
export async function pullDataFromGoogleSheet(webAppUrl: string): Promise<SheetPullResult> {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl) {
    throw new Error('กรุณาระบุ URL ของ Google Apps Script Web App');
  }

  // Handle redirect & prevent CORS preflight by requesting plain text output
  const fetchUrl = cleanUrl.includes('?') 
    ? `${cleanUrl}&action=pull&_t=${Date.now()}` 
    : `${cleanUrl}?action=pull&_t=${Date.now()}`;

  const res = await fetch(fetchUrl, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`ไม่สามารถเชื่อมต่อ Google Sheets Web App ได้ (HTTP ${res.status}) โปรดตรวจสอบว่าได้ตั้งค่าเป็น "Anyone" ในการ Deploy`);
  }

  const json = await res.json();
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'รูปแบบข้อมูลตอบกลับจาก Google Sheet ไม่ถูกต้อง');
  }

  const rawJobs = json.data.jobs || [];
  const rawUsers = json.data.users || [];
  const rawSettings = json.data.settings || null;

  // Format and validate jobs
  const jobs: CarWashRecord[] = rawJobs.map((j: any) => ({
    id: String(j.id),
    date: String(j.date || ''),
    licensePlate: String(j.licensePlate || ''),
    vinNumber: String(j.vinNumber || ''),
    brand: String(j.brand || ''),
    model: String(j.model || ''),
    color: String(j.color || ''),
    washStatus: j.washStatus || 'Detailing New Car Deliver',
    branch: String(j.branch || ''),
    staffNames: Array.isArray(j.staffNames) ? j.staffNames : [],
    notes: String(j.notes || ''),
    loggedBy: String(j.loggedBy || ''),
    createdAt: String(j.createdAt || new Date().toISOString()),
    updatedAt: String(j.updatedAt || new Date().toISOString()),
    syncedToSheet: true
  }));

  // Format and validate users
  const users: UserProfile[] = rawUsers.map((u: any) => ({
    uid: String(u.uid || `user-${Date.now()}`),
    email: String(u.email || '').toLowerCase().trim(),
    displayName: String(u.displayName || u.email?.split('@')[0] || 'User'),
    role: (u.role === 'Admin' || u.role === 'Accounting' || u.role === 'Administration Officer') ? u.role : 'Administration Officer',
    password: u.password || 'admin1234',
    createdAt: String(u.createdAt || new Date().toISOString()),
    lastLoginAt: u.lastLoginAt ? String(u.lastLoginAt) : undefined
  }));

  let settings: MasterSettingsData | null = null;
  if (rawSettings && typeof rawSettings === 'object') {
    settings = {
      colors: Array.isArray(rawSettings.colors) ? rawSettings.colors : [],
      branches: Array.isArray(rawSettings.branches) ? rawSettings.branches : [],
      brands: Array.isArray(rawSettings.brands) ? rawSettings.brands : [],
      employees: Array.isArray(rawSettings.employees) ? rawSettings.employees : []
    };
  }

  return { jobs, users, settings };
}

/**
 * Send full sync to Google Apps Script Web App
 */
export async function pushAllToGoogleSheet(
  webAppUrl: string,
  data: {
    jobs: CarWashRecord[];
    users: UserProfile[];
    settings: MasterSettingsData;
  }
): Promise<void> {
  const cleanUrl = webAppUrl.trim();
  if (!cleanUrl) {
    throw new Error('กรุณาระบุ URL ของ Google Apps Script Web App');
  }

  // Send POST as text/plain to avoid CORS OPTIONS preflight issues with Google Apps Script
  const response = await fetch(cleanUrl, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'syncAll',
      payload: data
    })
  });

  if (!response.ok) {
    throw new Error(`ส่งข้อมูลไม่สำเร็จ (HTTP ${response.status}) โปรดตรวจสอบสิทธิ์การ Deploy`);
  }

  const resJson = await response.json();
  if (resJson.status !== 'success') {
    throw new Error(resJson.message || 'Google Sheet ตอบกลับข้อผิดพลาดในการซิงค์');
  }
}

/**
 * Background Auto-Sync: Save or update a single job
 */
export async function autoSyncJobToGoogleSheet(
  webAppUrl: string,
  job: CarWashRecord
): Promise<void> {
  if (!webAppUrl || !webAppUrl.trim()) return;

  try {
    await fetch(webAppUrl.trim(), {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'saveJob',
        job: job
      })
    });
  } catch (err) {
    console.warn('Background auto-sync job warning:', err);
  }
}

/**
 * Background Auto-Sync: Delete a single job
 */
export async function autoSyncDeleteJobFromGoogleSheet(
  webAppUrl: string,
  jobId: string
): Promise<void> {
  if (!webAppUrl || !webAppUrl.trim()) return;

  try {
    await fetch(webAppUrl.trim(), {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'deleteJob',
        jobId: jobId
      })
    });
  } catch (err) {
    console.warn('Background auto-sync delete job warning:', err);
  }
}

/**
 * Background Auto-Sync: Save users list
 */
export async function autoSyncUsersToGoogleSheet(
  webAppUrl: string,
  users: UserProfile[]
): Promise<void> {
  if (!webAppUrl || !webAppUrl.trim()) return;

  try {
    await fetch(webAppUrl.trim(), {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'saveUsers',
        users: users
      })
    });
  } catch (err) {
    console.warn('Background auto-sync users warning:', err);
  }
}

/**
 * Export Excel Workbook (.xlsx) with all 3 sheets:
 * 1. Jobs
 * 2. Users
 * 3. Settings_MasterData
 */
export function exportAllDataToExcel(
  jobs: CarWashRecord[],
  users: UserProfile[],
  settings: MasterSettingsData
): void {
  // 1. Prepare Jobs Sheet Data
  const jobsData = jobs.map((j, idx) => ({
    'ลำดับ (No.)': idx + 1,
    'รหัสงาน (ID)': j.id,
    'วันที่ (Date)': j.date,
    'ทะเบียนรถ (Plate)': j.licensePlate || '-',
    'เลขตัวถัง (VIN)': j.vinNumber || '-',
    'ยี่ห้อ (Brand)': j.brand,
    'รุ่น (Model)': j.model,
    'สี (Color)': j.color || '-',
    'สถานะการล้าง (Wash Status)': j.washStatus,
    'สาขา (Branch)': j.branch,
    'พนักงานผู้รับผิดชอบ (Staff)': Array.isArray(j.staffNames) ? j.staffNames.join(', ') : '',
    'หมายเหตุ (Notes)': j.notes || '-',
    'ผู้บันทึก (Logged By)': j.loggedBy,
    'วันที่บันทึก (Created At)': j.createdAt,
    'แก้ไขล่าสุด (Updated At)': j.updatedAt
  }));

  // 2. Prepare Users Sheet Data
  const usersData = users.map((u, idx) => ({
    'ลำดับ (No.)': idx + 1,
    'User ID': u.uid,
    'อีเมล (Email)': u.email,
    'ชื่อ-นามสกุล (Name)': u.displayName,
    'สิทธิ์ (Role)': u.role,
    'วันที่สร้าง (Created Date)': u.createdAt,
    'เข้าสู่ระบบล่าสุด (Last Login)': u.lastLoginAt || '-'
  }));

  // 3. Prepare Settings_MasterData Sheet Data
  const settingsData: any[] = [];

  // Brands & Models
  settings.brands.forEach(b => {
    settingsData.push({
      'หมวดหมู่ (Category)': 'Car Brands & Models',
      'รายการหลัก (Item)': b.name,
      'ข้อมูลย่อย (Sub-items / Details)': b.models.join(', ')
    });
  });

  // Colors
  settings.colors.forEach(c => {
    settingsData.push({
      'หมวดหมู่ (Category)': 'Car Colors',
      'รายการหลัก (Item)': c.name,
      'ข้อมูลย่อย (Sub-items / Details)': c.hexCode
    });
  });

  // Branches
  settings.branches.forEach(b => {
    settingsData.push({
      'หมวดหมู่ (Category)': 'Branches',
      'รายการหลัก (Item)': `${b.name} (${b.code})`,
      'ข้อมูลย่อย (Sub-items / Details)': b.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'
    });
  });

  // Employees
  settings.employees.forEach(e => {
    settingsData.push({
      'หมวดหมู่ (Category)': 'Staff Members',
      'รายการหลัก (Item)': e.name + (e.nickname ? ` (${e.nickname})` : ''),
      'ข้อมูลย่อย (Sub-items / Details)': e.isActive ? 'ปฏิบัติงานอยู่' : 'ไม่ได้ปฏิบัติงาน'
    });
  });

  // Create Workbook
  const wb = XLSX.utils.book_new();

  // Create worksheets
  const wsJobs = XLSX.utils.json_to_sheet(jobsData.length > 0 ? jobsData : [{ 'ข้อความ': 'ไม่มีข้อมูลงานล้างรถ' }]);
  const wsUsers = XLSX.utils.json_to_sheet(usersData.length > 0 ? usersData : [{ 'ข้อความ': 'ไม่มีข้อมูลผู้ใช้งาน' }]);
  const wsSettings = XLSX.utils.json_to_sheet(settingsData.length > 0 ? settingsData : [{ 'ข้อความ': 'ไม่มีข้อมูลตั้งค่า' }]);

  // Append sheets
  XLSX.utils.book_append_sheet(wb, wsJobs, 'Jobs');
  XLSX.utils.book_append_sheet(wb, wsUsers, 'Users');
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Settings_MasterData');

  // Trigger file download
  const dateStr = new Date().toISOString().substring(0, 10);
  XLSX.writeFile(wb, `CarWash_Records_${dateStr}.xlsx`);
}
