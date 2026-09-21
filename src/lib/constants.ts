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
