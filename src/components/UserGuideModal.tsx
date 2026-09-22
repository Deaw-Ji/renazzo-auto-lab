import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  UserCheck, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowRight,
  Smartphone,
  FileSpreadsheet,
  Car,
  Wrench,
  Sparkle
} from 'lucide-react';
import { RenazzoLogo } from './RenazzoLogo';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  userRole
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'login' | 'record' | 'purpose' | 'search' | 'faq'>('all');

  if (!isOpen) return null;

  return (
    <div 
      id="user-guide-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="user-guide-modal-container"
        className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 via-sky-50/40 to-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <RenazzoLogo size="sm" />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>คู่มือการใช้งานระบบบันทึกประวัติรถล้าง</span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  สำหรับพนักงาน & ทีมงาน
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                ขั้นตอนการเข้าสู่ระบบ บันทึกข้อมูลรถล้าง วัตถุประสงค์งาน และการค้นหา
              </p>
            </div>
          </div>

          <button
            id="user-guide-close-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Filter Tabs */}
        <div className="px-5 sm:px-8 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            ทั้งหมด (Overview)
          </button>
          <button
            onClick={() => setActiveCategory('login')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === 'login'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1. เข้าสู่ระบบ & สิทธิ์</span>
          </button>
          <button
            onClick={() => setActiveCategory('record')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === 'record'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>2. บันทึกรถล้าง</span>
          </button>
          <button
            onClick={() => setActiveCategory('purpose')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === 'purpose'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Sparkle className="w-3.5 h-3.5" />
            <span>3. วัตถุประสงค์การล้าง (3 แบบ)</span>
          </button>
          <button
            onClick={() => setActiveCategory('search')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === 'search'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>4. ค้นหา & ส่งออก</span>
          </button>
          <button
            onClick={() => setActiveCategory('faq')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              activeCategory === 'faq'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>คำถามที่พบบ่อย (FAQ)</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6 text-slate-700 text-sm">
          
          {/* Section 1: Login & Role Activation */}
          {(activeCategory === 'all' || activeCategory === 'login') && (
            <div id="guide-section-login" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-sky-900 font-bold text-base">
                <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs">1</span>
                <h4>การเข้าสู่ระบบด้วย Google & การเปิดสิทธิ์การใช้งาน</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>บัญชีที่ใช้เข้าสู่ระบบ</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    พนักงานสามารถกดปุ่ม <strong>"เข้าสู่ระบบด้วย Google Account"</strong> โดยใช้ <strong>Google Account ทั่วไป (Gmail ส่วนตัว หรือ อีเมลองค์กร)</strong> ได้ทันที ไม่จำเป็นต้องจำรหัสผ่านแยก
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>การอนุมัติสิทธิ์ครั้งแรก (สำหรับพนักงานใหม่)</span>
                  </div>
                  <p className="text-amber-900 leading-relaxed">
                    เมื่อเข้าสู่ระบบครั้งแรก บัญชีจะได้รับสถานะ <strong>"ผู้เข้าชม (Viewer)"</strong> เพื่อความปลอดภัย ให้แจ้งอีเมลของคุณแก่ <strong>ผู้ดูแลระบบ (Admin)</strong> เพื่อทำการปรับสิทธิ์เป็น <strong>"พนักงานบันทึกข้อมูล (Staff)"</strong> จึงจะเริ่มบันทึกรายการรถล้างได้
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>ระดับสิทธิ์ในระบบ:</strong> Staff (บันทึกข้อมูลและดูประวัติ) | Supervisor (ดู Dashboard และแก้ไขข้อมูล) | Admin (จัดการข้อมูลพื้นฐานและสิทธิ์ผู้ใช้)
                </span>
              </div>
            </div>
          )}

          {/* Section 2: Adding a Car Wash Record */}
          {(activeCategory === 'all' || activeCategory === 'record') && (
            <div id="guide-section-record" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-sky-900 font-bold text-base">
                <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs">2</span>
                <h4>ขั้นตอนการบันทึกข้อมูลรถล้างใหม่ (Add Record)</h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-600">
                เมื่อได้รับสิทธิ์ Staff แล้ว ให้กดปุ่มสีฟ้า <strong>"+ เพิ่มรถล้าง"</strong> ที่แถบเมนูด้านบน หรือปุ่มกลมมุมล่างขวาบนมือถือ
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-sky-600 font-mono">ก.</span>
                    <span>ข้อมูลระบุตัวรถ</span>
                  </div>
                  <ul className="text-slate-600 space-y-1 leading-relaxed text-xs">
                    <li>• <strong>ทะเบียนรถ:</strong> ใส่เลขทะเบียน เช่น <em>1กข 8888 กทม.</em></li>
                    <li>• <strong>เลขตัวถัง (VIN):</strong> สำหรับรถสต็อกที่ยังไม่มีป้ายทะเบียน</li>
                    <li>• <strong>ยี่ห้อ & รุ่น:</strong> เลือกจากรายการที่ระบบเตรียมไว้</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-sky-600 font-mono">ข.</span>
                    <span>สีตัวถัง & ประเภทรถ</span>
                  </div>
                  <ul className="text-slate-600 space-y-1 leading-relaxed text-xs">
                    <li>• <strong>เฉดสีรถ:</strong> กดเลือกพาเลทสีที่ตรงกับตัวรถ</li>
                    <li>• <strong>รถลูกค้า:</strong> กรอกชื่อลูกค้าและเบอร์โทร</li>
                    <li>• <strong>รถสต็อก:</strong> เลือกหมวดรถโชว์รูม/สต็อกส่งมอบ</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-sky-600 font-mono">ค.</span>
                    <span>สาขา & ผู้รับผิดชอบ</span>
                  </div>
                  <ul className="text-slate-600 space-y-1 leading-relaxed text-xs">
                    <li>• <strong>สาขา:</strong> เลือกสาขาที่นำรถเข้าล้าง</li>
                    <li>• <strong>ผู้ล้าง/ผู้รับผิดชอบ:</strong> เลือกลูกทีมที่ทำการล้าง</li>
                    <li>• <strong>หมายเหตุ:</strong> จุดที่ต้องระวังเป็นพิเศษ</li>
                  </ul>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>ระบบบันทึกอัตโนมัติ:</strong> ทันทีที่กด "บันทึกข้อมูล" ข้อมูลจะถูกซิงค์ขึ้นระบบ Cloud และ Google Sheet กลางทันที โดยไม่ต้องส่งไฟล์ให้ยุ่งยาก
                </span>
              </div>
            </div>
          )}

          {/* Section 3: Wash Purposes (Correct 3 Purposes) */}
          {(activeCategory === 'all' || activeCategory === 'purpose') && (
            <div id="guide-section-purpose" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs">3</span>
                <h4>วัตถุประสงค์การล้างรถ (Wash Purposes - 3 ประเภท)</h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-600">
                เมื่อบันทึกข้อมูล ให้เลือกวัตถุประสงค์ที่ตรงกับการนำรถเข้าล้างของคันนั้นๆ เพื่อการจัดสรรงานและสรุปสถิติที่แม่นยำ:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                {/* 1. Detailing New Car Deliver */}
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-purple-200/80 text-purple-900 flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </span>
                    <span>Detailing New Car Deliver</span>
                  </div>
                  <div className="text-xs font-semibold text-purple-800 bg-purple-100/60 px-2 py-0.5 rounded-md inline-block">
                    (เก็บงานรถใหม่)
                  </div>
                  <p className="text-purple-950 text-xs leading-relaxed">
                    สำหรับรถใหม่ป้ายแดง หรือรถสต็อกโชว์รูมที่ต้องเก็บรายละเอียดงานผิวสี ลูบดินน้ำมัน ขัดเงา และเคลือบสีพิเศษเตรียมพร้อมสำหรับการส่งมอบแก่ลูกค้า
                  </p>
                </div>

                {/* 2. Wash For Deliver */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-sky-200/80 text-sky-900 flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </span>
                    <span>Wash For Deliver</span>
                  </div>
                  <div className="text-xs font-semibold text-sky-800 bg-sky-100/60 px-2 py-0.5 rounded-md inline-block">
                    (ล้างทำความสะอาดเตรียมส่งมอบ)
                  </div>
                  <p className="text-sky-950 text-xs leading-relaxed">
                    ล้างทำความสะอาดทั่วไปภายนอก ดูดฝุ่น เช็ดกระจก และเคลือบยาง สำหรับรถที่มีกำหนดส่งมอบให้ลูกค้าในวันนั้นๆ เพื่อความเรียบร้อยสวยงาม
                  </p>
                </div>

                {/* 3. Wash for Service */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-emerald-200/80 text-emerald-900 flex items-center justify-center text-xs font-bold shrink-0">
                      3
                    </span>
                    <span>Wash for Service</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md inline-block">
                    (ล้างเข้าบริการศูนย์)
                  </div>
                  <p className="text-emerald-950 text-xs leading-relaxed">
                    รถของลูกค้าที่นำเข้ามารับบริการตรวจเช็คระยะ, ซ่อมบำรุง, หรือเปลี่ยนถ่ายของเหลวที่ศูนย์บริการ และนำมาล้างทำความสะอาดก่อนส่งมอบรถคืนลูกค้า
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Searching & Exporting */}
          {(activeCategory === 'all' || activeCategory === 'search') && (
            <div id="guide-section-search" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-sky-900 font-bold text-base">
                <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs">4</span>
                <h4>การค้นหาประวัติย้อนหลัง & การส่งออกข้อมูล</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-sky-600" />
                    <span>การค้นหาด่วน (Quick Search)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    พิมพ์เลขทะเบียน, ชื่อลูกค้า, เลข VIN หรือชื่อผู้ล้าง ในช่องค้นหา เพื่อให้ระบบกรองรายการที่ตรงกันขึ้นมาทันที
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>การส่งออกรายงาน (Export CSV)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    กดปุ่ม <strong>"ส่งออก CSV"</strong> เพื่อดาวน์โหลดข้อมูลที่กำลังแสดงอยู่ นำไปเปิดใน Microsoft Excel หรือทำรายงานส่งหัวหน้างานได้ทันที
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: FAQ */}
          {(activeCategory === 'all' || activeCategory === 'faq') && (
            <div id="guide-section-faq" className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <h4>คำถามที่พบบ่อย (FAQ)</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <div className="font-bold text-slate-800">
                    Q: ทำไมล็อกอินแล้วไม่เห็นปุ่ม "+ เพิ่มรถล้าง"?
                  </div>
                  <p className="text-slate-600 mt-1">
                    A: เกิดจากบัญชีของคุณยังอยู่ในสถานะ <strong>Viewer (ผู้เข้าชม)</strong> ให้แจ้งอีเมลของคุณแก่ผู้ดูแลระบบ (Admin) เพื่อทำการกดอนุมัติสิทธิ์ Staff ให้ในระบบครับ
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <div className="font-bold text-slate-800">
                    Q: หากบันทึกข้อมูลผิด เช่น ทะเบียนรถ หรือสีรถ สามารถแก้ไขได้ไหม?
                  </div>
                  <p className="text-slate-600 mt-1">
                    A: การแก้ไขข้อมูลและลบรายการ จะสงวนสิทธิ์ไว้สำหรับ <strong>Supervisor</strong> และ <strong>Admin</strong> เพื่อความถูกต้องของข้อมูล ให้แจ้งหัวหน้างานให้ช่วยกดแก้ไขได้ทันทีครับ
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <div className="font-bold text-slate-800">
                    Q: สามารถใช้งานผ่านโทรศัพท์มือถือ (Smartphone) ได้ไหม?
                  </div>
                  <p className="text-slate-600 mt-1">
                    A: สามารถใช้งานผ่านเบราว์เซอร์บนมือถือได้ 100% หน้าจอจะปรับขนาดให้ใช้งานง่าย มีปุ่มลอยสีฟ้ามุมขวาล่างสำหรับกดเพิ่มรายการได้สะดวกรวดเร็ว
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-8 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            ระบบบันทึกข้อมูลประวัติรถล้าง Renazzo Auto Lab
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
