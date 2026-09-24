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
  DEFAULT_ADMIN_USERS, 
  INITIAL_SAMPLE_RECORDS 
} from './initialData';

const KEYS = {
  RECORDS: 'carwash_records_v1',
  COLORS: 'carwash_colors_v1',
  BRANCHES: 'carwash_branches_v1',
  BRANDS: 'carwash_brands_v1',
  EMPLOYEES: 'carwash_employees_v1',
  USER_ROLES: 'carwash_user_roles_v1',
  SHEET_CONFIG: 'carwash_sheet_config_v1',
  DEMO_SESSION: 'carwash_demo_session_v1',
  SEEDED: 'carwash_seeded_v1'
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

  getUserProfiles: (): UserProfile[] => {
    try {
      const data = localStorage.getItem(KEYS.USER_ROLES);
      return data ? JSON.parse(data) : DEFAULT_ADMIN_USERS;
    } catch {
      return DEFAULT_ADMIN_USERS;
    }
  },
  saveUserProfiles: (users: UserProfile[]) => {
    try {
      localStorage.setItem(KEYS.USER_ROLES, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save user profiles', e);
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

  getDemoSession: (): UserProfile | null => {
    try {
      const data = localStorage.getItem(KEYS.DEMO_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveDemoSession: (user: UserProfile | null) => {
    try {
      if (user) {
        localStorage.setItem(KEYS.DEMO_SESSION, JSON.stringify(user));
      } else {
        localStorage.removeItem(KEYS.DEMO_SESSION);
      }
    } catch (e) {
      console.error('Failed to save demo session', e);
    }
  },

  isSeeded: (): boolean => {
    try {
      return localStorage.getItem(KEYS.SEEDED) === 'true';
    } catch {
      return false;
    }
  },
  setSeeded: (seeded: boolean = true) => {
    try {
      localStorage.setItem(KEYS.SEEDED, String(seeded));
    } catch (e) {
      console.error('Failed to save seeded status', e);
    }
  }
};
