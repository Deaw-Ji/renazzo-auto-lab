import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Calculator, 
  UserCheck, 
  KeyRound, 
  Trash2, 
  Edit2, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Search
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  currentUser: UserProfile;
  onAddUser: (user: { email: string; displayName: string; role: UserRole; password: string }) => { success: boolean; message: string };
  onUpdateUser: (uid: string, details: { displayName: string; role: UserRole }) => { success: boolean; message: string };
  onResetPassword: (uid: string, newPass: string) => { success: boolean; message: string };
  onDeleteUser: (uid: string) => { success: boolean; message: string };
  onSyncUsersToSheet?: () => Promise<void>;
  isSyncing?: boolean;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onResetPassword,
  onDeleteUser,
  onSyncUsersToSheet,
  isSyncing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Administration Officer');
  const [newPassword, setNewPassword] = useState('');

  // Editing state
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Administration Officer');

  // Reset password state
  const [resettingUser, setResettingUser] = useState<UserProfile | null>(null);
  const [resetNewPass, setResetNewPass] = useState('');

  // Messages
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onAddUser({
      email: newEmail,
      displayName: newName,
      role: newRole,
      password: newPassword
    });

    if (res.success) {
      showToast(res.message, 'success');
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setIsAdding(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleSaveEdit = (uid: string) => {
    const res = onUpdateUser(uid, {
      displayName: editName,
      role: editRole
    });

    if (res.success) {
      showToast(res.message, 'success');
      setEditingUid(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    const res = onResetPassword(resettingUser.uid, resetNewPass);
    if (res.success) {
      showToast(res.message, 'success');
      setResettingUser(null);
      setResetNewPass('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleDelete = (u: UserProfile) => {
    if (u.uid === currentUser.uid) {
      showToast('ไม่สามารถลบบัญชีของตนเองที่กำลังเข้าสู่ระบบได้', 'error');
      return;
    }

    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${u.displayName}" (${u.email}) ออกจากระบบ?`)) {
      const res = onDeleteUser(u.uid);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ผู้ดูแลระบบ (Admin)</span>
          </span>
        );
      case 'Accounting':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Calculator className="w-3.5 h-3.5" />
            <span>ฝ่ายบัญชี (Accounting)</span>
          </span>
        );
      case 'Administration Officer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <UserCheck className="w-3.5 h-3.5" />
            <span>เจ้าหน้าที่ธุรการ (Officer)</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-600">{role}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs font-['Sarabun',sans-serif] animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                จัดการรายชื่อผู้ใช้งาน (User Management)
              </h2>
              <p className="text-xs text-slate-500">
                กำหนดสิทธิ์ 3 บทบาท (Admin, Accounting, Administration Officer) ซิงค์กับแท็บ Users ใน Google Sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
            toastMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ, อีเมล หรือสิทธิ์..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {onSyncUsersToSheet && (
              <button
                type="button"
                onClick={onSyncUsersToSheet}
                disabled={isSyncing}
                title="ซิงค์รายชื่อผู้ใช้ทั้งหมดไปยังแท็บ Users ใน Google Sheet"
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>ซิงค์ Users ไป Google Sheet</span>
              </button>
            )}

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAdding ? 'ปิดฟอร์มเพิ่ม' : 'เพิ่มผู้ใช้งานใหม่'}</span>
            </button>
          </div>
        </div>

        {/* Add User Form Drawer */}
        {isAdding && (
          <div className="bg-sky-50/60 p-5 border-b border-sky-100 animate-in slide-in-from-top duration-200">
            <h3 className="text-xs font-bold text-sky-950 mb-3 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-sky-600" />
              <span>สร้างบัญชีผู้ใช้งานใหม่</span>
            </h3>
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">อีเมล (Email)*</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@carcare.com"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล (Name)*</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="สมชาย ใจดี"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">สิทธิ์การใช้งาน (Role)*</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="Admin">Admin (ผู้ดูแลระบบ - สิทธิ์เต็ม/ลบข้อมูลได้)</option>
                  <option value="Accounting">Accounting (ฝ่ายบัญชี - ดูสรุป/ห้ามลบ)</option>
                  <option value="Administration Officer">Administration Officer (เจ้าหน้าที่ธุรการ - บันทึกงาน/ห้ามลบ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">รหัสผ่านเริ่มต้น*</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="อย่างน้อย 4 ตัวอักษร"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  บันทึกผู้ใช้ใหม่
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">User ID</th>
                <th className="py-2.5 px-3">ชื่อและอีเมล</th>
                <th className="py-2.5 px-3">สิทธิ์ (Role)</th>
                <th className="py-2.5 px-3">เข้าสู่ระบบล่าสุด</th>
                <th className="py-2.5 px-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((u) => {
                const isEditing = editingUid === u.uid;
                const isCurrent = u.uid === currentUser.uid;

                return (
                  <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {u.uid}
                    </td>

                    <td className="py-3 px-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 border border-sky-300 rounded-lg text-xs w-full max-w-[200px]"
                        />
                      ) : (
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{u.displayName}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                คุณ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {isEditing ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as UserRole)}
                          className="px-2 py-1 border border-sky-300 rounded-lg text-xs bg-white"
                        >
                          <option value="Admin">Admin (ผู้ดูแลระบบ)</option>
                          <option value="Accounting">Accounting (ฝ่ายบัญชี)</option>
                          <option value="Administration Officer">Administration Officer (เจ้าหน้าที่ธุรการ)</option>
                        </select>
                      ) : (
                        getRoleBadge(u.role)
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('th-TH') : '-'}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(u.uid)}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors"
                            title="บันทึก"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUid(null)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            title="ยกเลิก"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingUid(u.uid);
                              setEditName(u.displayName);
                              setEditRole(u.role);
                            }}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="แก้ไขชื่อและสิทธิ์"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setResettingUser(u);
                              setResetNewPass('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="รีเซ็ตรหัสผ่านสำหรับผู้ใช้นี้"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="ลบผู้ใช้งาน"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Reset Password Mini Modal */}
        {resettingUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-800">รีเซ็ตรหัสผ่าน</h4>
                </div>
                <button onClick={() => setResettingUser(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                ตั้งรหัสผ่านใหม่สำหรับ: <strong className="text-slate-800">{resettingUser.displayName}</strong> ({resettingUser.email})
              </p>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  placeholder="ระบุรหัสผ่านใหม่ (อย่างน้อย 4 ตัว)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setResettingUser(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    บันทึกรหัสผ่านใหม่
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ซิงค์ตรงกับแท็บ 'Users' ใน Google Sheet กลาง</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
