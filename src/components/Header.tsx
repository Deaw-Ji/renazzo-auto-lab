import React, { useState } from 'react';
import { 
  Table, 
  BarChart3, 
  PlusCircle, 
  Settings, 
  LogOut, 
  FileSpreadsheet, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Calculator,
  UserCheck,
  User as UserIcon,
  HelpCircle,
  Users,
  KeyRound,
  Download,
  ChevronDown
} from 'lucide-react';
import { UserProfile, GoogleSheetConfig, UserRole } from '../types';
import { RenazzoLogo } from './RenazzoLogo';

interface HeaderProps {
  activeTab: 'dashboard' | 'history';
  setActiveTab: (tab: 'dashboard' | 'history') => void;
  currentUser: UserProfile;
  sheetConfig: GoogleSheetConfig | null;
  isSyncing: boolean;
  onOpenNewRecord: () => void;
  onOpenMasterData: () => void;
  onOpenUserManagement: () => void;
  onOpenSheetSettings: () => void;
  onOpenUserGuide: () => void;
  onOpenChangePassword: () => void;
  onManualSync: () => void;
  onExportExcel: () => void;
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
  onOpenUserManagement,
  onOpenSheetSettings,
  onOpenUserGuide,
  onOpenChangePassword,
  onManualSync,
  onExportExcel,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAdmin = currentUser.role === 'Admin';
  const isAccounting = currentUser.role === 'Accounting';
  const isOfficer = currentUser.role === 'Administration Officer';

  // Permissions:
  // Admin & Accounting can see Dashboard summary/reports
  const canViewDashboard = isAdmin || isAccounting;
  // All roles can add record
  const canAddRecord = true;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Admin</span>
          </span>
        );
      case 'Accounting':
        return (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Calculator className="w-3 h-3" />
            <span>Accounting</span>
          </span>
        );
      case 'Administration Officer':
        return (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            <span>Officer</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header id="app-main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs font-['Sarabun',sans-serif]">
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
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* User Guide Button */}
            <button
              id="header-user-guide-btn"
              onClick={onOpenUserGuide}
              title="คู่มือการใช้งานระบบ"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200 cursor-pointer shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">คู่มือ</span>
            </button>

            {/* Export Excel Button (Available to Admin & Accounting) */}
            {(isAdmin || isAccounting) && (
              <button
                id="header-export-excel-btn"
                onClick={onExportExcel}
                title="Export ข้อมูลเป็นไฟล์ Excel (.xlsx) ครบ 3 แท็บ"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>
            )}

            {/* Admin Settings button */}
            {isAdmin && (
              <button
                id="header-master-data-btn"
                onClick={onOpenMasterData}
                title="การตั้งค่า รุ่นรถ/สีรถ/สาขา/พนักงาน/ผู้ใช้งาน (Admin)"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200/80 shrink-0 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>การตั้งค่า</span>
              </button>
            )}

            {/* Google Sheet Sync Button / Indicator (Admin & Accounting) */}
            {isAdmin && (
              <button
                id="header-sheet-settings-btn"
                onClick={onOpenSheetSettings}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  sheetConfig?.isConnected
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
                title="ตั้งค่า Google Sheet กลาง 3 แท็บ"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">{sheetConfig?.isConnected ? 'Google Sheet 3 แท็บ' : 'เชื่อมต่อ Sheet'}</span>
                {isSyncing && <RefreshCw className="w-3 h-3 animate-spin text-emerald-600 ml-1" />}
              </button>
            )}

            {/* Quick Add Log Button */}
            {canAddRecord && (
              <button
                id="header-add-record-btn"
                onClick={onOpenNewRecord}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs shadow-sky-500/20 active:scale-98 transition-all shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มรถล้าง</span>
              </button>
            )}

            {/* User Profile / Menu Dropdown */}
            <div className="relative pl-1 sm:pl-2 border-l border-slate-200 shrink-0">
              <button
                id="header-user-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight max-w-[120px] truncate">
                    {currentUser.displayName}
                  </div>
                  <div className="mt-0.5">
                    {getRoleBadge(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser.displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                  </div>

                  <div className="py-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenMasterData();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4 text-slate-600" />
                          <span>การตั้งค่า</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenSheetSettings();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span>ตั้งค่า Google Sheet กลาง</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onExportExcel();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Export Excel (.xlsx) 3 แท็บ</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenChangePassword();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>เปลี่ยนรหัสผ่าน (Change Password)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenUserGuide();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>คู่มือการใช้งาน</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
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
              <span>สรุปผลงาน</span>
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
