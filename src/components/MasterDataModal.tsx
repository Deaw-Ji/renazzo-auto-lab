import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  MapPin, 
  Car, 
  Users, 
  Shield, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  AlertCircle,
  Save,
  RotateCcw,
  KeyRound,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  CarColor, 
  Branch, 
  CarBrand, 
  Employee, 
  UserProfile, 
  UserRole,
  RoleConfig,
  RolePermissions
} from '../types';
import { sortEnFirstThenTh } from '../lib/constants';
import { INITIAL_ROLES } from '../lib/initialData';

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: CarColor[];
  branches: Branch[];
  brands: CarBrand[];
  employees: Employee[];
  userProfiles: UserProfile[];
  roles?: RoleConfig[];
  onUpdateColors: (colors: CarColor[]) => void;
  onUpdateBranches: (branches: Branch[]) => void;
  onUpdateBrands: (brands: CarBrand[]) => void;
  onUpdateEmployees: (employees: Employee[]) => void;
  onUpdateUserProfiles: (users: UserProfile[]) => void;
  onUpdateRoles?: (roles: RoleConfig[]) => void;
}

type ActiveTab = 'colors' | 'branches' | 'brands' | 'employees' | 'users' | 'roles';

export const MasterDataModal: React.FC<MasterDataModalProps> = ({
  isOpen,
  onClose,
  colors,
  branches,
  brands,
  employees,
  userProfiles,
  roles = INITIAL_ROLES,
  onUpdateColors,
  onUpdateBranches,
  onUpdateBrands,
  onUpdateEmployees,
  onUpdateUserProfiles,
  onUpdateRoles
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('colors');

  // New Item Form States
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#3B82F6');

  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');

  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandModels, setNewBrandModels] = useState('');

  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpNickname, setNewEmpNickname] = useState('');
  const [newEmpBranch, setNewEmpBranch] = useState('');

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Administration Officer');
  const [newUserPassword, setNewUserPassword] = useState('admin1234');
  const [resetUser, setResetUser] = useState<UserProfile | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [userToast, setUserToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Role Form States
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDisplayName, setNewRoleDisplayName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleColor, setNewRoleColor] = useState<RoleConfig['colorTheme']>('purple');
  const [newRolePerms, setNewRolePerms] = useState<RolePermissions>({
    canViewDashboard: false,
    canAddRecord: true,
    canEditRecord: true,
    canDeleteRecord: false,
    canExportExcel: false,
    canManageSettings: false
  });

  // Editing States for Existing Items
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [editColorName, setEditColorName] = useState('');
  const [editColorHex, setEditColorHex] = useState('');

  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editBranchName, setEditBranchName] = useState('');
  const [editBranchCode, setEditBranchCode] = useState('');

  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandModels, setEditBrandModels] = useState('');

  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpNickname, setEditEmpNickname] = useState('');
  const [editEmpBranch, setEditEmpBranch] = useState('');

  const [editingUserEmail, setEditingUserEmail] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('Administration Officer');
  const [editUserNewPassword, setEditUserNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDisplayName, setEditRoleDisplayName] = useState('');
  const [editRoleDescription, setEditRoleDescription] = useState('');
  const [editRoleColor, setEditRoleColor] = useState<RoleConfig['colorTheme']>('sky');
  const [editRolePerms, setEditRolePerms] = useState<RolePermissions>({
    canViewDashboard: false,
    canAddRecord: true,
    canEditRecord: true,
    canDeleteRecord: false,
    canExportExcel: false,
    canManageSettings: false
  });
  const [roleToast, setRoleToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  // ---------------- COLOR HANDLERS ----------------
  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    const newColor: CarColor = {
      id: `c_${Date.now()}`,
      name: newColorName.trim(),
      hexCode: newColorHex
    };
    onUpdateColors([...colors, newColor]);
    setNewColorName('');
    setNewColorHex('#3B82F6');
  };

  const startEditColor = (color: CarColor) => {
    setEditingColorId(color.id);
    setEditColorName(color.name);
    setEditColorHex(color.hexCode);
  };

  const saveEditColor = (id: string) => {
    if (!editColorName.trim()) return;
    onUpdateColors(
      colors.map(c => c.id === id ? { ...c, name: editColorName.trim(), hexCode: editColorHex } : c)
    );
    setEditingColorId(null);
  };

  const handleDeleteColor = (id: string) => {
    if (colors.length <= 1) return;
    onUpdateColors(colors.filter(c => c.id !== id));
    if (editingColorId === id) setEditingColorId(null);
  };

  // ---------------- BRANCH HANDLERS ----------------
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const newBranch: Branch = {
      id: `b_${Date.now()}`,
      name: newBranchName.trim(),
      code: newBranchCode.trim() || newBranchName.substring(0, 3).toUpperCase(),
      isActive: true
    };
    onUpdateBranches([...branches, newBranch]);
    setNewBranchName('');
    setNewBranchCode('');
  };

  const startEditBranch = (branch: Branch) => {
    setEditingBranchId(branch.id);
    setEditBranchName(branch.name);
    setEditBranchCode(branch.code);
  };

  const saveEditBranch = (id: string) => {
    if (!editBranchName.trim()) return;
    onUpdateBranches(
      branches.map(b => b.id === id ? {
        ...b,
        name: editBranchName.trim(),
        code: editBranchCode.trim() || editBranchName.substring(0, 3).toUpperCase()
      } : b)
    );
    setEditingBranchId(null);
  };

  const handleDeleteBranch = (id: string) => {
    if (branches.length <= 1) return;
    onUpdateBranches(branches.filter(b => b.id !== id));
    if (editingBranchId === id) setEditingBranchId(null);
  };

  // ---------------- BRAND HANDLERS ----------------
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const models = newBrandModels
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);
    const newBrand: CarBrand = {
      id: `br_${Date.now()}`,
      name: newBrandName.trim(),
      models
    };
    onUpdateBrands([...brands, newBrand]);
    setNewBrandName('');
    setNewBrandModels('');
  };

  const startEditBrand = (brand: CarBrand) => {
    setEditingBrandId(brand.id);
    setEditBrandName(brand.name);
    setEditBrandModels(brand.models.join(', '));
  };

  const saveEditBrand = (id: string) => {
    if (!editBrandName.trim()) return;
    const models = editBrandModels
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);
    onUpdateBrands(
      brands.map(br => br.id === id ? {
        ...br,
        name: editBrandName.trim(),
        models
      } : br)
    );
    setEditingBrandId(null);
  };

  const handleDeleteBrand = (id: string) => {
    if (brands.length <= 1) return;
    onUpdateBrands(brands.filter(b => b.id !== id));
    if (editingBrandId === id) setEditingBrandId(null);
  };

  // ---------------- EMPLOYEE HANDLERS ----------------
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    const newEmp: Employee = {
      id: `e_${Date.now()}`,
      name: newEmpName.trim(),
      nickname: newEmpNickname.trim() || undefined,
      branchId: newEmpBranch || branches[0]?.id,
      isActive: true
    };
    onUpdateEmployees([...employees, newEmp]);
    setNewEmpName('');
    setNewEmpNickname('');
  };

  const startEditEmployee = (emp: Employee) => {
    setEditingEmpId(emp.id);
    setEditEmpName(emp.name);
    setEditEmpNickname(emp.nickname || '');
    setEditEmpBranch(emp.branchId || branches[0]?.id || '');
  };

  const saveEditEmployee = (id: string) => {
    if (!editEmpName.trim()) return;
    onUpdateEmployees(
      employees.map(e => e.id === id ? {
        ...e,
        name: editEmpName.trim(),
        nickname: editEmpNickname.trim() || undefined,
        branchId: editEmpBranch
      } : e)
    );
    setEditingEmpId(null);
  };

  const handleDeleteEmployee = (id: string) => {
    if (employees.length <= 1) return;
    onUpdateEmployees(employees.filter(e => e.id !== id));
    if (editingEmpId === id) setEditingEmpId(null);
  };

  // ---------------- USER PROFILE HANDLERS ----------------
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;
    const cleanEmail = newUserEmail.trim().toLowerCase();
    if (userProfiles.some(u => u.email.toLowerCase() === cleanEmail)) {
      setUserToast({ message: 'อีเมลนี้มีอยู่ในระบบแล้ว', type: 'error' });
      setTimeout(() => setUserToast(null), 3000);
      return;
    }
    const newUser: UserProfile = {
      uid: `u_${Date.now()}`,
      email: cleanEmail,
      displayName: newUserName.trim() || cleanEmail.split('@')[0],
      role: newUserRole,
      password: newUserPassword.trim() || 'admin1234',
      createdAt: new Date().toISOString()
    };
    onUpdateUserProfiles([...userProfiles, newUser]);
    setNewUserEmail('');
    setNewUserName('');
    setNewUserPassword('admin1234');
    setUserToast({ message: `เพิ่มผู้ใช้ ${newUser.displayName} เรียบร้อยแล้ว`, type: 'success' });
    setTimeout(() => setUserToast(null), 3000);
  };

  const handleResetUserPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    if (!resetPasswordInput || resetPasswordInput.trim().length < 4) {
      setUserToast({ message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร', type: 'error' });
      setTimeout(() => setUserToast(null), 3000);
      return;
    }

    onUpdateUserProfiles(
      userProfiles.map(u => 
        (u.uid === resetUser.uid || u.email.toLowerCase() === resetUser.email.toLowerCase()) ? {
          ...u,
          password: resetPasswordInput.trim()
        } : u
      )
    );

    setUserToast({ 
      message: `รีเซ็ตรหัสผ่านสำหรับ ${resetUser.displayName || resetUser.email} เรียบร้อยแล้ว`, 
      type: 'success' 
    });
    setResetUser(null);
    setResetPasswordInput('');
    setShowResetPassword(false);
    setTimeout(() => setUserToast(null), 3500);
  };

  const startEditUser = (user: UserProfile) => {
    setEditingUserEmail(user.email);
    setEditUserName(user.displayName || '');
    setEditUserRole(user.role);
    setEditUserNewPassword('');
  };

  const saveEditUser = (email: string) => {
    onUpdateUserProfiles(
      userProfiles.map(u => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          const updated: UserProfile = {
            ...u,
            displayName: editUserName.trim() || u.email,
            role: editUserRole
          };
          if (editUserNewPassword.trim() && editUserNewPassword.trim().length >= 4) {
            updated.password = editUserNewPassword.trim();
          }
          return updated;
        }
        return u;
      })
    );
    setEditingUserEmail(null);
    setEditUserNewPassword('');
    setUserToast({ message: 'บันทึกการแก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว', type: 'success' });
    setTimeout(() => setUserToast(null), 3000);
  };

  const handleRoleToggle = (email: string, newRole: UserRole) => {
    onUpdateUserProfiles(
      userProfiles.map(u => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, role: newRole } : u))
    );
  };

  const handleDeleteUser = (email: string) => {
    if (userProfiles.length <= 1) return;
    onUpdateUserProfiles(userProfiles.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
    if (editingUserEmail?.toLowerCase() === email.toLowerCase()) setEditingUserEmail(null);
  };

  // ---------------- ROLE CONFIGURATION HANDLERS ----------------
  const showRoleNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setRoleToast({ message, type });
    setTimeout(() => setRoleToast(null), 3000);
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newRoleName.trim();
    if (!cleanName) return;

    if (roles.some(r => r.name.toLowerCase() === cleanName.toLowerCase())) {
      showRoleNotice(`สิทธิ์การใช้งาน "${cleanName}" มีอยู่ในระบบแล้ว`, 'error');
      return;
    }

    const newRole: RoleConfig = {
      id: `role_${Date.now()}`,
      name: cleanName,
      displayName: newRoleDisplayName.trim() || cleanName,
      description: newRoleDescription.trim() || 'สิทธิ์การใช้งานที่กำหนดเอง',
      colorTheme: newRoleColor,
      isSystemDefault: false,
      permissions: { ...newRolePerms }
    };

    onUpdateRoles?.([...roles, newRole]);
    setNewRoleName('');
    setNewRoleDisplayName('');
    setNewRoleDescription('');
    setNewRoleColor('purple');
    setNewRolePerms({
      canViewDashboard: false,
      canAddRecord: true,
      canEditRecord: true,
      canDeleteRecord: false,
      canExportExcel: false,
      canManageSettings: false
    });
    showRoleNotice(`เพิ่มสิทธิ์การใช้งาน "${newRole.displayName}" เรียบร้อยแล้ว`);
  };

  const startEditRole = (role: RoleConfig) => {
    setEditingRoleId(role.id);
    setEditRoleName(role.name);
    setEditRoleDisplayName(role.displayName);
    setEditRoleDescription(role.description);
    setEditRoleColor(role.colorTheme);
    setEditRolePerms({ ...role.permissions });
  };

  const saveEditRole = (id: string) => {
    const targetRole = roles.find(r => r.id === id);
    if (!targetRole) return;
    const cleanName = targetRole.name === 'Admin' ? 'Admin' : (editRoleName.trim() || targetRole.name);

    const updatedRoles = roles.map(r => {
      if (r.id === id) {
        return {
          ...r,
          name: cleanName,
          displayName: editRoleDisplayName.trim() || cleanName,
          description: editRoleDescription.trim() || r.description,
          colorTheme: editRoleColor,
          permissions: targetRole.name === 'Admin'
            ? {
                canViewDashboard: true,
                canAddRecord: true,
                canEditRecord: true,
                canDeleteRecord: true,
                canExportExcel: true,
                canManageSettings: true
              }
            : { ...editRolePerms }
        };
      }
      return r;
    });

    onUpdateRoles?.(updatedRoles);

    // If role key name changed, also update users holding the old role name
    if (cleanName !== targetRole.name) {
      onUpdateUserProfiles(
        userProfiles.map(u => u.role === targetRole.name ? { ...u, role: cleanName } : u)
      );
    }

    setEditingRoleId(null);
    showRoleNotice(`บันทึกการแก้ไขสิทธิ์ "${editRoleDisplayName || cleanName}" เรียบร้อยแล้ว`);
  };

  const handleToggleRolePermission = (roleId: string, permKey: keyof RolePermissions) => {
    const target = roles.find(r => r.id === roleId);
    if (!target) return;
    if (target.name === 'Admin' && permKey === 'canManageSettings') {
      showRoleNotice('ไม่สามารถปิดสิทธิ์จัดการระบบของ Admin หลักได้', 'error');
      return;
    }

    const updated = roles.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permKey]: !r.permissions[permKey]
          }
        };
      }
      return r;
    });
    onUpdateRoles?.(updated);
  };

  const handleDeleteRole = (role: RoleConfig) => {
    if (role.name === 'Admin' || role.isSystemDefault) {
      showRoleNotice('ไม่สามารถลบสิทธิ์ผู้ดูแลระบบหลัก (Admin) ได้', 'error');
      return;
    }
    if (roles.length <= 1) return;

    const nextRoles = roles.filter(r => r.id !== role.id);
    onUpdateRoles?.(nextRoles);

    // Reassign any user holding this deleted role to fallback role
    const fallbackRole = nextRoles.find(r => r.name !== 'Admin')?.name || nextRoles[0]?.name || 'Administration Officer';
    if (userProfiles.some(u => u.role === role.name)) {
      onUpdateUserProfiles(
        userProfiles.map(u => u.role === role.name ? { ...u, role: fallbackRole } : u)
      );
    }

    if (editingRoleId === role.id) setEditingRoleId(null);
    showRoleNotice(`ลบสิทธิ์การใช้งาน "${role.displayName}" เรียบร้อยแล้ว`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="master-data-modal-container"
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-600 shrink-0" />
              <span>การตั้งค่าระบบและข้อมูลพื้นฐาน (System Settings)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              สำหรับผู้ดูแลระบบ (Admin) เพื่อเพิ่ม แก้ไข และลบข้อมูลสีรถ สาขา ยี่ห้อ พนักงาน ผู้ใช้งาน และตั้งค่าสิทธิ์การใช้งาน
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-100/70 px-4 sm:px-6 py-2.5 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            <button
              id="tab-btn-colors"
              onClick={() => setActiveTab('colors')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'colors'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-200/80 ring-1 ring-sky-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <Palette className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'colors' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">สีรถ</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'colors' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {colors.length}
              </span>
            </button>

            <button
              id="tab-btn-branches"
              onClick={() => setActiveTab('branches')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'branches'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-200/80 ring-1 ring-sky-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'branches' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">สาขา</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'branches' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {branches.length}
              </span>
            </button>

            <button
              id="tab-btn-brands"
              onClick={() => setActiveTab('brands')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'brands'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-200/80 ring-1 ring-sky-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <Car className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'brands' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">ยี่ห้อ & รุ่นรถ</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'brands' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {brands.length}
              </span>
            </button>

            <button
              id="tab-btn-employees"
              onClick={() => setActiveTab('employees')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'employees'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-200/80 ring-1 ring-sky-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <Users className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'employees' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">พนักงานล้างรถ</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'employees' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {employees.length}
              </span>
            </button>

            <button
              id="tab-btn-users"
              onClick={() => setActiveTab('users')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-200/80 ring-1 ring-sky-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'users' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">สิทธิ์ผู้ใช้</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'users' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {userProfiles.length}
              </span>
            </button>

            <button
              id="tab-btn-roles"
              onClick={() => setActiveTab('roles')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-200/80 ring-1 ring-sky-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'roles' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">ตั้งค่าสิทธิ์</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                activeTab === 'roles' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {roles.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-6">
          {/* TAB 1: CAR COLORS */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Add New Color Form */}
              <form onSubmit={handleAddColor} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  เพิ่มสีรถใหม่ในรายการดรอปดาวน์
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      required
                      placeholder="เช่น ขาวมุก, ดำด้าน, แดงเมทัลลิก..."
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-xl border border-slate-200 cursor-pointer"
                      title="เลือกโค้ดสีแสดงตัวอย่าง"
                    />
                    <span className="font-mono text-xs text-slate-500">{newColorHex}</span>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มสี</span>
                  </button>
                </div>
              </form>

              {/* Color Grid List with Edit & Delete */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {colors.map((color) => {
                  const isEditing = editingColorId === color.id;

                  if (isEditing) {
                    return (
                      <div
                        key={color.id}
                        className="p-3 rounded-2xl bg-sky-50/70 border-2 border-sky-400 space-y-2.5"
                      >
                        <div className="text-[11px] font-bold text-sky-800">กำลังแก้ไขสีรถ:</div>
                        <input
                          type="text"
                          value={editColorName}
                          onChange={(e) => setEditColorName(e.target.value)}
                          placeholder="ชื่อสีรถ"
                          className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold focus:outline-none"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={editColorHex}
                              onChange={(e) => setEditColorHex(e.target.value)}
                              className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                            />
                            <span className="font-mono text-[11px] text-slate-600">{editColorHex}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingColorId(null)}
                              className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg text-xs transition-colors"
                              title="ยกเลิก"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => saveEditColor(color.id)}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Save className="w-3 h-3" />
                              <span>บันทึก</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={color.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-6 h-6 rounded-full border border-slate-300 shadow-xs shrink-0"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {color.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditColor(color)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="แก้ไขสีนี้"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteColor(color.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบสีนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BRANCHES */}
          {activeTab === 'branches' && (
            <div className="space-y-6">
              {/* Add New Branch Form */}
              <form onSubmit={handleAddBranch} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  เพิ่มสาขาใหม่
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="ชื่อสาขา เช่น สาขาลาดพร้าว (Ladprao)"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="รหัส เช่น LP"
                      value={newBranchCode}
                      onChange={(e) => setNewBranchCode(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มสาขา</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Branch List with Edit & Delete */}
              <div className="space-y-2">
                {branches.map((branch) => {
                  const isEditing = editingBranchId === branch.id;

                  if (isEditing) {
                    return (
                      <div
                        key={branch.id}
                        className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-400 space-y-3"
                      >
                        <div className="text-xs font-bold text-sky-800">กำลังแก้ไขข้อมูลสาขา:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={editBranchName}
                            onChange={(e) => setEditBranchName(e.target.value)}
                            placeholder="ชื่อสาขา"
                            className="sm:col-span-2 px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold focus:outline-none"
                          />
                          <input
                            type="text"
                            value={editBranchCode}
                            onChange={(e) => setEditBranchCode(e.target.value)}
                            placeholder="รหัสสาขา"
                            className="px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs uppercase font-mono focus:outline-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingBranchId(null)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-xl text-xs transition-colors"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => saveEditBranch(branch.id)}
                            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>บันทึกการแก้ไข</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={branch.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                          {branch.code}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">
                            {branch.name}
                          </div>
                          <div className="text-[11px] text-slate-400">รหัสสาขา: {branch.code}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditBranch(branch)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="แก้ไขสาขานี้"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบสาขานี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CAR BRANDS & MODELS */}
          {activeTab === 'brands' && (
            <div className="space-y-6">
              {/* Add New Brand Form */}
              <form onSubmit={handleAddBrand} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  เพิ่มยี่ห้อและรุ่นรถ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="ชื่อยี่ห้อ เช่น Bentley, Aston Martin"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="รุ่นรถ (คั่นด้วยจุลภาค เช่น Continental GT, Flying Spur)"
                    value={newBrandModels}
                    onChange={(e) => setNewBrandModels(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มยี่ห้อรถ</span>
                  </button>
                </div>
              </form>

              {/* Brands List with Edit & Delete */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...brands].sort((a, b) => sortEnFirstThenTh(a.name, b.name)).map((brand) => {
                  const isEditing = editingBrandId === brand.id;

                  if (isEditing) {
                    return (
                      <div
                        key={brand.id}
                        className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-400 space-y-3"
                      >
                        <div className="text-xs font-bold text-sky-800">กำลังแก้ไขยี่ห้อและรุ่นรถ:</div>
                        <input
                          type="text"
                          value={editBrandName}
                          onChange={(e) => setEditBrandName(e.target.value)}
                          placeholder="ชื่อยี่ห้อ"
                          className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold focus:outline-none"
                        />
                        <textarea
                          rows={2}
                          value={editBrandModels}
                          onChange={(e) => setEditBrandModels(e.target.value)}
                          placeholder="รุ่นรถ (คั่นด้วยจุลภาค เช่น C-Class, E-Class)"
                          className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingBrandId(null)}
                            className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded-lg text-xs transition-colors"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => saveEditBrand(brand.id)}
                            className="px-3.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>บันทึก</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const sortedBrandModels = [...brand.models].sort((a, b) => sortEnFirstThenTh(a, b));

                  return (
                    <div
                      key={brand.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{brand.name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditBrand(brand)}
                            className="p-1 text-slate-400 hover:text-sky-600 rounded-lg transition-colors"
                            title="แก้ไขยี่ห้อนี้"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="ลบยี่ห้อนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-1">
                        {sortedBrandModels.length > 0 ? (
                          sortedBrandModels.map((m, idx) => (
                            <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">ไม่มีรุ่นแนะนำ</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: EMPLOYEES */}
          {activeTab === 'employees' && (
            <div className="space-y-6">
              {/* Add New Employee Form */}
              <form onSubmit={handleAddEmployee} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  เพิ่มพนักงานล้างรถใหม่
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="ชื่อ-นามสกุล เช่น สมชาย ใจดี"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="ชื่อเล่น เช่น ชาย"
                    value={newEmpNickname}
                    onChange={(e) => setNewEmpNickname(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newEmpBranch}
                      onChange={(e) => setNewEmpBranch(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่ม</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Employee Grid with Edit & Delete */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {employees.map((emp) => {
                  const isEditing = editingEmpId === emp.id;
                  const empBranch = branches.find(b => b.id === emp.branchId)?.name || 'ทุกสาขา';

                  if (isEditing) {
                    return (
                      <div
                        key={emp.id}
                        className="p-3.5 rounded-2xl bg-sky-50/70 border-2 border-sky-400 space-y-2.5"
                      >
                        <div className="text-xs font-bold text-sky-800">กำลังแก้ไขข้อมูลพนักงาน:</div>
                        <input
                          type="text"
                          value={editEmpName}
                          onChange={(e) => setEditEmpName(e.target.value)}
                          placeholder="ชื่อ-นามสกุล"
                          className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold focus:outline-none"
                        />
                        <input
                          type="text"
                          value={editEmpNickname}
                          onChange={(e) => setEditEmpNickname(e.target.value)}
                          placeholder="ชื่อเล่น"
                          className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs focus:outline-none"
                        />
                        <select
                          value={editEmpBranch}
                          onChange={(e) => setEditEmpBranch(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs focus:outline-none"
                        >
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingEmpId(null)}
                            className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded-lg text-xs transition-colors"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => saveEditEmployee(emp.id)}
                            className="px-3.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>บันทึก</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={emp.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.nickname ? emp.nickname.charAt(0) : emp.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {emp.name} {emp.nickname ? `(${emp.nickname})` : ''}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{empBranch}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditEmployee(emp)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="แก้ไขพนักงาน"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบพนักงาน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: USERS & ROLE MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Toast message for user actions */}
              {userToast && (
                <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  userToast.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {userToast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                  <span>{userToast.message}</span>
                </div>
              )}

              {/* Add User Role Form */}
              <form onSubmit={handleAddUser} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    เพิ่มผู้ใช้งานใหม่และกำหนดสิทธิ์
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('roles')}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>จัดการ/เพิ่มประเภทสิทธิ์การใช้งาน ({roles.length} สิทธิ์) &rarr;</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">อีเมลผู้ใช้ (Email)*</label>
                    <input
                      type="email"
                      required
                      placeholder="user@carcare.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อที่แสดง (Display Name)*</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น สมชาย ใจดี"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">สิทธิ์การใช้งาน (Role)*</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.name}>
                          {r.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">รหัสผ่านเริ่มต้น*</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="อย่างน้อย 4 ตัว"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-xs transition-colors shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>เพิ่ม</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* User List with Edit & Delete */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  รายชื่อผู้ใช้และสิทธิ์ทั้งหมด ({userProfiles.length} บัญชี)
                </div>
                {userProfiles.map((user) => {
                  const isEditing = editingUserEmail?.toLowerCase() === user.email.toLowerCase();

                  if (isEditing) {
                    return (
                      <div
                        key={user.email}
                        className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-400 space-y-3"
                      >
                        <div className="text-xs font-bold text-sky-800">กำลังแก้ไขข้อมูลสิทธิ์ผู้ใช้:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">ชื่อที่แสดง</label>
                            <input
                              type="text"
                              value={editUserName}
                              onChange={(e) => setEditUserName(e.target.value)}
                              placeholder="ชื่อที่แสดง"
                              className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
                            <select
                              value={editUserRole}
                              onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                              className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs focus:outline-none"
                            >
                              {roles.map(r => (
                                <option key={r.id} value={r.name}>
                                  {r.displayName}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-amber-800 mb-1 flex items-center gap-1">
                              <KeyRound className="w-3 h-3 text-amber-600" />
                              <span>รีเซ็ตรหัสผ่านใหม่ (ไม่บังคับ)</span>
                            </label>
                            <input
                              type="text"
                              value={editUserNewPassword}
                              onChange={(e) => setEditUserNewPassword(e.target.value)}
                              placeholder="ระบุรหัสผ่านใหม่ (ว่างไว้ถ้าไม่เปลี่ยน)"
                              className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingUserEmail(null)}
                            className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded-lg text-xs transition-colors"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => saveEditUser(user.email)}
                            className="px-3.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>บันทึก</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const roleObj = roles.find(r => r.name.toLowerCase() === user.role.toLowerCase());
                  const theme = roleObj?.colorTheme || (user.role === 'Admin' ? 'sky' : user.role === 'Accounting' ? 'emerald' : 'amber');
                  const badgeClassMap: Record<string, string> = {
                    sky: 'bg-sky-50 text-sky-800 border-sky-200',
                    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    amber: 'bg-amber-50 text-amber-800 border-amber-300',
                    purple: 'bg-purple-50 text-purple-800 border-purple-200',
                    rose: 'bg-rose-50 text-rose-800 border-rose-200',
                    slate: 'bg-slate-100 text-slate-800 border-slate-300'
                  };

                  return (
                    <div
                      key={user.email}
                      className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{user.displayName || user.email}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${badgeClassMap[theme] || badgeClassMap.amber}`}
                          >
                            {roleObj?.name || user.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          • {roleObj?.description || 'สิทธิ์การใช้งานตามบทบาทที่กำหนด'}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
                        {/* Quick Role Change Selector */}
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleToggle(user.email, e.target.value as UserRole)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.name}>
                              {r.displayName}
                            </option>
                          ))}
                        </select>

                        {/* Icon-only Reset Password Action Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setResetUser(user);
                            setResetPasswordInput('');
                            setShowResetPassword(false);
                          }}
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl transition-colors cursor-pointer"
                          title="รีเซ็ตรหัสผ่านสำหรับผู้ใช้นี้"
                          aria-label="รีเซ็ตรหัสผ่าน"
                        >
                          <KeyRound className="w-4 h-4 shrink-0" />
                        </button>

                        {/* Icon-only Edit User Action Button */}
                        <button
                          type="button"
                          onClick={() => startEditUser(user)}
                          className="p-2 text-slate-500 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl transition-colors cursor-pointer"
                          title="แก้ไขชื่อและสิทธิ์"
                          aria-label="แก้ไข"
                        >
                          <Edit2 className="w-4 h-4 shrink-0" />
                        </button>

                        {/* Icon-only Delete User Action Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.email)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          title="ลบสิทธิ์ผู้ใช้นี้"
                          aria-label="ลบ"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: ROLE & PERMISSION CONFIGURATION */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {roleToast && (
                <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  roleToast.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {roleToast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                  <span>{roleToast.message}</span>
                </div>
              )}

              {/* Add New Role Form */}
              <form onSubmit={handleAddRole} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-sky-600" />
                      <span>เพิ่มสิทธิ์การใช้งานใหม่ (Add New Role)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      สร้างกลุ่มสิทธิ์การใช้งานใหม่พร้อมกำหนดขอบเขตการเข้าถึงเมนูและการจัดการข้อมูล
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      รหัส/ชื่อสิทธิ์ (Role Key)*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น Supervisor, Manager"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ชื่อแสดงผล (Display Name)*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น หัวหน้างาน (Supervisor)"
                      value={newRoleDisplayName}
                      onChange={(e) => setNewRoleDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      โทนสีป้ายกำกับ (Badge Color)
                    </label>
                    <select
                      value={newRoleColor}
                      onChange={(e) => setNewRoleColor(e.target.value as RoleConfig['colorTheme'])}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="sky">สีฟ้า (Sky Blue)</option>
                      <option value="emerald">สีเขียว (Emerald)</option>
                      <option value="amber">สีเหลืองอำพัน (Amber)</option>
                      <option value="purple">สีม่วง (Purple)</option>
                      <option value="rose">สีแดงโรส (Rose)</option>
                      <option value="slate">สีเทาเข้ม (Slate)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    คำอธิบายสิทธิ์การใช้งาน
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ตรวจสอบสรุปยอดรายสาขา แก้ไขและลบข้อมูลรถได้"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {/* Permissions Checkboxes */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                    กำหนดสิทธิ์การเข้าถึงและการทำงาน:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      { key: 'canViewDashboard' as const, label: 'ดูหน้าสรุปผลงาน (Dashboard)' },
                      { key: 'canAddRecord' as const, label: 'เพิ่มข้อมูลรถล้างใหม่' },
                      { key: 'canEditRecord' as const, label: 'แก้ไขประวัติรถล้าง' },
                      { key: 'canDeleteRecord' as const, label: 'ลบรายการรถล้าง' },
                      { key: 'canExportExcel' as const, label: 'Export ไฟล์ Excel (.xlsx)' },
                      { key: 'canManageSettings' as const, label: 'ตั้งค่าระบบ & Google Sheet' },
                    ].map(item => (
                      <label
                        key={item.key}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          newRolePerms[item.key]
                            ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newRolePerms[item.key]}
                          onChange={(e) =>
                            setNewRolePerms(prev => ({ ...prev, [item.key]: e.target.checked }))
                          }
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มสิทธิ์การใช้งาน</span>
                  </button>
                </div>
              </form>

              {/* Existing Roles List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  รายการสิทธิ์การใช้งานทั้งหมด ({roles.length} สิทธิ์)
                </div>

                {roles.map((role) => {
                  const isEditing = editingRoleId === role.id;
                  const assignedUsersCount = userProfiles.filter(
                    u => u.role.toLowerCase() === role.name.toLowerCase()
                  ).length;

                  const badgeColors: Record<string, string> = {
                    sky: 'bg-sky-50 text-sky-800 border-sky-200',
                    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    amber: 'bg-amber-50 text-amber-800 border-amber-300',
                    purple: 'bg-purple-50 text-purple-800 border-purple-200',
                    rose: 'bg-rose-50 text-rose-800 border-rose-200',
                    slate: 'bg-slate-100 text-slate-800 border-slate-300'
                  };

                  if (isEditing) {
                    return (
                      <div
                        key={role.id}
                        className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-400 space-y-3"
                      >
                        <div className="text-xs font-bold text-sky-800">
                          กำลังแก้ไขสิทธิ์การใช้งาน: {role.displayName}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">รหัส/ชื่อสิทธิ์</label>
                            <input
                              type="text"
                              disabled={role.name === 'Admin'}
                              value={editRoleName}
                              onChange={(e) => setEditRoleName(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold focus:outline-none disabled:opacity-60"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">ชื่อแสดงผล</label>
                            <input
                              type="text"
                              value={editRoleDisplayName}
                              onChange={(e) => setEditRoleDisplayName(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">โทนสีป้ายกำกับ</label>
                            <select
                              value={editRoleColor}
                              onChange={(e) => setEditRoleColor(e.target.value as RoleConfig['colorTheme'])}
                              className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs focus:outline-none"
                            >
                              <option value="sky">สีฟ้า (Sky Blue)</option>
                              <option value="emerald">สีเขียว (Emerald)</option>
                              <option value="amber">สีเหลืองอำพัน (Amber)</option>
                              <option value="purple">สีม่วง (Purple)</option>
                              <option value="rose">สีแดงโรส (Rose)</option>
                              <option value="slate">สีเทาเข้ม (Slate)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">คำอธิบายสิทธิ์</label>
                          <input
                            type="text"
                            value={editRoleDescription}
                            onChange={(e) => setEditRoleDescription(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                          {[
                            { key: 'canViewDashboard' as const, label: 'ดูหน้าสรุปผลงาน (Dashboard)' },
                            { key: 'canAddRecord' as const, label: 'เพิ่มข้อมูลรถล้างใหม่' },
                            { key: 'canEditRecord' as const, label: 'แก้ไขประวัติรถล้าง' },
                            { key: 'canDeleteRecord' as const, label: 'ลบรายการรถล้าง' },
                            { key: 'canExportExcel' as const, label: 'Export ไฟล์ Excel (.xlsx)' },
                            { key: 'canManageSettings' as const, label: 'ตั้งค่าระบบ & Google Sheet' },
                          ].map(item => (
                            <label
                              key={item.key}
                              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-sky-200 text-xs font-medium cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                disabled={role.name === 'Admin'}
                                checked={role.name === 'Admin' ? true : editRolePerms[item.key]}
                                onChange={(e) =>
                                  setEditRolePerms(prev => ({ ...prev, [item.key]: e.target.checked }))
                                }
                                className="rounded text-sky-600"
                              />
                              <span>{item.label}</span>
                            </label>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingRoleId(null)}
                            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditRole(role.id)}
                            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>บันทึกการแก้ไข</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={role.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{role.displayName}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${badgeColors[role.colorTheme] || badgeColors.slate}`}>
                              {role.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              (ใช้งานอยู่ {assignedUsersCount} บัญชี)
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditRole(role)}
                            className="p-2 text-slate-500 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl transition-colors cursor-pointer"
                            title="แก้ไขสิทธิ์การใช้งาน"
                            aria-label="แก้ไขสิทธิ์การใช้งาน"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {role.name !== 'Admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(role)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title="ลบสิทธิ์การใช้งานนี้"
                              aria-label="ลบสิทธิ์การใช้งาน"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quick Interactive Permission Toggles */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pt-2 border-t border-slate-100">
                        {[
                          { key: 'canViewDashboard' as const, label: 'ดู Dashboard' },
                          { key: 'canAddRecord' as const, label: 'เพิ่มรถล้าง' },
                          { key: 'canEditRecord' as const, label: 'แก้ไขรายการ' },
                          { key: 'canDeleteRecord' as const, label: 'ลบรายการ' },
                          { key: 'canExportExcel' as const, label: 'Export Excel' },
                          { key: 'canManageSettings' as const, label: 'ตั้งค่าระบบ' },
                        ].map(perm => {
                          const enabled = role.permissions[perm.key];
                          return (
                            <button
                              key={perm.key}
                              type="button"
                              disabled={role.name === 'Admin'}
                              onClick={() => handleToggleRolePermission(role.id, perm.key)}
                              title={role.name === 'Admin' ? 'สิทธิ์ผู้ดูแลระบบหลักเปิดทุกสิทธิ์เสมอ' : 'คลิกเพื่อเปิด/ปิดสิทธิ์นี้'}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1 transition-all ${
                                enabled
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200/70 line-through'
                              } ${role.name === 'Admin' ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                            >
                              {enabled && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                              <span className="truncate">{perm.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reset Password Mini Modal */}
        {resetUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">รีเซ็ตรหัสผ่านผู้ใช้งาน</h4>
                    <p className="text-[11px] text-slate-400">สำหรับผู้ดูแลระบบกำหนดรหัสผ่านใหม่</p>
                  </div>
                </div>
                <button 
                  onClick={() => setResetUser(null)} 
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <p className="text-xs text-slate-700">
                  กำลังตั้งรหัสผ่านใหม่ให้กับ: <strong className="text-slate-900">{resetUser.displayName || resetUser.email}</strong>
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{resetUser.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    สิทธิ์: {resetUser.role}
                  </span>
                </div>
              </div>

              <form onSubmit={handleResetUserPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)*
                  </label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={resetPasswordInput}
                      onChange={(e) => setResetPasswordInput(e.target.value)}
                      placeholder="ระบุรหัสผ่านใหม่ เช่น 123456"
                      className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Password Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">คำแนะนำรหัสผ่านด่วน:</span>
                  <button
                    type="button"
                    onClick={() => setResetPasswordInput('123456')}
                    className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
                  >
                    123456
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetPasswordInput('admin1234')}
                    className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
                  >
                    admin1234
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPass = Math.random().toString(36).substring(2, 8);
                      setResetPasswordInput(randomPass);
                    }}
                    className="text-[11px] px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md border border-amber-200 transition-colors cursor-pointer"
                  >
                    สุ่มรหัสผ่านอัตโนมัติ
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setResetUser(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>บันทึกรหัสผ่านใหม่</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            การเปลี่ยนแปลงจะถูกบันทึกลงระบบทันที
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
