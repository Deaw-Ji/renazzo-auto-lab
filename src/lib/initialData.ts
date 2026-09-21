import { CarColor, Branch, CarBrand, Employee, CarWashRecord, UserProfile } from '../types';

export const INITIAL_COLORS: CarColor[] = [
  { id: 'c1', name: 'ขาว (Pure White)', hexCode: '#FFFFFF' },
  { id: 'c2', name: 'ขาวมุก (Pearl White)', hexCode: '#F8F9FA' },
  { id: 'c3', name: 'ดำ (Solid Black)', hexCode: '#1A1A1A' },
  { id: 'c4', name: 'ดำด้าน (Matte Black)', hexCode: '#2D3142' },
  { id: 'c5', name: 'บรอนซ์เงิน (Silver Metallic)', hexCode: '#C0C0C0' },
  { id: 'c6', name: 'เทาเข้ม (Dark Grey / Magnetite)', hexCode: '#4A5568' },
  { id: 'c7', name: 'น้ำเงิน (Deep Blue / Navy)', hexCode: '#1E3A8A' },
  { id: 'c8', name: 'ฟ้า (Sky / Riviera Blue)', hexCode: '#38BDF8' },
  { id: 'c9', name: 'แดง (Ruby Red)', hexCode: '#DC2626' },
  { id: 'c10', name: 'เขียว (Emerald / British Racing Green)', hexCode: '#047857' },
  { id: 'c11', name: 'เหลือง (Speed Yellow)', hexCode: '#EAB308' },
  { id: 'c12', name: 'ส้ม (Papaya Orange)', hexCode: '#F97316' },
  { id: 'c13', name: 'ทอง (Champagne Gold)', hexCode: '#D4AF37' },
  { id: 'c14', name: 'น้ำตาล (Mocha Brown)', hexCode: '#78350F' },
  { id: 'c15', name: 'อื่นๆ (Custom / Other)', hexCode: '#94A3B8' }
];

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'b1', name: 'สาขาสำนักงานใหญ่ (Headquarters)', code: 'HQ', isActive: true },
  { id: 'b2', name: 'สาขาพระราม 9 (Rama 9)', code: 'R9', isActive: true },
  { id: 'b3', name: 'สาขาสาทร (Sathorn)', code: 'STN', isActive: true },
  { id: 'b4', name: 'สาขาบางนา (Bangna)', code: 'BN', isActive: true },
  { id: 'b5', name: 'สาขาริเวอร์ไซด์ (Riverside)', code: 'RS', isActive: true }
];

export const INITIAL_BRANDS: CarBrand[] = [
  { id: 'br1', name: 'Toyota', models: ['Camry', 'Corolla Cross', 'Yaris Cross', 'Fortuner', 'Alphard', 'Vellfire', 'GR Supra', 'Hilux Revo'] },
  { id: 'br2', name: 'Honda', models: ['Civic', 'CR-V', 'HR-V', 'Accord', 'City', 'StepWGN'] },
  { id: 'br3', name: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'G-Class', 'EQE', 'EQS', 'Maybach'] },
  { id: 'br4', name: 'BMW', models: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'i4', 'iX', 'i7', 'M3', 'M4'] },
  { id: 'br5', name: 'Porsche', models: ['911 Carrera', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Cayman', 'GT3 RS'] },
  { id: 'br6', name: 'BYD', models: ['Atto 3', 'Seal', 'Dolphin', 'Sealion 6', 'M6'] },
  { id: 'br7', name: 'Tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'] },
  { id: 'br8', name: 'Lamborghini', models: ['Huracán', 'Urus', 'Revuelto', 'Aventador'] },
  { id: 'br9', name: 'Ferrari', models: ['296 GTB', 'SF90 Stradale', 'Purosangue', 'Roma', 'F8 Tributo'] },
  { id: 'br10', name: 'Audi', models: ['A4', 'A6', 'Q5', 'Q7', 'Q8 e-tron', 'RS6 Avant'] },
  { id: 'br11', name: 'Volvo', models: ['XC60', 'XC90', 'EX30', 'EX90', 'C40 Recharge'] },
  { id: 'br12', name: 'Lexus', models: ['LM350h', 'RX450h', 'NX350h', 'ES300h', 'LC500'] },
  { id: 'br13', name: 'Ford', models: ['Ranger', 'Everest', 'Mustang'] },
  { id: 'br14', name: 'Mazda', models: ['Mazda 2', 'Mazda 3', 'CX-30', 'CX-5', 'CX-8'] },
  { id: 'br15', name: 'อื่นๆ (Other)', models: [] }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'สมชาย แจ่มใส', nickname: 'ชาย', isActive: true, branchId: 'b1' },
  { id: 'e2', name: 'วิชัย ภักดี', nickname: 'ชัย', isActive: true, branchId: 'b1' },
  { id: 'e3', name: 'อนุรักษ์ มั่นคง', nickname: 'รักษ์', isActive: true, branchId: 'b2' },
  { id: 'e4', name: 'ธนกฤต เจริญผล', nickname: 'กฤต', isActive: true, branchId: 'b2' },
  { id: 'e5', name: 'ภาณุพงศ์ ศรีสุข', nickname: 'พงศ์', isActive: true, branchId: 'b3' },
  { id: 'e6', name: 'นัฐพล วงษ์สุวรรณ', nickname: 'นัฐ', isActive: true, branchId: 'b3' },
  { id: 'e7', name: 'เอกชัย ชูเกียรติ', nickname: 'เอก', isActive: true, branchId: 'b4' },
  { id: 'e8', name: 'กิตติศักดิ์ บุญเรือง', nickname: 'ศักดิ์', isActive: true, branchId: 'b4' },
  { id: 'e9', name: 'ธีรเดช เจริญสุข', nickname: 'เดช', isActive: true, branchId: 'b5' }
];

export const DEFAULT_ADMIN_USERS: UserProfile[] = [
  {
    uid: 'admin-jira',
    email: 'jira.a@premium-auto.co.th',
    displayName: 'Jira A. (Admin)',
    role: 'admin',
  },
  {
    uid: 'admin-default',
    email: 'admin@premium-auto.co.th',
    displayName: 'System Administrator',
    role: 'admin',
  },
  {
    uid: 'sup-demo',
    email: 'supervisor@premium-auto.co.th',
    displayName: 'หัวหน้างาน (Supervisor)',
    role: 'supervisor',
  }
];

export const INITIAL_SAMPLE_RECORDS: CarWashRecord[] = [
  {
    id: 'CW-202609-001',
    date: '2026-09-19',
    licensePlate: '9กก 8899',
    vinNumber: 'WBA53AY060FS99201',
    brand: 'BMW',
    model: '5 Series',
    color: 'ขาวมุก (Pearl White)',
    washStatus: 'Detailing New Car Deliver',
    branch: 'สาขาสำนักงานใหญ่ (Headquarters)',
    staffNames: ['สมชาย แจ่มใส', 'วิชัย ภักดี'],
    notes: 'ตรวจเช็คความเรียบร้อยรอบคัน เคลือบเงาสีพร้อมส่งมอบลูกค้า VIP',
    loggedBy: 'jira.a@premium-auto.co.th',
    loggedByEmail: 'jira.a@premium-auto.co.th',
    createdAt: '2026-09-19T08:30:00Z',
    updatedAt: '2026-09-19T08:30:00Z',
    syncedToSheet: false
  },
  {
    id: 'CW-202609-002',
    date: '2026-09-19',
    licensePlate: 'กข 1234',
    vinNumber: 'WP0AB2A92MSA77123',
    brand: 'Porsche',
    model: 'Cayenne',
    color: 'ดำ (Solid Black)',
    washStatus: 'Wash For Deliver',
    branch: 'สาขาพระราม 9 (Rama 9)',
    staffNames: ['อนุรักษ์ มั่นคง', 'ธนกฤต เจริญผล'],
    notes: 'ล้างทำความสะอาดภายนอกและดูดฝุ่นภายในอย่างละเอียดก่อนส่งมอบ',
    loggedBy: 'jira.a@premium-auto.co.th',
    loggedByEmail: 'jira.a@premium-auto.co.th',
    createdAt: '2026-09-19T09:15:00Z',
    updatedAt: '2026-09-19T09:15:00Z',
    syncedToSheet: false
  },
  {
    id: 'CW-202609-003',
    date: '2026-09-19',
    licensePlate: '',
    vinNumber: 'LRW3E7EK9PC558901',
    brand: 'Tesla',
    model: 'Model Y',
    color: 'บรอนซ์เงิน (Silver Metallic)',
    washStatus: 'Wash for Service',
    branch: 'สาขาสาทร (Sathorn)',
    staffNames: ['ภาณุพงศ์ ศรีสุข'],
    notes: 'รถไม่มีป้ายทะเบียน (ใช้เลข VIN) ล้างหลังตรวจเช็คระยะ 20,000 กม.',
    loggedBy: 'staff@premium-auto.co.th',
    loggedByEmail: 'staff@premium-auto.co.th',
    createdAt: '2026-09-19T10:00:00Z',
    updatedAt: '2026-09-19T10:00:00Z',
    syncedToSheet: false
  },
  {
    id: 'CW-202609-004',
    date: '2026-09-18',
    licensePlate: '3ขข 5566',
    vinNumber: 'W1KZF8HB3NA889100',
    brand: 'Mercedes-Benz',
    model: 'GLC',
    color: 'เทาเข้ม (Dark Grey / Magnetite)',
    washStatus: 'Detailing New Car Deliver',
    branch: 'สาขาบางนา (Bangna)',
    staffNames: ['เอกชัย ชูเกียรติ', 'กิตติศักดิ์ บุญเรือง'],
    notes: 'ขัดเคลือบสีเตรียมส่งมอบรถใหม่ป้ายแดง',
    loggedBy: 'jira.a@premium-auto.co.th',
    loggedByEmail: 'jira.a@premium-auto.co.th',
    createdAt: '2026-09-18T13:45:00Z',
    updatedAt: '2026-09-18T13:45:00Z',
    syncedToSheet: false
  },
  {
    id: 'CW-202609-005',
    date: '2026-09-18',
    licensePlate: '6กง 9012',
    vinNumber: 'MR0BA3BB3N0129384',
    brand: 'Toyota',
    model: 'Alphard',
    color: 'ขาว (Pure White)',
    washStatus: 'Wash for Service',
    branch: 'สาขาสำนักงานใหญ่ (Headquarters)',
    staffNames: ['สมชาย แจ่มใส'],
    notes: 'ล้างทำความสะอาดทั่วไปสำหรับรถเข้าซ่อมบำรุง',
    loggedBy: 'staff@premium-auto.co.th',
    loggedByEmail: 'staff@premium-auto.co.th',
    createdAt: '2026-09-18T15:20:00Z',
    updatedAt: '2026-09-18T15:20:00Z',
    syncedToSheet: false
  }
];
