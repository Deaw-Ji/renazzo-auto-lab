/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  setAccessToken, 
  logout 
} from './lib/firebase';
import { 
  getOrCreateSpreadsheet, 
  connectExistingSpreadsheet,
  appendRecordToSheet, 
  fullSyncRecordsToSheet, 
  fetchRecordsFromSheet 
} from './lib/googleSheets';
import {
  subscribeToRecords,
  saveRecordToFirestore,
  deleteRecordFromFirestore,
  seedRecordsToFirestoreIfEmpty,
  subscribeToBranches,
  syncAllBranchesToFirestore,
  seedBranchesToFirestoreIfEmpty,
  subscribeToStaff,
  syncAllStaffToFirestore,
  seedStaffToFirestoreIfEmpty,
  subscribeToColors,
  syncAllColorsToFirestore,
  seedColorsToFirestoreIfEmpty,
  subscribeToBrands,
  syncAllBrandsToFirestore,
  seedBrandsToFirestoreIfEmpty,
  subscribeToUserProfiles,
  syncAllUsersToFirestore,
  seedUsersToFirestoreIfEmpty,
  subscribeToSharedSheetConfig,
  saveSharedSheetConfigToFirestore
} from './lib/firestoreService';
import { storage } from './lib/storage';
import { 
  CarWashRecord, 
  UserProfile, 
  UserRole,
  GoogleSheetConfig, 
  FilterState, 
  CarColor, 
  Branch, 
  CarBrand, 
  Employee 
} from './types';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { RecordFormModal } from './components/RecordFormModal';
import { MasterDataModal } from './components/MasterDataModal';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { UserGuideModal } from './components/UserGuideModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Plus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => storage.getDemoSession());
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // App Master Data & Records
  const [records, setRecords] = useState<CarWashRecord[]>(() => storage.getRecords());
  const [colors, setColors] = useState<CarColor[]>(() => storage.getColors());
  const [branches, setBranches] = useState<Branch[]>(() => storage.getBranches());
  const [brands, setBrands] = useState<CarBrand[]>(() => storage.getBrands());
  const [employees, setEmployees] = useState<Employee[]>(() => storage.getEmployees());
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => storage.getUserProfiles());
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(() => storage.getSheetConfig());

  // UI Navigation & Filters - default to history for staff/viewers, dashboard for admin & supervisor
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>(() => {
    const session = storage.getDemoSession();
    return session?.role === 'admin' || session?.role === 'supervisor' ? 'dashboard' : 'history';
  });

  const isAdmin = currentUser?.role === 'admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const isStaff = currentUser?.role === 'staff';
  const isViewer = currentUser?.role === 'viewer';
  const canViewDashboard = isAdmin || isSupervisor;
  const canAddRecord = isAdmin || isSupervisor || isStaff;
  const canEditRecord = isAdmin || isSupervisor;
  const canDeleteRecord = isAdmin;
  const canManageMasterData = isAdmin;

  // Automatically enforce tab permission if user role changes
  useEffect(() => {
    if (currentUser && !canViewDashboard && activeTab === 'dashboard') {
      setActiveTab('history');
    }
  }, [currentUser, canViewDashboard, activeTab]);
  const [filterState, setFilterState] = useState<FilterState>({
    month: new Date().toISOString().substring(0, 7), // e.g. 2026-09
    branch: 'all',
    status: 'all',
    searchQuery: '',
    staff: 'all'
  });

  // Modal Visibility States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CarWashRecord | null>(null);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isSheetSettingsOpen, setIsSheetSettingsOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Confirmation Dialog State (For Destructive Operations)
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
    storage.saveUserProfiles(userProfiles);
  }, [userProfiles]);

  useEffect(() => {
    storage.saveSheetConfig(sheetConfig);
  }, [sheetConfig]);

  useEffect(() => {
    storage.saveDemoSession(currentUser);
  }, [currentUser]);

  // Firebase Auth initialization listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        if (token) {
          setHasAuthToken(true);
        }
        if (user) {
          // Check role from userProfiles list or default admin for jira.a@premium-auto.co.th
          const email = (user.email || '').toLowerCase();
          const existingProfile = userProfiles.find(p => p.email.toLowerCase() === email);
          const isSuperAdmin = email === 'jira.a@premium-auto.co.th' || email.startsWith('admin@') || email.includes('admin');
          const role: UserRole = existingProfile?.role || (isSuperAdmin ? 'admin' : 'viewer');

          const profile: UserProfile = {
            uid: user.uid,
            email: user.email || 'user@company.com',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL || undefined,
            role
          };
          setCurrentUser(profile);

          // If new user not in userProfiles, auto-register them so Admin can see and approve in Master Data
          if (!existingProfile && email) {
            const updatedUsers = [...userProfiles, profile];
            setUserProfiles(updatedUsers);
            syncAllUsersToFirestore(updatedUsers).catch(console.warn);
          }
        }
      },
      () => {
        // Auth failure or signed out
        if (!storage.getDemoSession()) {
          setCurrentUser(null);
        }
        setHasAuthToken(false);
      }
    );

    return () => unsubscribe();
  }, [userProfiles]);

  // Real-time Firestore synchronization for records and master data
  useEffect(() => {
    if (!currentUser) return;

    // 1. Seed initial data to Firestore if collections are empty
    seedRecordsToFirestoreIfEmpty(records).catch((e) => console.warn('Seed records notice:', e));
    seedBranchesToFirestoreIfEmpty(branches).catch((e) => console.warn('Seed branches notice:', e));
    seedStaffToFirestoreIfEmpty(employees).catch((e) => console.warn('Seed staff notice:', e));
    seedColorsToFirestoreIfEmpty(colors).catch((e) => console.warn('Seed colors notice:', e));
    seedBrandsToFirestoreIfEmpty(brands).catch((e) => console.warn('Seed brands notice:', e));
    seedUsersToFirestoreIfEmpty(userProfiles).catch((e) => console.warn('Seed users notice:', e));

    // 2. Subscribe to real-time records
    const unsubRecords = subscribeToRecords(
      (liveRecords) => {
        if (liveRecords && liveRecords.length > 0) {
          setRecords(liveRecords);
        }
      },
      (err) => console.warn('Firestore records sync notice:', err)
    );

    // 3. Subscribe to real-time branches
    const unsubBranches = subscribeToBranches(
      (liveBranches) => {
        if (liveBranches && liveBranches.length > 0) {
          setBranches(liveBranches);
        }
      },
      (err) => console.warn('Firestore branches sync notice:', err)
    );

    // 4. Subscribe to real-time staff
    const unsubStaff = subscribeToStaff(
      (liveStaff) => {
        if (liveStaff && liveStaff.length > 0) {
          setEmployees(liveStaff);
        }
      },
      (err) => console.warn('Firestore staff sync notice:', err)
    );

    // 5. Subscribe to real-time colors
    const unsubColors = subscribeToColors(
      (liveColors) => {
        if (liveColors && liveColors.length > 0) {
          setColors(liveColors);
        }
      },
      (err) => console.warn('Firestore colors sync notice:', err)
    );

    // 6. Subscribe to real-time brands
    const unsubBrands = subscribeToBrands(
      (liveBrands) => {
        if (liveBrands && liveBrands.length > 0) {
          setBrands(liveBrands);
        }
      },
      (err) => console.warn('Firestore brands sync notice:', err)
    );

    // 7. Subscribe to real-time users
    const unsubUsers = subscribeToUserProfiles(
      (liveUsers) => {
        if (liveUsers && liveUsers.length > 0) {
          setUserProfiles(liveUsers);
        }
      },
      (err) => console.warn('Firestore users sync notice:', err)
    );

    // 8. Subscribe to shared central Google Sheet config
    const unsubSheetConfig = subscribeToSharedSheetConfig(
      (liveSheetConfig) => {
        if (liveSheetConfig && liveSheetConfig.spreadsheetId) {
          setSheetConfig({
            spreadsheetId: liveSheetConfig.spreadsheetId,
            spreadsheetUrl: liveSheetConfig.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${liveSheetConfig.spreadsheetId}`,
            sheetName: liveSheetConfig.sheetName || 'บันทึกรายการล้างรถ',
            autoSync: true,
            isConnected: true,
            lastSyncedAt: liveSheetConfig.updatedAt || new Date().toISOString()
          });
        }
      },
      (err) => console.warn('Firestore sheet config sync notice:', err)
    );

    return () => {
      unsubRecords();
      unsubBranches();
      unsubStaff();
      unsubColors();
      unsubBrands();
      unsubUsers();
      unsubSheetConfig();
    };
  }, [currentUser]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setHasAuthToken(true);
        const email = (result.user.email || '').toLowerCase();
        const existingProfile = userProfiles.find(p => p.email.toLowerCase() === email);
        const isSuperAdmin = email === 'jira.a@premium-auto.co.th' || email.startsWith('admin@') || email.includes('admin');
        const role: UserRole = existingProfile?.role || (isSuperAdmin ? 'admin' : 'viewer');

        const profile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || 'user@company.com',
          displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          photoURL: result.user.photoURL || undefined,
          role
        };
        setCurrentUser(profile);

        // If new user not in userProfiles, auto-register them
        if (!existingProfile && email) {
          const updatedUsers = [...userProfiles, profile];
          setUserProfiles(updatedUsers);
          syncAllUsersToFirestore(updatedUsers).catch(console.warn);
        }

        if (role === 'viewer') {
          showToast(`ยินดีต้อนรับ ${profile.displayName} (สถานะ: ผู้เข้าชม รออนุมัติสิทธิ์)`, 'info');
        } else {
          showToast(`ยินดีต้อนรับ ${profile.displayName} เข้าสู่ระบบ`, 'success');
        }
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/popup-blocked'
      ) {
        // User closed or dismissed popup intentionally, no error needed
        return;
      }
      console.warn('Google Sign in warning:', err);
      setAuthError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้: ' + (err.message || 'โปรดลองอีกครั้ง'));
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Demo Sign In
  const handleDemoSignIn = (profile: UserProfile) => {
    setCurrentUser(profile);
    showToast(`เข้าสู่ระบบในชื่อ: ${profile.displayName} (${profile.role.toUpperCase()})`, 'info');
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setHasAuthToken(false);
    setAccessToken(null);
    storage.saveDemoSession(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  // Connect or Create Google Sheet
  const handleConnectOrCreateSheet = async () => {
    setIsSyncing(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        token = signinRes?.accessToken || null;
      }
      if (!token) {
        throw new Error('กรุณาเข้าสู่ระบบด้วย Google Account ก่อนทำการเชื่อมต่อชีต');
      }

      const config = await getOrCreateSpreadsheet(token);
      setSheetConfig(config);
      await saveSharedSheetConfigToFirestore(config);

      if (records.length > 0) {
        await fullSyncRecordsToSheet(token, config.spreadsheetId, records);
      }
      showToast('สร้าง Master Google Sheet กลางและบันทึกลงระบบเรียบร้อย', 'success');
    } catch (err: any) {
      console.error('Connect sheet failed:', err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Connect Existing Custom Google Sheet by Link or ID
  const handleConnectCustomSheet = async (urlOrId: string) => {
    setIsSyncing(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        token = signinRes?.accessToken || null;
      }
      if (!token) {
        throw new Error('กรุณาเข้าสู่ระบบด้วย Google Account ก่อนทำการเชื่อมต่อชีต');
      }

      const config = await connectExistingSpreadsheet(token, urlOrId);
      setSheetConfig(config);
      await saveSharedSheetConfigToFirestore(config);

      if (records.length > 0) {
        await fullSyncRecordsToSheet(token, config.spreadsheetId, records);
      }
      showToast('เชื่อมต่อ Master Google Sheet สำเร็จ และตั้งเป็นชีตกลางของระบบเรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      console.error('Connect custom sheet failed:', err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual Full Sync to Google Sheet
  const handleManualFullSync = async () => {
    if (!sheetConfig?.spreadsheetId) {
      setIsSheetSettingsOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (!token) {
        throw new Error('ไม่พบการยืนยันตัวตน กรุณาลองใหม่');
      }

      await fullSyncRecordsToSheet(token, sheetConfig.spreadsheetId, records);
      setSheetConfig(prev => prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null);
      showToast('ซิงค์ข้อมูลทั้งหมดไปยัง Google Sheet สำเร็จแล้ว', 'success');
    } catch (err: any) {
      showToast('การซิงค์ข้อมูลล้มเหลว: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull Records from Google Sheet
  const handlePullFromSheet = async () => {
    if (!sheetConfig?.spreadsheetId) return;

    setIsSyncing(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google');

      const sheetRecords = await fetchRecordsFromSheet(token, sheetConfig.spreadsheetId);
      if (sheetRecords.length > 0) {
        setRecords(sheetRecords);
        showToast(`ดึงข้อมูล ${sheetRecords.length} รายการจาก Google Sheet สำเร็จ`, 'success');
      } else {
        showToast('Google Sheet ยังไม่มีรายการข้อมูล', 'info');
      }
    } catch (err: any) {
      showToast('ดึงข้อมูลจากชีตล้มเหลว: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Record Creation & Editing
  const handleSaveRecord = async (
    recordData: Omit<CarWashRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheet'>,
    existingId?: string
  ) => {
    // Permission guard
    if (existingId && !canEditRecord) {
      showToast('คุณไม่มีสิทธิ์แก้ไขรายการรถล้าง (เฉพาะ Admin และ Supervisor)', 'error');
      return;
    }
    if (!existingId && !canAddRecord) {
      showToast('คุณอยู่ในสิทธิ์ผู้เข้าชม (ดูได้อย่างเดียว) ยังไม่สามารถบันทึกข้อมูลได้', 'error');
      return;
    }

    const now = new Date().toISOString();

    if (existingId) {
      // EDIT RECORD: Confirm with dialog if needed or apply update
      const existing = records.find(r => r.id === existingId);
      const updatedRecord: CarWashRecord = {
        ...(existing || { id: existingId, createdAt: now }),
        ...recordData,
        updatedAt: now,
        syncedToSheet: false
      };

      const updatedList = records.map(r => r.id === existingId ? updatedRecord : r);
      setRecords(updatedList);
      showToast('อัปเดตข้อมูลรถเรียบร้อยแล้ว', 'success');

      // 1. Save to Cloud Firestore Real-time Database
      saveRecordToFirestore(updatedRecord).catch(err => console.warn('Firestore update error:', err));

      // 2. Sync updated list to Google Sheet if connected
      const token = await getAccessToken();
      if (token && sheetConfig?.spreadsheetId) {
        fullSyncRecordsToSheet(token, sheetConfig.spreadsheetId, updatedList).catch(console.warn);
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
        syncedToSheet: false
      };

      const updatedList = [newRecord, ...records];
      setRecords(updatedList);
      showToast(`บันทึกข้อมูลรถ ${newRecord.licensePlate || newRecord.vinNumber} สำเร็จ`, 'success');

      // 1. Save to Cloud Firestore Real-time Database
      saveRecordToFirestore(newRecord).catch(err => console.warn('Firestore save error:', err));

      // 2. Append to Google Sheet in real-time
      const token = await getAccessToken();
      if (token && sheetConfig?.spreadsheetId) {
        appendRecordToSheet(token, sheetConfig.spreadsheetId, newRecord)
          .then(() => {
            setRecords(prev => prev.map(r => r.id === newId ? { ...r, syncedToSheet: true } : r));
            setSheetConfig(prev => prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null);
          })
          .catch(err => {
            console.warn('Real-time append to sheet queued:', err);
          });
      }
    }
  };

  // Handle Admin Edit Record (Opens Edit Modal)
  const handleEditRecordClick = (record: CarWashRecord) => {
    if (!canEditRecord) {
      showToast('คุณไม่มีสิทธิ์แก้ไขรายการรถล้าง', 'error');
      return;
    }
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  // Handle Admin Delete Record (MANDATORY: Explicit confirmation dialog per workspace skill)
  const handleDeleteRecordClick = (record: CarWashRecord) => {
    if (!canDeleteRecord) {
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

        // 1. Delete from Cloud Firestore
        deleteRecordFromFirestore(record.id).catch(err => console.warn('Firestore delete error:', err));

        // 2. Sync deletion to Google Sheet
        const token = await getAccessToken();
        if (token && sheetConfig?.spreadsheetId) {
          fullSyncRecordsToSheet(token, sheetConfig.spreadsheetId, updatedList).catch(console.warn);
        }
      }
    });
  };

  // Handle Master Data updates with Firestore sync
  const handleUpdateBranches = (newBranches: Branch[]) => {
    setBranches(newBranches);
    syncAllBranchesToFirestore(newBranches).catch(console.warn);
  };

  const handleUpdateEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    syncAllStaffToFirestore(newEmployees).catch(console.warn);
  };

  const handleUpdateColors = (newColors: CarColor[]) => {
    setColors(newColors);
    syncAllColorsToFirestore(newColors).catch(console.warn);
  };

  const handleUpdateBrands = (newBrands: CarBrand[]) => {
    setBrands(newBrands);
    syncAllBrandsToFirestore(newBrands).catch(console.warn);
  };

  const handleUpdateUserProfiles = (newUsers: UserProfile[]) => {
    setUserProfiles(newUsers);
    syncAllUsersToFirestore(newUsers).catch(console.warn);
  };

  // If user is not logged in, display the Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onGoogleSignIn={handleGoogleSignIn}
        onDemoSignIn={handleDemoSignIn}
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

      {/* Main App Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        sheetConfig={sheetConfig}
        isSyncing={isSyncing}
        onOpenNewRecord={() => {
          if (!canAddRecord) {
            showToast('คุณอยู่ในสิทธิ์ผู้เข้าชม (ดูได้อย่างเดียว) ยังไม่สามารถบันทึกข้อมูลได้', 'info');
            return;
          }
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
        onOpenMasterData={() => {
          if (currentUser?.role === 'admin') {
            setIsMasterDataOpen(true);
          }
        }}
        onOpenSheetSettings={() => setIsSheetSettingsOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onManualSync={handleManualFullSync}
        onLogout={handleLogout}
      />

      {/* Viewer Notification Banner */}
      {isViewer && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/80 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-amber-900 font-medium">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span>
                <strong className="font-bold text-amber-950">สถานะ: บัญชีผู้เข้าชม (Viewer - ดูได้อย่างเดียว)</strong> — บัญชีของคุณยังไม่ได้รับการอนุมัติสิทธิ์การบันทึกข้อมูล สามารถค้นหาและดูข้อมูลได้ หากต้องการบันทึกรถล้าง กรุณาแจ้งผู้ดูแลระบบ (Admin) เพื่อปรับสิทธิ์
              </span>
            </div>
            <button
              id="banner-open-guide-btn"
              onClick={() => setIsUserGuideOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold shrink-0 shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span>📖 ดูคู่มือการใช้งาน</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {canViewDashboard && activeTab === 'dashboard' ? (
          <DashboardView
            records={records}
            branches={branches}
            employees={employees}
            filterState={filterState}
            onFilterChange={(newFilters) => setFilterState(prev => ({ ...prev, ...newFilters }))}
            onOpenNewRecord={() => {
              if (!canAddRecord) {
                showToast('คุณอยู่ในสิทธิ์ผู้เข้าชม (ดูได้อย่างเดียว) ยังไม่สามารถบันทึกข้อมูลได้', 'info');
                return;
              }
              setEditingRecord(null);
              setIsRecordModalOpen(true);
            }}
            onViewHistory={() => setActiveTab('history')}
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
              if (!canAddRecord) {
                showToast('คุณอยู่ในสิทธิ์ผู้เข้าชม (ดูได้อย่างเดียว) ยังไม่สามารถบันทึกข้อมูลได้', 'info');
                return;
              }
              setEditingRecord(null);
              setIsRecordModalOpen(true);
            }}
            onOpenSheetLink={sheetConfig?.spreadsheetUrl}
            onManualSync={handleManualFullSync}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) for fast car wash recording */}
      {canAddRecord && (
        <button
          id="mobile-quick-log-fab"
          onClick={() => {
            setEditingRecord(null);
            setIsRecordModalOpen(true);
          }}
          aria-label="ลงข้อมูลรถใหม่"
          className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-xl shadow-sky-600/30 flex items-center justify-center active:scale-95 transition-transform"
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
      />

      {/* Admin Master Data Modal */}
      {currentUser.role === 'admin' && (
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

      {/* Google Sheets Connection Modal */}
      <SheetSettingsModal
        isOpen={isSheetSettingsOpen}
        onClose={() => setIsSheetSettingsOpen(false)}
        sheetConfig={sheetConfig}
        onConnectOrCreate={handleConnectOrCreateSheet}
        onConnectCustomSheet={handleConnectCustomSheet}
        onFullSync={handleManualFullSync}
        onPullFromSheet={handlePullFromSheet}
        isSyncing={isSyncing}
        hasOAuthToken={hasAuthToken}
        onReauthGoogle={handleGoogleSignIn}
        isAdmin={currentUser.role === 'admin'}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        userRole={currentUser?.role}
      />

      {/* Confirmation Dialog for Destructive / Editing actions */}
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
