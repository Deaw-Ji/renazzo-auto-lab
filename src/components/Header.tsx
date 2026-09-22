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
import { RenazzoLogo } from './RenazzoLogo';

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
          <div className="flex items-center py-1">
            <RenazzoLogo 
              size="md" 
              showSubtitle={true} 
              subtitleText="ระบบบันทึกประวัติรถล้าง"
            />
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
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* User Guide Button (Yellow accent, compact & clean) */}
            <button
              id="header-user-guide-btn"
              onClick={onOpenUserGuide}
              title="คู่มือการใช้งานระบบสำหรับพนักงาน"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200 shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">คู่มือการใช้งาน</span>
              <span className="sm:hidden">คู่มือ</span>
            </button>

            {/* Admin Master Data button (Desktop / Tablet) */}
            {isAdmin && (
              <button
                id="header-master-data-btn"
                onClick={onOpenMasterData}
                title="จัดการข้อมูลพื้นฐาน (Admin Only)"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200/80 whitespace-nowrap shrink-0"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span>จัดการข้อมูลพื้นฐาน</span>
              </button>
            )}

            {/* Quick Add Log Button (Shown on desktop only; Mobile uses the floating + button) */}
            {canAddRecord ? (
              <button
                id="header-add-record-btn"
                onClick={onOpenNewRecord}
                className="hidden sm:flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-sky-500/20 transition-all whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มรถล้าง</span>
              </button>
            ) : (
              <div 
                title="สิทธิ์ผู้เข้าชม: รอผู้ดูแลระบบอนุมัติสิทธิ์ในการบันทึกข้อมูล"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>ผู้เข้าชม (ดูอย่างเดียว)</span>
              </div>
            )}

            {/* Google Sheet Master Sync Button / Indicator (ADMIN ONLY, Desktop only to prevent mobile clutter) */}
            {isAdmin && (
              sheetConfig?.isConnected ? (
                <div className="hidden lg:flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0">
                  <button
                    type="button"
                    id="header-open-sheet-settings-pill"
                    onClick={onOpenSheetSettings}
                    title="คลิกเพื่อตั้งค่าหรือเปลี่ยน Google Sheet กลาง"
                    className="flex items-center gap-1.5 hover:text-emerald-950 font-semibold transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Google Sheet กลาง</span>
                  </button>
                  <button
                    id="header-manual-sync-btn"
                    title="ซิงค์ข้อมูลล่าสุดกับ Google Sheet"
                    onClick={onManualSync}
                    disabled={isSyncing}
                    className="p-1 hover:bg-emerald-100/80 rounded-md text-emerald-700 transition-colors ml-0.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                  <a
                    id="header-open-sheet-link"
                    href={sheetConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="เปิดไฟล์ใน Google Sheets"
                    className="p-1 hover:bg-emerald-100/80 rounded-md text-emerald-700 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <button
                  id="header-connect-sheet-btn"
                  onClick={onOpenSheetSettings}
                  className="hidden lg:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="คลิกเพื่อตั้งค่า Master Google Sheet กลาง"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ตั้งค่า Google Sheet กลาง</span>
                </button>
              )
            )}

            {/* User Profile / Role info */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs shrink-0">
                    {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>
                )}
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1 whitespace-nowrap">
                    <span className="max-w-[120px] truncate">{currentUser?.displayName || currentUser?.email}</span>
                    {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline" />}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${isViewer ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
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
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-1.5 border-t border-slate-100 gap-1">
          {canViewDashboard && (
            <button
              id="mobile-nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span>สรุปผลงานและสถิติ</span>
            </button>
          )}
          <button
            id="mobile-nav-history"
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Table className="w-3.5 h-3.5 shrink-0" />
            <span>ประวัติรถล้าง</span>
          </button>
        </div>
      </div>
    </header>
  );
};
