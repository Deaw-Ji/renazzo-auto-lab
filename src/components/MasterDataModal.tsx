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
  RotateCcw
} from 'lucide-react';
import { 
  CarColor, 
  Branch, 
  CarBrand, 
  Employee, 
  UserProfile, 
  UserRole 
} from '../types';

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: CarColor[];
  branches: Branch[];
  brands: CarBrand[];
  employees: Employee[];
  userProfiles: UserProfile[];
  onUpdateColors: (colors: CarColor[]) => void;
  onUpdateBranches: (branches: Branch[]) => void;
  onUpdateBrands: (brands: CarBrand[]) => void;
  onUpdateEmployees: (employees: Employee[]) => void;
  onUpdateUserProfiles: (users: UserProfile[]) => void;
}

type ActiveTab = 'colors' | 'branches' | 'brands' | 'employees' | 'users';

export const MasterDataModal: React.FC<MasterDataModalProps> = ({
  isOpen,
  onClose,
  colors,
  branches,
  brands,
  employees,
  userProfiles,
  onUpdateColors,
  onUpdateBranches,
  onUpdateBrands,
  onUpdateEmployees,
  onUpdateUserProfiles
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
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');

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
  const [editUserRole, setEditUserRole] = useState<UserRole>('staff');

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
    const newUser: UserProfile = {
      uid: `u_${Date.now()}`,
      email: newUserEmail.trim().toLowerCase(),
      displayName: newUserName.trim() || newUserEmail.trim(),
      role: newUserRole
    };
    onUpdateUserProfiles([...userProfiles, newUser]);
    setNewUserEmail('');
    setNewUserName('');
  };

  const startEditUser = (user: UserProfile) => {
    setEditingUserEmail(user.email);
    setEditUserName(user.displayName || '');
    setEditUserRole(user.role);
  };

  const saveEditUser = (email: string) => {
    onUpdateUserProfiles(
      userProfiles.map(u => u.email.toLowerCase() === email.toLowerCase() ? {
        ...u,
        displayName: editUserName.trim() || u.email,
        role: editUserRole
      } : u)
    );
    setEditingUserEmail(null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="master-data-modal-container"
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-600" />
              <span>จัดการข้อมูลพื้นฐานของระบบ (Master Data Management)</span>
            </h2>
            <p className="text-xs text-slate-500">
              สำหรับผู้ดูแลระบบ (Admin) เพื่อเพิ่ม แก้ไข และลบข้อมูลสีรถ สาขา ยี่ห้อ พนักงาน และสิทธิ์ผู้ใช้งาน
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-2 overflow-x-auto">
          <button
            id="tab-btn-colors"
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'colors'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>สีรถ ({colors.length})</span>
          </button>

          <button
            id="tab-btn-branches"
            onClick={() => setActiveTab('branches')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'branches'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>สาขา ({branches.length})</span>
          </button>

          <button
            id="tab-btn-brands"
            onClick={() => setActiveTab('brands')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'brands'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>ยี่ห้อ & รุ่นรถ ({brands.length})</span>
          </button>

          <button
            id="tab-btn-employees"
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'employees'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>พนักงานล้างรถ ({employees.length})</span>
          </button>

          <button
            id="tab-btn-users"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'users'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>สิทธิ์ผู้ใช้ ({userProfiles.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
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
                {brands.map((brand) => {
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
                          placeholder="รุ่นรถ (คั่นด้วยจุลภาค)"
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
                        {brand.models.length > 0 ? (
                          brand.models.map((m, idx) => (
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
              {/* Add User Role Form */}
              <form onSubmit={handleAddUser} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  กำหนดสิทธิ์ผู้ใช้งาน (Admin / Staff)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="email"
                    required
                    placeholder="อีเมล เช่น user@premium-auto.co.th"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="ชื่อที่แสดง เช่น คุณจิรา"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="staff">พนักงานทั่วไป (Staff)</option>
                      <option value="admin">ผู้ดูแลระบบ (Admin)</option>
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

              {/* User List with Edit & Delete */}
              <div className="space-y-2">
                {userProfiles.map((user) => {
                  const isEditing = editingUserEmail?.toLowerCase() === user.email.toLowerCase();
                  const isAdmin = user.role === 'admin';

                  if (isEditing) {
                    return (
                      <div
                        key={user.email}
                        className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-400 space-y-3"
                      >
                        <div className="text-xs font-bold text-sky-800">กำลังแก้ไขข้อมูลสิทธิ์ผู้ใช้:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editUserName}
                            onChange={(e) => setEditUserName(e.target.value)}
                            placeholder="ชื่อที่แสดง"
                            className="px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold focus:outline-none"
                          />
                          <select
                            value={editUserRole}
                            onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                            className="px-3 py-1.5 bg-white border border-sky-300 rounded-lg text-xs focus:outline-none"
                          >
                            <option value="staff">พนักงานทั่วไป (Staff)</option>
                            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                          </select>
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

                  return (
                    <div
                      key={user.email}
                      className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{user.displayName || user.email}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isAdmin
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isAdmin ? 'ADMIN' : 'STAFF'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => startEditUser(user)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="แก้ไขชื่อและสิทธิ์"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRoleToggle(user.email, isAdmin ? 'staff' : 'admin')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                            isAdmin
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                              : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200'
                          }`}
                        >
                          {isAdmin ? 'เปลี่ยนเป็น Staff' : 'ตั้งเป็น Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบสิทธิ์ผู้ใช้นี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            การเปลี่ยนแปลงจะถูกบันทึกลงระบบทันที
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
