export type WashStatusType = 
  | 'Detailing New Car Deliver'
  | 'Wash For Deliver'
  | 'Wash for Service';

export interface CarWashRecord {
  id: string;
  date: string; // YYYY-MM-DD
  licensePlate: string;
  vinNumber: string;
  brand: string;
  model: string;
  color: string;
  washStatus: WashStatusType;
  branch: string;
  staffNames: string[]; // Multiple staff members
  notes: string;
  loggedBy: string; // User email or name
  loggedByEmail?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  syncedToSheet?: boolean;
  sheetRowIndex?: number; // Row index in Google Sheet for quick update/delete
}

export interface CarColor {
  id: string;
  name: string;
  hexCode: string;
  isDefault?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CarBrand {
  id: string;
  name: string;
  models: string[];
}

export interface Employee {
  id: string;
  name: string;
  nickname?: string;
  branchId?: string;
  isActive: boolean;
}

export type UserRole = 'admin' | 'supervisor' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  allowedBranches?: string[]; // empty means all branches
}

export interface GoogleSheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
  lastSyncedAt?: string;
  autoSync: boolean;
  isConnected: boolean;
}

export interface FilterState {
  month: string; // YYYY-MM
  branch: string; // 'all' or branch name
  status: string; // 'all' or WashStatusType
  searchQuery: string;
  staff: string; // 'all' or staff name
  startDate?: string;
  endDate?: string;
}
