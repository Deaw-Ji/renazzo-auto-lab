# Renazzo Auto Lab - Car Wash & Detailing Management System

ระบบบันทึกประวัติรถล้าง สถิติแยกสาขา พนักงาน และซิงค์ Google Sheets / Cloud Firestore แบบเรียลไทม์

## 🚗 คุณสมบัติเด่น (Features)
- **ระบบบันทึกประวัติรถล้าง (Wash Logs)**: บันทึกทะเบียนรถ, เลขตัวถัง (VIN), ยี่ห้อ/รุ่น, สี, สาขา, พนักงานที่รับผิดชอบ, สถานะงานล้าง, และหมายเหตุ
- **ระบบสถิติและสรุปยอด (Analytics Dashboard)**: แสดงกราฟสถิติแยกตามยี่ห้อรถ, สาขา, รายชื่อพนักงาน, กรองตามช่วงวันที่ได้
- **Google Sheets Integration**: ซิงค์ข้อมูลอัตโนมัติเข้ากับ Master Google Sheet กลางขององค์กร
- **Cloud Firestore Real-time Sync**: เชื่อมต่อฐานข้อมูลคลาวด์แบบเรียลไทม์ พนักงานทุกคนบันทึกและเห็นข้อมูลตรงกันทันที
- **ระบบสิทธิ์และการยืนยันตัวตน (Authentication & RBAC)**: รองรับการเข้าสู่ระบบด้วย Google Account พร้อมแบ่งสิทธิ์ Admin และ Staff
- **ระบบจัดการข้อมูลหลัก (Master Data Management)**: จัดการสาขา (Branches) และรายชื่อพนักงาน (Staff)

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Animations & Icons**: Motion, Lucide React
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **External Integration**: Google Sheets API v4

## 📦 การติดตั้งและการรันในเครื่อง (Local Setup)

1. ติดตั้ง Dependencies:
```bash
npm install
```

2. รันโหมด Development:
```bash
npm run dev
```

3. Build สำหรับ Production:
```bash
npm run build
```
