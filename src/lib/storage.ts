import { 
  CarWashRecord, 
  CarColor, 
  Branch, 
  CarBrand, 
  Employee, 
  UserProfile, 
  GoogleSheetConfig,
  RoleConfig
} from '../types';
import { 
  INITIAL_COLORS, 
  INITIAL_BRANCHES, 
  INITIAL_BRANDS, 
  INITIAL_EMPLOYEES, 
  DEFAULT_USERS, 
  INITIAL_SAMPLE_RECORDS,
  INITIAL_ROLES,
  DEFAULT_SHEET_CONFIG
} from './initialData';
import { normalizeDateToYMD, normalizeWashStatus } from './constants';

const KEYS = {
  RECORDS: 'carwash_records_v2',
  COLORS: 'carwash_colors_v2',
  BRANCHES: 'carwash_branches_v2',
  BRANDS: 'carwash_brands_v2',
  EMPLOYEES: 'carwash_employees_v2',
  USERS: 'carwash_users_v2',
  ROLES: 'carwash_roles_v2',
  SHEET_CONFIG: 'carwash_sheet_config_v2',
  CURRENT_USER: 'carwash_current_user_v2',
  PULL_INITIALIZED: 'carwash_pull_initialized_v2'
};

const sanitizeRecords = (list: CarWashRecord[]): CarWashRecord[] => {
  if (!Array.isArray(list)) return INITIAL_SAMPLE_RECORDS;
  return list.map(r => ({
    ...r,
    id: String(r.id || `CW-${Date.now()}`),
    date: normalizeDateToYMD(r.date, r.createdAt, r.id),
    licensePlate: r.licensePlate === '-' ? '' : String(r.licensePlate || '').trim(),
    vinNumber: r.vinNumber === '-' ? '' : String(r.vinNumber || '').trim(),
    brand: String(r.brand || ''),
    model: String(r.model || ''),
    color: String(r.color || ''),
    washStatus: normalizeWashStatus(r.washStatus),
    branch: String(r.branch || ''),
    staffNames: Array.isArray(r.staffNames)
      ? r.staffNames.map(s => String(s).trim()).filter(Boolean)
      : typeof (r.staffNames as any) === 'string' && String(r.staffNames).trim()
        ? String(r.staffNames).split(',').map(s => s.trim()).filter(Boolean)
        : [],
    notes: String(r.notes || ''),
    loggedBy: String(r.loggedBy || '')
  }));
};

export const storage = {
  getRecords: (): CarWashRecord[] => {
    try {
      const data = localStorage.getItem(KEYS.RECORDS);
      return data ? sanitizeRecords(JSON.parse(data)) : INITIAL_SAMPLE_RECORDS;
    } catch {
      return INITIAL_SAMPLE_RECORDS;
    }
  },
  saveRecords: (records: CarWashRecord[]) => {
    try {
      localStorage.setItem(KEYS.RECORDS, JSON.stringify(sanitizeRecords(records)));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  },

  getColors: (): CarColor[] => {
    try {
      const data = localStorage.getItem(KEYS.COLORS);
      return data ? JSON.parse(data) : INITIAL_COLORS;
    } catch {
      return INITIAL_COLORS;
    }
  },
  saveColors: (colors: CarColor[]) => {
    try {
      localStorage.setItem(KEYS.COLORS, JSON.stringify(colors));
    } catch (e) {
      console.error('Failed to save colors', e);
    }
  },

  getBranches: (): Branch[] => {
    try {
      const data = localStorage.getItem(KEYS.BRANCHES);
      return data ? JSON.parse(data) : INITIAL_BRANCHES;
    } catch {
      return INITIAL_BRANCHES;
    }
  },
  saveBranches: (branches: Branch[]) => {
    try {
      localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
    } catch (e) {
      console.error('Failed to save branches', e);
    }
  },

  getBrands: (): CarBrand[] => {
    try {
      const data = localStorage.getItem(KEYS.BRANDS);
      return data ? JSON.parse(data) : INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  },
  saveBrands: (brands: CarBrand[]) => {
    try {
      localStorage.setItem(KEYS.BRANDS, JSON.stringify(brands));
    } catch (e) {
      console.error('Failed to save brands', e);
    }
  },

  getEmployees: (): Employee[] => {
    try {
      const data = localStorage.getItem(KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  },
  saveEmployees: (employees: Employee[]) => {
    try {
      localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error('Failed to save employees', e);
    }
  },

  getUsers: (): UserProfile[] => {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      if (!data) return DEFAULT_USERS;
      const parsed: UserProfile[] = JSON.parse(data);
      // Ensure default admin exists
      if (!parsed.some((u: UserProfile) => u.email === 'admin@carcare.com')) {
        parsed.unshift(DEFAULT_USERS[0]);
      }
      // Upgrade stale initial placeholder password for jira.a@premium-auto.co.th if still at initial timestamp
      return parsed.map(u => {
        if (
          u.email.toLowerCase() === 'jira.a@premium-auto.co.th' &&
          u.password === 'admin1234' &&
          u.lastLoginAt === '2026-09-25T09:15:00Z'
        ) {
          return { ...u, password: 'Deaw6229', lastLoginAt: '2026-09-30T09:10:54.508Z' };
        }
        return u;
      });
    } catch {
      return DEFAULT_USERS;
    }
  },
  saveUsers: (users: UserProfile[]) => {
    try {
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  },

  getRoles: (): RoleConfig[] => {
    try {
      const data = localStorage.getItem(KEYS.ROLES);
      if (!data) return INITIAL_ROLES;
      const parsed: RoleConfig[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_ROLES;
      // Ensure Admin role always exists
      if (!parsed.some(r => r.name === 'Admin')) {
        parsed.unshift(INITIAL_ROLES[0]);
      }
      return parsed;
    } catch {
      return INITIAL_ROLES;
    }
  },
  saveRoles: (roles: RoleConfig[]) => {
    try {
      localStorage.setItem(KEYS.ROLES, JSON.stringify(roles));
    } catch (e) {
      console.error('Failed to save roles', e);
    }
  },

  getSheetConfig: (): GoogleSheetConfig | null => {
    try {
      const data = localStorage.getItem(KEYS.SHEET_CONFIG);
      if (!data) return DEFAULT_SHEET_CONFIG;
      const parsed = JSON.parse(data);
      return parsed && parsed.webAppUrl ? parsed : DEFAULT_SHEET_CONFIG;
    } catch {
      return DEFAULT_SHEET_CONFIG;
    }
  },
  saveSheetConfig: (config: GoogleSheetConfig | null) => {
    try {
      if (config) {
        localStorage.setItem(KEYS.SHEET_CONFIG, JSON.stringify(config));
      } else {
        localStorage.removeItem(KEYS.SHEET_CONFIG);
      }
    } catch (e) {
      console.error('Failed to save sheet config', e);
    }
  },

  getCurrentUser: (): UserProfile | null => {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveCurrentUser: (user: UserProfile | null) => {
    try {
      if (user) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error('Failed to save current user', e);
    }
  },

  isPullInitialized: (): boolean => {
    try {
      return localStorage.getItem(KEYS.PULL_INITIALIZED) === 'true';
    } catch {
      return false;
    }
  },
  setPullInitialized: (val: boolean = true) => {
    try {
      localStorage.setItem(KEYS.PULL_INITIALIZED, String(val));
    } catch (e) {
      console.error('Failed to save pull initialized flag', e);
    }
  },

  mergeUsers: (existing: UserProfile[], incoming: UserProfile[]): UserProfile[] => {
    const map = new Map<string, UserProfile>();
    for (const u of DEFAULT_USERS) {
      map.set(u.email.toLowerCase().trim(), {
        ...u,
        password: String(u.password || 'admin1234').trim()
      });
    }
    for (const u of existing || []) {
      if (u && u.email) {
        map.set(u.email.toLowerCase().trim(), {
          ...u,
          email: u.email.toLowerCase().trim(),
          password: String(u.password || 'admin1234').trim()
        });
      }
    }
    for (const u of incoming || []) {
      if (u && u.email) {
        const key = u.email.toLowerCase().trim();
        const prev = map.get(key);
        map.set(key, {
          ...(prev || {}),
          ...u,
          email: key,
          password: u.password !== undefined && u.password !== null && String(u.password).trim() !== ''
            ? String(u.password).trim()
            : (prev?.password || 'admin1234')
        });
      }
    }
    return Array.from(map.values());
  },

  fetchSharedState: async (): Promise<{
    sheetConfig?: GoogleSheetConfig | null;
    users?: UserProfile[];
    roles?: RoleConfig[];
    records?: CarWashRecord[];
    colors?: CarColor[];
    branches?: Branch[];
    brands?: CarBrand[];
    employees?: Employee[];
  } | null> => {
    try {
      const res = await fetch('/api/shared-state', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch {
      return null;
    }
  },

  pushSharedState: async (payload: {
    sheetConfig?: GoogleSheetConfig | null;
    users?: UserProfile[];
    replaceUsers?: boolean;
    roles?: RoleConfig[];
    records?: CarWashRecord[];
    colors?: CarColor[];
    branches?: Branch[];
    brands?: CarBrand[];
    employees?: Employee[];
  }): Promise<void> => {
    try {
      await fetch('/api/shared-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // Ignore network errors if offline
    }
  }
};
