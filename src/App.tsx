/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { storage } from './lib/storage';
import { 
  authenticateUser, 
  changeUserPassword, 
  addNewUser, 
  updateUserDetails, 
  adminResetUserPassword, 
  removeUser 
} from './lib/authService';
import { 
  pullDataFromGoogleSheet, 
  pushAllToGoogleSheet, 
  autoSyncJobToGoogleSheet, 
  autoSyncDeleteJobFromGoogleSheet, 
  autoSyncUsersToGoogleSheet, 
  exportAllDataToExcel 
} from './lib/googleSheetsService';
import { 
  CarWashRecord, 
  UserProfile, 
  UserRole,
  GoogleSheetConfig, 
  FilterState, 
  CarColor, 
  Branch, 
  CarBrand, 
  Employee,
  MasterSettingsData
} from './types';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { RecordFormModal } from './components/RecordFormModal';
import { MasterDataModal } from './components/MasterDataModal';
import { UserManagementModal } from './components/UserManagementModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { UserGuideModal } from './components/UserGuideModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { normalizeDateToYMD } from './lib/constants';

export default function App() {
  // 1. RBAC Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => storage.getCurrentUser());
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // 2. Application Master Data & Records
  const [records, setRecords] = useState<CarWashRecord[]>(() => storage.getRecords());
  const [colors, setColors] = useState<CarColor[]>(() => storage.getColors());
  const [branches, setBranches] = useState<Branch[]>(() => storage.getBranches());
  const [brands, setBrands] = useState<CarBrand[]>(() => storage.getBrands());
  const [employees, setEmployees] = useState<Employee[]>(() => storage.getEmployees());
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => storage.getUsers());
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(() => storage.getSheetConfig());

  // 3. UI Navigation & Permissions
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>(() => {
    const user = storage.getCurrentUser();
    return user?.role === 'Admin' || user?.role === 'Accounting' ? 'dashboard' : 'history';
  });

  const isAdmin = currentUser?.role === 'Admin';
  const isAccounting = currentUser?.role === 'Accounting';
  const isOfficer = currentUser?.role === 'Administration Officer';

  // Role Permissions:
  // - Admin: All access, can view dashboard, add, edit, DELETE, manage users, master data, sheet config
  // - Accounting: View dashboard summaries, history, add, edit, export Excel, NO DELETE
  // - Officer: View history, add, edit, NO DELETE
  const canViewDashboard = isAdmin || isAccounting;
  const canAddRecord = true;
  const canEditRecord = true;
  const canDeleteRecord = isAdmin; // Strictly ONLY Admin can delete!

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>(() => {
    const initialRecords = storage.getRecords();
    const currentMonth = normalizeDateToYMD(new Date()).substring(0, 7);
    const hasCurrentMonth = initialRecords.some(r =>
      normalizeDateToYMD(r.date, r.createdAt, r.id).startsWith(currentMonth)
    );
    if (hasCurrentMonth || initialRecords.length === 0) {
      return {
        month: currentMonth,
        branch: 'all',
        status: 'all',
        searchQuery: '',
        staff: 'all'
      };
    }
    const availableMonths = initialRecords
      .map(r => normalizeDateToYMD(r.date, r.createdAt, r.id).substring(0, 7))
      .filter(m => /^\d{4}-\d{2}$/.test(m))
      .sort()
      .reverse();
    return {
      month: availableMonths[0] || currentMonth,
      branch: 'all',
      status: 'all',
      searchQuery: '',
      staff: 'all'
    };
  });

  // Helper to ensure selected month has records after pulling from Google Sheets
  const alignMonthFilterWithJobs = useCallback((jobs: CarWashRecord[]) => {
    if (!jobs || jobs.length === 0) return;
    setFilterState(prev => {
      if (prev.month === 'all') return prev;
      const hasMatch = jobs.some(r =>
        normalizeDateToYMD(r.date, r.createdAt, r.id).startsWith(prev.month)
      );
      if (hasMatch) return prev;
      const latestMonths = jobs
        .map(r => normalizeDateToYMD(r.date, r.createdAt, r.id).substring(0, 7))
        .filter(m => /^\d{4}-\d{2}$/.test(m))
        .sort()
        .reverse();
      return {
        ...prev,
        month: latestMonths[0] || 'all'
      };
    });
  }, []);

  // Modal Visibility States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CarWashRecord | null>(null);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSheetSettingsOpen, setIsSheetSettingsOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Sync state to local storage
  useEffect(() => {
    storage.saveRecords(records);
  }, [records]);

  useEffect(() => {
    storage.saveColors(colors);
  }, [colors]);

  useEffect(() => {
    storage.saveBranches(branches);
  }, [branches]);

  useEffect(() => {
    storage.saveBrands(brands);
  }, [brands]);

  useEffect(() => {
    storage.saveEmployees(employees);
  }, [employees]);

  useEffect(() => {
    storage.saveUsers(userProfiles);
  }, [userProfiles]);

  useEffect(() => {
    storage.saveSheetConfig(sheetConfig);
  }, [sheetConfig]);

  useEffect(() => {
    storage.saveCurrentUser(currentUser);
  }, [currentUser]);

  // Enforce tab permission
  useEffect(() => {
    if (currentUser && !canViewDashboard && activeTab === 'dashboard') {
      setActiveTab('history');
    }
  }, [currentUser, canViewDashboard, activeTab]);

  // Automatically fetch / pull existing data from Google Sheet once per session
  const hasPulledSessionRef = useRef(false);
  useEffect(() => {
    const autoPullFromSheet = async () => {
      if (!sheetConfig?.webAppUrl || !sheetConfig.isConnected) return;
      if (hasPulledSessionRef.current) return;
      hasPulledSessionRef.current = true;

      try {
        const pullResult = await pullDataFromGoogleSheet(sheetConfig.webAppUrl);
        if (pullResult.jobs && pullResult.jobs.length > 0) {
          setRecords(pullResult.jobs);
          alignMonthFilterWithJobs(pullResult.jobs);
        }
        if (pullResult.users && pullResult.users.length > 0) {
          setUserProfiles(pullResult.users);
        }
        if (pullResult.settings) {
          if (pullResult.settings.colors?.length) setColors(pullResult.settings.colors);
          if (pullResult.settings.branches?.length) setBranches(pullResult.settings.branches);
          if (pullResult.settings.brands?.length) setBrands(pullResult.settings.brands);
          if (pullResult.settings.employees?.length) setEmployees(pullResult.settings.employees);
        }
        storage.setPullInitialized(true);
      } catch (err) {
        console.warn('Initial sheet pull notice:', err);
      }
    };

    autoPullFromSheet();
  }, [sheetConfig?.webAppUrl, sheetConfig?.isConnected]);

  // Master Data helper
  const getMasterSettings = useCallback((): MasterSettingsData => {
    return {
      colors,
      branches,
      brands,
      employees
    };
  }, [colors, branches, brands, employees]);

  // --------------------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // --------------------------------------------------------------------------
  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const result = authenticateUser(email, pass, userProfiles);
      if (result.success && result.user) {
        setCurrentUser(result.user);
        // Update user's last login in user profiles list
        const updatedUsers = userProfiles.map(u => 
          u.uid === result.user!.uid ? result.user! : u
        );
        setUserProfiles(updatedUsers);
        storage.saveUsers(updatedUsers);

        // Auto sync updated login timestamp to Google Sheet in background
        if (sheetConfig?.webAppUrl) {
          autoSyncUsersToGoogleSheet(sheetConfig.webAppUrl, updatedUsers);
        }

        // Set default view based on role
        if (result.user.role === 'Admin' || result.user.role === 'Accounting') {
          setActiveTab('dashboard');
        } else {
          setActiveTab('history');
        }

        showToast(`ยินดีต้อนรับ ${result.user.displayName} เข้าสู่ระบบ (${result.user.role})`, 'success');
        return true;
      } else {
        setAuthError(result.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        return false;
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.saveCurrentUser(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  const handleChangePassword = (oldPass: string, newPass: string) => {
    if (!currentUser) return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };

    const result = changeUserPassword(currentUser.uid, oldPass, newPass, userProfiles);
    if (result.success && result.updatedUsers) {
      setUserProfiles(result.updatedUsers);
      const updatedCurrent = result.updatedUsers.find(u => u.uid === currentUser.uid);
      if (updatedCurrent) setCurrentUser(updatedCurrent);

      // Auto-sync users to Google Sheet
      if (sheetConfig?.webAppUrl) {
        autoSyncUsersToGoogleSheet(sheetConfig.webAppUrl, result.updatedUsers);
      }
    }
    return { success: result.success, message: result.message };
  };

  // --------------------------------------------------------------------------
  // USER MANAGEMENT HANDLERS (ADMIN ONLY)
  // --------------------------------------------------------------------------
  const handleAddUser = (user: { email: string; displayName: string; role: UserRole; password: string }) => {
    const res = addNewUser(user, userProfiles);
    if (res.success && res.updatedUsers) {
      setUserProfiles(res.updatedUsers);
      if (sheetConfig?.webAppUrl) {
        autoSyncUsersToGoogleSheet(sheetConfig.webAppUrl, res.updatedUsers);
      }
    }
    return { success: res.success, message: res.message };
  };

  const handleUpdateUser = (uid: string, details: { displayName: string; role: UserRole }) => {
    const res = updateUserDetails(uid, details, userProfiles, currentUser?.uid || '');
    if (res.success && res.updatedUsers) {
      setUserProfiles(res.updatedUsers);
      if (currentUser?.uid === uid) {
        const updatedSelf = res.updatedUsers.find(u => u.uid === uid);
        if (updatedSelf) setCurrentUser(updatedSelf);
      }
      if (sheetConfig?.webAppUrl) {
        autoSyncUsersToGoogleSheet(sheetConfig.webAppUrl, res.updatedUsers);
      }
    }
    return { success: res.success, message: res.message };
  };

  const handleResetPassword = (uid: string, newPass: string) => {
    const res = adminResetUserPassword(uid, newPass, userProfiles);
    if (res.success && res.updatedUsers) {
      setUserProfiles(res.updatedUsers);
      if (sheetConfig?.webAppUrl) {
        autoSyncUsersToGoogleSheet(sheetConfig.webAppUrl, res.updatedUsers);
      }
    }
    return { success: res.success, message: res.message };
  };

  const handleDeleteUser = (uid: string) => {
    const res = removeUser(uid, userProfiles, currentUser?.uid || '');
    if (res.success && res.updatedUsers) {
      setUserProfiles(res.updatedUsers);
      if (sheetConfig?.webAppUrl) {
        autoSyncUsersToGoogleSheet(sheetConfig.webAppUrl, res.updatedUsers);
      }
    }
    return { success: res.success, message: res.message };
  };

  // --------------------------------------------------------------------------
  // GOOGLE SHEETS WEB APP SYNC HANDLERS
  // --------------------------------------------------------------------------
  // Connect and FIRST PULL existing data to prevent overwriting
  const handleConnectWebApp = async (url: string) => {
    setIsSyncing(true);
    try {
      // 1. FIRST PULL existing data from Google Sheet
      const pullResult = await pullDataFromGoogleSheet(url);
      let pulledJobsCount = 0;

      // If sheet already has jobs, use them (don't overwrite!)
      if (pullResult.jobs && pullResult.jobs.length > 0) {
        setRecords(pullResult.jobs);
        alignMonthFilterWithJobs(pullResult.jobs);
        pulledJobsCount = pullResult.jobs.length;
      }
      if (pullResult.users && pullResult.users.length > 0) {
        setUserProfiles(pullResult.users);
      }
      if (pullResult.settings) {
        const nextColors = pullResult.settings.colors?.length ? pullResult.settings.colors : colors;
        const nextBranches = pullResult.settings.branches?.length ? pullResult.settings.branches : branches;
        const nextBrands = pullResult.settings.brands?.length ? pullResult.settings.brands : brands;
        const nextEmployees = pullResult.settings.employees?.length ? pullResult.settings.employees : employees;

        if (pullResult.settings.colors?.length) setColors(nextColors);
        if (pullResult.settings.branches?.length) setBranches(nextBranches);
        if (pullResult.settings.brands?.length) setBrands(nextBrands);
        if (pullResult.settings.employees?.length) setEmployees(nextEmployees);
      }

      const newConfig: GoogleSheetConfig = {
        webAppUrl: url,
        isConnected: true,
        lastSyncedAt: new Date().toISOString(),
        autoSync: true,
        tabs: {
          jobs: 'Jobs',
          users: 'Users',
          settings: 'Settings_MasterData'
        }
      };

      setSheetConfig(newConfig);
      storage.saveSheetConfig(newConfig);
      storage.setPullInitialized(true);

      // If sheet had zero jobs, sync baseline so sheet is initialized
      if (!pullResult.jobs || pullResult.jobs.length === 0) {
        await pushAllToGoogleSheet(url, {
          jobs: records,
          users: userProfiles,
          settings: getMasterSettings()
        });
      }

      showToast(`เชื่อมต่อ Google Sheet สำเร็จ! อ่านข้อมูลเดิม ${pulledJobsCount} รายการเรียบร้อย`, 'success');
    } catch (err: any) {
      console.error('Connect Web App error:', err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual Pull from Google Sheet
  const handlePullFromSheet = async () => {
    if (!sheetConfig?.webAppUrl) {
      setIsSheetSettingsOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      const pullResult = await pullDataFromGoogleSheet(sheetConfig.webAppUrl);
      if (pullResult.jobs && pullResult.jobs.length > 0) {
        setRecords(pullResult.jobs);
        alignMonthFilterWithJobs(pullResult.jobs);
      }
      if (pullResult.users && pullResult.users.length > 0) {
        setUserProfiles(pullResult.users);
      }
      if (pullResult.settings) {
        const nextColors = pullResult.settings.colors?.length ? pullResult.settings.colors : colors;
        const nextBranches = pullResult.settings.branches?.length ? pullResult.settings.branches : branches;
        const nextBrands = pullResult.settings.brands?.length ? pullResult.settings.brands : brands;
        const nextEmployees = pullResult.settings.employees?.length ? pullResult.settings.employees : employees;

        if (pullResult.settings.colors?.length) setColors(nextColors);
        if (pullResult.settings.branches?.length) setBranches(nextBranches);
        if (pullResult.settings.brands?.length) setBrands(nextBrands);
        if (pullResult.settings.employees?.length) setEmployees(nextEmployees);
      }

      setSheetConfig(prev => prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null);
      showToast(`ดึงข้อมูลล่าสุด ${pullResult.jobs?.length || 0} รายการจาก Google Sheet สำเร็จ`, 'success');
    } catch (err: any) {
      showToast('ดึงข้อมูลจาก Google Sheet ล้มเหลว: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual Push / Sync All to Google Sheet
  const handleManualFullSync = async () => {
    if (!sheetConfig?.webAppUrl) {
      setIsSheetSettingsOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      await pushAllToGoogleSheet(sheetConfig.webAppUrl, {
        jobs: records,
        users: userProfiles,
        settings: getMasterSettings()
      });

      setSheetConfig(prev => prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null);
      showToast('ส่งข้อมูลทั้งหมด 3 แท็บ (Jobs, Users, Settings) ไปยัง Google Sheet เรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      showToast('การส่งข้อมูลล้มเหลว: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Export Excel (.xlsx) with all 3 sheets
  const handleExportExcel = () => {
    try {
      exportAllDataToExcel(records, userProfiles, getMasterSettings());
      showToast('ดาวน์โหลดไฟล์ Excel (.xlsx) ครบ 3 แท็บเรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการ Export Excel: ' + err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // CAR WASH RECORD OPERATIONS
  // --------------------------------------------------------------------------
  const handleSaveRecord = async (
    recordData: Omit<CarWashRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheet'>,
    existingId?: string
  ) => {
    const now = new Date().toISOString();

    if (existingId) {
      // EDIT RECORD
      const existing = records.find(r => r.id === existingId);
      const updatedRecord: CarWashRecord = {
        ...(existing || { id: existingId, createdAt: now }),
        ...recordData,
        updatedAt: now,
        syncedToSheet: true
      };

      const updatedList = records.map(r => r.id === existingId ? updatedRecord : r);
      setRecords(updatedList);
      showToast('อัปเดตข้อมูลรถเรียบร้อยแล้ว', 'success');

      // Background Auto-Sync to Google Sheet
      if (sheetConfig?.webAppUrl) {
        autoSyncJobToGoogleSheet(sheetConfig.webAppUrl, updatedRecord);
      }
    } else {
      // CREATE NEW RECORD
      const uniqueSuffix = Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newId = `CW-${recordData.date.replace(/-/g, '')}-${uniqueSuffix}`;
      const newRecord: CarWashRecord = {
        ...recordData,
        id: newId,
        createdAt: now,
        updatedAt: now,
        syncedToSheet: true
      };

      const updatedList = [newRecord, ...records];
      setRecords(updatedList);
      showToast(`บันทึกข้อมูลรถ ${newRecord.licensePlate || newRecord.vinNumber} สำเร็จ`, 'success');

      // Background Auto-Sync to Google Sheet
      if (sheetConfig?.webAppUrl) {
        autoSyncJobToGoogleSheet(sheetConfig.webAppUrl, newRecord);
      }
    }
  };

  // Handle Edit Record Click
  const handleEditRecordClick = (record: CarWashRecord) => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  // Handle Delete Record Click (STRICTLY ADMIN ONLY)
  const handleDeleteRecordClick = (record: CarWashRecord) => {
    if (!isAdmin) {
      showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบรายการได้', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบรายการรถล้าง',
      message: `คุณต้องการลบข้อมูลรถ ทะเบียน: "${record.licensePlate || '-'}" (เลขตัวถัง: ${record.vinNumber || '-'}) ยี่ห้อ ${record.brand} ออกจากระบบและ Google Sheet ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      confirmText: 'ลบรายการทันที',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        const updatedList = records.filter(r => r.id !== record.id);
        setRecords(updatedList);
        showToast('ลบรายการเรียบร้อยแล้ว', 'info');

        // Background Auto-Sync deletion to Google Sheet
        if (sheetConfig?.webAppUrl) {
          autoSyncDeleteJobFromGoogleSheet(sheetConfig.webAppUrl, record.id);
        }
      }
    });
  };

  // Master Data Update Handlers (with auto sync to Google Sheet)
  const handleUpdateColors = (newColors: CarColor[]) => {
    setColors(newColors);
    const nextSettings = { ...getMasterSettings(), colors: newColors };
    if (sheetConfig?.webAppUrl) {
      pushAllToGoogleSheet(sheetConfig.webAppUrl, {
        jobs: records,
        users: userProfiles,
        settings: nextSettings
      }).catch(console.warn);
    }
  };

  const handleUpdateBranches = (newBranches: Branch[]) => {
    setBranches(newBranches);
    const nextSettings = { ...getMasterSettings(), branches: newBranches };
    if (sheetConfig?.webAppUrl) {
      pushAllToGoogleSheet(sheetConfig.webAppUrl, {
        jobs: records,
        users: userProfiles,
        settings: nextSettings
      }).catch(console.warn);
    }
  };

  const handleUpdateBrands = (newBrands: CarBrand[]) => {
    setBrands(newBrands);
    const nextSettings = { ...getMasterSettings(), brands: newBrands };
    if (sheetConfig?.webAppUrl) {
      pushAllToGoogleSheet(sheetConfig.webAppUrl, {
        jobs: records,
        users: userProfiles,
        settings: nextSettings
      }).catch(console.warn);
    }
  };

  const handleUpdateEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    const nextSettings = { ...getMasterSettings(), employees: newEmployees };
    if (sheetConfig?.webAppUrl) {
      pushAllToGoogleSheet(sheetConfig.webAppUrl, {
        jobs: records,
        users: userProfiles,
        settings: nextSettings
      }).catch(console.warn);
    }
  };

  const handleUpdateUserProfiles = (newUsers: UserProfile[]) => {
    setUserProfiles(newUsers);
    if (sheetConfig?.webAppUrl) {
      autoSyncUsersToGoogleSheet(sheetConfig.webAppUrl, newUsers);
    }
  };

  // If not logged in, render Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        isLoading={isAuthLoading}
        errorMessage={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-['Sarabun',sans-serif]">
      {/* Toast Notification Pill */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : toast.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-600 text-white border-emerald-500'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        sheetConfig={sheetConfig}
        isSyncing={isSyncing}
        onOpenNewRecord={() => {
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
        onOpenMasterData={() => {
          if (isAdmin) setIsMasterDataOpen(true);
        }}
        onOpenUserManagement={() => {
          if (isAdmin) setIsUserManagementOpen(true);
        }}
        onOpenSheetSettings={() => setIsSheetSettingsOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onManualSync={handleManualFullSync}
        onExportExcel={handleExportExcel}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {canViewDashboard && activeTab === 'dashboard' ? (
          <DashboardView
            records={records}
            branches={branches}
            employees={employees}
            filterState={filterState}
            onFilterChange={(newFilters) => setFilterState(prev => ({ ...prev, ...newFilters }))}
            onOpenNewRecord={() => {
              setEditingRecord(null);
              setIsRecordModalOpen(true);
            }}
            onViewHistory={() => setActiveTab('history')}
            onPullFromSheet={handlePullFromSheet}
            isSyncing={isSyncing}
          />
        ) : (
          <HistoryView
            records={records}
            branches={branches}
            currentUser={currentUser}
            filterState={filterState}
            onFilterChange={(newFilters) => setFilterState(prev => ({ ...prev, ...newFilters }))}
            onEditRecord={handleEditRecordClick}
            onDeleteRecord={handleDeleteRecordClick}
            onOpenNewRecord={() => {
              setEditingRecord(null);
              setIsRecordModalOpen(true);
            }}
            onOpenSheetLink={sheetConfig?.spreadsheetUrl}
            onManualSync={handleManualFullSync}
            onPullFromSheet={handlePullFromSheet}
            onExportExcel={handleExportExcel}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      {canAddRecord && (
        <button
          id="mobile-quick-log-fab"
          onClick={() => {
            setEditingRecord(null);
            setIsRecordModalOpen(true);
          }}
          aria-label="ลงข้อมูลรถใหม่"
          className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-xl shadow-sky-600/30 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* Record Creation / Editing Modal */}
      <RecordFormModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSaveRecord}
        initialRecord={editingRecord}
        colors={colors}
        branches={branches}
        brands={brands}
        employees={employees}
        currentUser={currentUser}
        existingRecords={records}
      />

      {/* Admin Master Data Modal */}
      {isAdmin && (
        <MasterDataModal
          isOpen={isMasterDataOpen}
          onClose={() => setIsMasterDataOpen(false)}
          colors={colors}
          branches={branches}
          brands={brands}
          employees={employees}
          userProfiles={userProfiles}
          onUpdateColors={handleUpdateColors}
          onUpdateBranches={handleUpdateBranches}
          onUpdateBrands={handleUpdateBrands}
          onUpdateEmployees={handleUpdateEmployees}
          onUpdateUserProfiles={handleUpdateUserProfiles}
        />
      )}

      {/* Admin User Management Modal */}
      {isAdmin && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          users={userProfiles}
          currentUser={currentUser}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onResetPassword={handleResetPassword}
          onDeleteUser={handleDeleteUser}
          onSyncUsersToSheet={async () => {
            if (sheetConfig?.webAppUrl) {
              await autoSyncUsersToGoogleSheet(sheetConfig.webAppUrl, userProfiles);
              showToast('ซิงค์ข้อมูลผู้ใช้ไปยังแท็บ Users ใน Google Sheet เรียบร้อยแล้ว', 'success');
            } else {
              showToast('กรุณาตั้งค่า Google Sheet กลางก่อน', 'info');
            }
          }}
          isSyncing={isSyncing}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
        onChangePassword={handleChangePassword}
      />

      {/* Google Sheets Web App Connection Modal */}
      <SheetSettingsModal
        isOpen={isSheetSettingsOpen}
        onClose={() => setIsSheetSettingsOpen(false)}
        sheetConfig={sheetConfig}
        onConnectWebApp={handleConnectWebApp}
        onFullSync={handleManualFullSync}
        onPullFromSheet={handlePullFromSheet}
        onExportExcel={handleExportExcel}
        isSyncing={isSyncing}
        isAdmin={isAdmin}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        userRole={currentUser.role}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
