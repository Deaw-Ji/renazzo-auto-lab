import { 
  CarWashRecord, 
  CarColor, 
  Branch, 
  CarBrand, 
  Employee, 
  UserProfile, 
  GoogleSheetConfig 
} from '../types';
import { 
  INITIAL_COLORS, 
  INITIAL_BRANCHES, 
  INITIAL_BRANDS, 
  INITIAL_EMPLOYEES, 
  DEFAULT_USERS, 
  INITIAL_SAMPLE_RECORDS 
} from './initialData';

const KEYS = {
  RECORDS: 'carwash_records_v2',
  COLORS: 'carwash_colors_v2',
  BRANCHES: 'carwash_branches_v2',
  BRANDS: 'carwash_brands_v2',
  EMPLOYEES: 'carwash_employees_v2',
  USERS: 'carwash_users_v2',
  SHEET_CONFIG: 'carwash_sheet_config_v2',
  CURRENT_USER: 'carwash_current_user_v2',
  PULL_INITIALIZED: 'carwash_pull_initialized_v2'
};

export const storage = {
  getRecords: (): CarWashRecord[] => {
    try {
      const data = localStorage.getItem(KEYS.RECORDS);
      return data ? JSON.parse(data) : INITIAL_SAMPLE_RECORDS;
    } catch {
      return INITIAL_SAMPLE_RECORDS;
    }
  },
  saveRecords: (records: CarWashRecord[]) => {
    try {
      localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
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
      const parsed = JSON.parse(data);
      // Ensure default admin exists
      if (!parsed.some((u: UserProfile) => u.email === 'admin@carcare.com')) {
        parsed.unshift(DEFAULT_USERS[0]);
      }
      return parsed;
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

  getSheetConfig: (): GoogleSheetConfig | null => {
    try {
      const data = localStorage.getItem(KEYS.SHEET_CONFIG);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
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
  }
};
