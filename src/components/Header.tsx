import React from 'react';
import { 
  Sparkles, 
  Table, 
  BarChart3, 
  PlusCircle, 
  Settings, 
  LogOut, 
  FileSpreadsheet, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  User as UserIcon,
  ExternalLink,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { UserProfile, GoogleSheetConfig } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'history';
  setActiveTab: (tab: 'dashboard' | 'history') => void;
  currentUser: UserProfile | null;
  sheetConfig: GoogleSheetConfig | null;
  isSyncing: boolean;
  onOpenNewRecord: () => void;
  onOpenMasterData: () => void;
  onOpenSheetSettings: () => void;
  onOpenUserGuide: () => void;
  onManualSync: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  sheetConfig,
  isSyncing,
  onOpenNewRecord,
  onOpenMasterData,
  onOpenSheetSettings,
  onOpenUserGuide,
  onManualSync,
  onLogout,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const isStaff = currentUser?.role === 'staff';
  const isViewer = currentUser?.role === 'viewer';
  const canViewDashboard = isAdmin || isSupervisor;
  const canAddRecord = isAdmin || isSupervisor || isStaff;

  return (
    <header id="app-main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-xs shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight block">
                Renazzo Auto Lab
              </span>
              <p className="text-xs text-slate-500">
                ระบบบันทึกประวัติรถล้าง
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {canViewDashboard && (
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>สรุปผลงานและสถิติ</span>
              </button>
            )}
            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>ประวัติรถล้าง</span>
            </button>
          </nav>

          {/* Right Action Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Guide Button */}
            <button
              id="header-user-guide-btn"
              onClick={onOpenUserGuide}
              title="คู่มือการใช้งานระบบสำหรับพนักงาน"
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-sky-800 bg-sky-50 hover:bg-sky-100/80 rounded-xl transition-colors border border-sky-200/80 shadow-2xs"
            >
              <HelpCircle className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="hidden lg:inline font-semibold">คู่มือการใช้งาน</span>
              <span className="lg:hidden text-xs font-semibold">คู่มือ</span>
            </button>

            {/* Admin Master Data button */}
            {isAdmin && (
              <button
                id="header-master-data-btn"
                onClick={onOpenMasterData}
                title="จัดการข้อมูลพื้นฐาน (Admin Only)"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200/80"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">จัดการข้อมูลพื้นฐาน</span>
              </button>
            )}

            {/* Quick Add Log Button */}
            {canAddRecord ? (
              <button
                id="header-add-record-btn"
                onClick={onOpenNewRecord}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-sky-500/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มรถล้าง</span>
              </button>
            ) : (
              <div 
                title="สิทธิ์ผู้เข้าชม: รอผู้ดูแลระบบอนุมัติสิทธิ์ในการบันทึกข้อมูล"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>ผู้เข้าชม (ดูอย่างเดียว)</span>
              </div>
            )}

            {/* Google Sheet Master Sync Button / Indicator */}
            {sheetConfig?.isConnected ? (
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  id="header-open-sheet-settings-pill"
                  onClick={onOpenSheetSettings}
                  title="คลิกเพื่อตั้งค่าหรือเปลี่ยน Google Sheet กลาง"
                  className="flex items-center gap-1.5 hover:text-emerald-950 font-semibold transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">Google Sheet กลาง</span>
                  <span className="sm:hidden">ชีตกลาง</span>
                </button>
                <button
                  id="header-manual-sync-btn"
                  title="ซิงค์ข้อมูลล่าสุดกับ Google Sheet"
                  onClick={onManualSync}
                  disabled={isSyncing}
                  className="p-1 hover:bg-emerald-100/80 rounded-md text-emerald-700 transition-colors ml-0.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
                <a
                  id="header-open-sheet-link"
                  href={sheetConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="เปิดไฟล์ใน Google Sheets"
                  className="p-1 hover:bg-emerald-100/80 rounded-md text-emerald-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <button
                id="header-connect-sheet-btn"
                onClick={onOpenSheetSettings}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                title="คลิกเพื่อตั้งค่า Master Google Sheet กลาง"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">ตั้งค่า Google Sheet กลาง</span>
                <span className="sm:hidden">ตั้งค่าชีต</span>
              </button>
            )}

            {/* User Profile / Role info */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
                    {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
                    <span className="max-w-[120px] truncate">{currentUser?.displayName || currentUser?.email}</span>
                    {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline" />}
                  </div>
                  <span className={`text-[10px] font-medium ${isViewer ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                    {isAdmin
                      ? 'ผู้ดูแลระบบ (Admin)'
                      : isSupervisor
                      ? 'หัวหน้างาน (Supervisor)'
                      : isStaff
                      ? 'พนักงาน (Staff)'
                      : 'ผู้เข้าชม (รออนุมัติ)'}
                  </span>
                </div>
              </div>

              <button
                id="header-logout-btn"
                onClick={onLogout}
                title="ออกจากระบบ (Logout)"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          {canViewDashboard && (
            <button
              id="mobile-nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>สรุปผลงานและสถิติ</span>
            </button>
          )}
          <button
            id="mobile-nav-history"
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>ประวัติรถล้าง</span>
          </button>
          {sheetConfig?.isConnected && (
            <button
              id="mobile-nav-sheet-sync"
              onClick={onManualSync}
              title="ซิงค์ Google Sheets"
              className="px-3 py-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>ซิงค์ชีต</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
