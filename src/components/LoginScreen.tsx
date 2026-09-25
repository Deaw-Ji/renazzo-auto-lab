import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, UserCheck, Calculator, ArrowRight, FileSpreadsheet, Sparkles } from 'lucide-react';
import { RenazzoLogo } from './RenazzoLogo';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onQuickLogin?: (email: string, password: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onQuickLogin,
  isLoading,
  errorMessage
}) => {
  const [email, setEmail] = useState('admin@carcare.com');
  const [password, setPassword] = useState('admin1234');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    const success = await onLogin(email.trim(), password);
    if (!success) {
      setLocalError('อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง');
    }
  };

  const handleSelectQuickAccount = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setLocalError(null);
    if (onQuickLogin) {
      onQuickLogin(quickEmail, quickPass);
    }
  };

  const activeError = localError || errorMessage;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 via-sky-50/30 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Sarabun',sans-serif]">
      {/* Soft Ambient Background Lighting matching Renazzo brand */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center justify-center mb-6">
          <RenazzoLogo 
            size="xl" 
            align="center" 
            showSubtitle={true}
            subtitleText="ระบบบันทึกประวัติรถล้างและจัดเก็บข้อมูล" 
          />
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/70 border border-slate-200/90 rounded-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">เข้าสู่ระบบ (Sign In)</h2>
            <p className="text-xs text-slate-500 mt-1">
              ระบบจัดการและควบคุมสิทธิ์การใช้งานภายในองค์กร (RBAC)
            </p>
          </div>

          {activeError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{activeError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                อีเมล (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@carcare.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Section for the 3 roles */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>คลิกเพื่อทดสอบเข้าใช้งานตามสิทธิ์ (3 Roles):</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Role 1: Admin */}
              <button
                type="button"
                onClick={() => handleSelectQuickAccount('admin@carcare.com', 'admin1234')}
                className="flex items-center justify-between p-2.5 rounded-2xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/90 hover:border-sky-300 transition-all text-left group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-950">1. ผู้ดูแลระบบ (Admin)</div>
                    <div className="text-[11px] text-sky-700 font-mono">admin@carcare.com • admin1234</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sky-800 bg-white/90 border border-sky-200 px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
                  สิทธิ์เต็ม / ลบงานได้
                </span>
              </button>

              {/* Role 2: Accounting */}
              <button
                type="button"
                onClick={() => handleSelectQuickAccount('accounting@carcare.com', 'acc1234')}
                className="flex items-center justify-between p-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/90 hover:border-emerald-300 transition-all text-left group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">2. ฝ่ายบัญชี (Accounting)</div>
                    <div className="text-[11px] text-emerald-700 font-mono">accounting@carcare.com • acc1234</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-white/90 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
                  ดูสรุป / Export Excel
                </span>
              </button>

              {/* Role 3: Administration Officer */}
              <button
                type="button"
                onClick={() => handleSelectQuickAccount('officer@carcare.com', 'officer1234')}
                className="flex items-center justify-between p-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/90 hover:border-amber-300 transition-all text-left group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-950">3. เจ้าหน้าที่ธุรการ (Officer)</div>
                    <div className="text-[11px] text-amber-700 font-mono">officer@carcare.com • officer1234</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-white/90 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-2xs shrink-0">
                  บันทึกงาน / ห้ามลบ
                </span>
              </button>
            </div>
          </div>

          {/* Footer Sync Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>เชื่อมต่อจัดเก็บข้อมูลผ่าน Google Sheets 3 แท็บอัตโนมัติ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
