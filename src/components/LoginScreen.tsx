import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { RenazzoLogo } from './RenazzoLogo';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  errorMessage?: string | null;
  onQuickLogin?: (email: string, password: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  isLoading,
  errorMessage
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const activeError = localError || errorMessage;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Sarabun',sans-serif]">
      {/* Subtle brand ambient lighting matching Renazzo Blue (#1455a5) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1455a5]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <RenazzoLogo 
            size="xl" 
            align="center" 
            showSubtitle={true}
            subtitleText="ระบบบันทึกประวัติรถล้างและจัดเก็บข้อมูล" 
          />
        </div>

        {/* Login Card with Renazzo Color Tone */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/70 border border-slate-200 rounded-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1455a5]" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </h2>
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
                  placeholder="name@carcare.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1455a5] focus:border-[#1455a5] focus:bg-white transition-all shadow-2xs"
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1455a5] focus:border-[#1455a5] focus:bg-white transition-all font-mono shadow-2xs"
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
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1455a5] hover:bg-[#0f4383] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#1455a5]/25 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Clean Corporate Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Renazzo Auto Lab • ระบบควบคุมและจัดเก็บข้อมูลรถล้าง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
