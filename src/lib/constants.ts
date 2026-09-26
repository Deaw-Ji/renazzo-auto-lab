import { WashStatusType } from '../types';

export interface StatusConfig {
  id: WashStatusType;
  label: string;
  subLabel: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
  cardBg: string;
  accentColor: string;
  iconName: string;
}

export const STATUS_CONFIGS: Record<WashStatusType, StatusConfig> = {
  'Detailing New Car Deliver': {
    id: 'Detailing New Car Deliver',
    label: 'Detailing New Car Deliver',
    subLabel: 'ส่งมอบรถใหม่ (ดีเทลลิ่งพิเศษ)',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeBorder: 'border-emerald-300',
    badgeText: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
    cardBg: 'bg-emerald-500/10 border-emerald-200',
    accentColor: '#059669',
    iconName: 'Sparkles'
  },
  'Wash For Deliver': {
    id: 'Wash For Deliver',
    label: 'Wash For Deliver',
    subLabel: 'ล้างทำความสะอาดเตรียมส่งมอบ',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
    badgeBorder: 'border-sky-300',
    badgeText: 'text-sky-700',
    dotColor: 'bg-sky-500',
    cardBg: 'bg-sky-500/10 border-sky-200',
    accentColor: '#0284c7',
    iconName: 'Car'
  },
  'Wash for Service': {
    id: 'Wash for Service',
    label: 'Wash for Service',
    subLabel: 'ล้างรถเข้าเช็คระยะ / บริการศูนย์',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
    badgeBorder: 'border-amber-300',
    badgeText: 'text-amber-700',
    dotColor: 'bg-amber-500',
    cardBg: 'bg-amber-500/10 border-amber-200',
    accentColor: '#d97706',
    iconName: 'Wrench'
  }
};

export const WASH_STATUS_OPTIONS: WashStatusType[] = [
  'Detailing New Car Deliver',
  'Wash For Deliver',
  'Wash for Service'
];

/**
 * Sorts strings with English (A-Z / Latin / Numbers) first, and Thai (ก-ฮ) at the bottom.
 */
export const sortEnFirstThenTh = (a: string = '', b: string = ''): number => {
  const strA = (a || '').trim();
  const strB = (b || '').trim();

  const aStartsWithThai = /^[\u0E00-\u0E7F]/.test(strA);
  const bStartsWithThai = /^[\u0E00-\u0E7F]/.test(strB);

  // English/Numbers first, Thai at bottom
  if (!aStartsWithThai && bStartsWithThai) return -1;
  if (aStartsWithThai && !bStartsWithThai) return 1;

  return strA.localeCompare(strB, aStartsWithThai ? 'th' : 'en', {
    sensitivity: 'base',
    numeric: true
  });
};

/**
 * Normalizes any date input from Google Sheets, Excel, or LocalStorage into 'YYYY-MM-DD'
 * Supports:
 * - Standard 'YYYY-MM-DD' / 'YYYY/MM/DD'
 * - Thai / UK 'DD/MM/YYYY' or 'DD-MM-YYYY' (including Buddhist Era years >= 2400)
 * - JS Date strings like 'Wed Sep 23 2026 00:00:00 GMT+0700...'
 * - ISO timestamps like '2026-09-22T17:00:00.000Z' (converted to Asia/Bangkok timezone)
 */
export const normalizeDateToYMD = (
  raw: unknown,
  fallbackCreatedAt?: unknown,
  fallbackId?: unknown
): string => {
  const tryParseSingle = (val: unknown): string | null => {
    if (val === null || val === undefined || val === '') return null;

    if (val instanceof Date) {
      if (isNaN(val.getTime())) return null;
      return formatDateInBangkok(val);
    }

    // Excel serial date number (e.g. 45000 - 55000)
    if (typeof val === 'number' && val > 30000 && val < 70000) {
      const utcDays = Math.floor(val - 25569);
      const d = new Date(utcDays * 86400 * 1000);
      if (!isNaN(d.getTime())) return formatDateInBangkok(d);
    }

    const str = String(val).trim().replace(/^'+/, '');
    if (!str) return null;

    // 1. YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD (date only, no 'T')
    const ymdMatch = str.match(/^(\d{4})[\-\/\.](\d{1,2})[\-\/\.](\d{1,2})$/);
    if (ymdMatch) {
      let y = parseInt(ymdMatch[1], 10);
      let m = parseInt(ymdMatch[2], 10);
      let d = parseInt(ymdMatch[3], 10);
      if (y >= 2400) y -= 543;
      if (m > 12 && d <= 12) {
        const tmp = m;
        m = d;
        d = tmp;
      }
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }

    // 2. DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (with optional time)
    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:\s.*)?$/);
    if (dmyMatch) {
      const p1 = parseInt(dmyMatch[1], 10);
      const p2 = parseInt(dmyMatch[2], 10);
      let y = parseInt(dmyMatch[3], 10);
      if (y >= 2400) y -= 543;
      let d = p1;
      let m = p2;
      if (p2 > 12 && p1 <= 12) {
        m = p1;
        d = p2;
      }
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }

    // 3. DD/MM/YY (2-digit year)
    const dmyShortMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})(?:\s.*)?$/);
    if (dmyShortMatch) {
      const p1 = parseInt(dmyShortMatch[1], 10);
      const p2 = parseInt(dmyShortMatch[2], 10);
      const y2 = parseInt(dmyShortMatch[3], 10);
      const y = y2 >= 60 ? 2500 + y2 - 543 : 2000 + y2;
      let d = p1;
      let m = p2;
      if (p2 > 12 && p1 <= 12) {
        m = p1;
        d = p2;
      }
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }

    // 4. Full JS Date string ("Wed Sep 23 2026...") or ISO string ("2026-09-22T17:00:00.000Z")
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return formatDateInBangkok(parsed);
    }

    return null;
  };

  const direct = tryParseSingle(raw);
  if (direct) return direct;

  // Try extracting from ID like CW-20260923-XXXX
  if (fallbackId) {
    const idStr = String(fallbackId);
    const idFullMatch = idStr.match(/CW-(\d{4})(\d{2})(\d{2})/i);
    if (idFullMatch) {
      let y = parseInt(idFullMatch[1], 10);
      if (y >= 2400) y -= 543;
      return `${y}-${idFullMatch[2]}-${idFullMatch[3]}`;
    }
  }

  // Try fallbackCreatedAt
  const fromCreated = tryParseSingle(fallbackCreatedAt);
  if (fromCreated) return fromCreated;

  return formatDateInBangkok(new Date());
};

function formatDateInBangkok(d: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d);
    const yearStr = parts.find(p => p.type === 'year')?.value;
    const monthStr = parts.find(p => p.type === 'month')?.value;
    const dayStr = parts.find(p => p.type === 'day')?.value;
    if (yearStr && monthStr && dayStr) {
      let y = parseInt(yearStr, 10);
      if (y >= 2400) y -= 543;
      return `${y}-${monthStr}-${dayStr}`;
    }
  } catch {
    // Fallback to local date getters
  }
  let y = d.getFullYear();
  if (y >= 2400) y -= 543;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Normalizes wash status string from Google Sheets into a valid WashStatusType
 */
export const normalizeWashStatus = (raw: unknown): WashStatusType => {
  const str = String(raw || '').trim();
  if (
    str === 'Detailing New Car Deliver' ||
    str === 'Wash For Deliver' ||
    str === 'Wash for Service'
  ) {
    return str;
  }
  const lower = str.toLowerCase();
  if (lower.includes('detailing')) return 'Detailing New Car Deliver';
  if (lower.includes('service') || lower.includes('เซอร์วิส') || lower.includes('ศูนย์')) return 'Wash for Service';
  if (lower.includes('deliver') || lower.includes('ส่งมอบ')) return 'Wash For Deliver';
  return 'Detailing New Car Deliver';
};

