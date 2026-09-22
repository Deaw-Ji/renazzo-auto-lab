import React from 'react';
import { Sparkles, FileSpreadsheet, Lock } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onGoogleSignIn: () => Promise<void>;
  onDemoSignIn?: (user: UserProfile) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoogleSignIn,
  isLoading,
  errorMessage
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* App Logo & Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Renazzo Auto Lab
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            ระบบบันทึกประวัติรถล้าง
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Google Login Button */}
          <div className="space-y-4">
            <button
              id="google-signin-btn"
              type="button"
              disabled={isLoading}
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-sm font-semibold shadow-xs hover:border-slate-400 transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google Account'}</span>
            </button>

            <div className="text-center space-y-1 py-1">
              <div className="flex items-center gap-2 justify-center text-xs text-slate-600 font-medium">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ซิงค์ข้อมูลกับ Google Sheet กลางอัตโนมัติ</span>
              </div>
              <p className="text-[11px] text-slate-400">
                (สามารถใช้บัญชี Gmail ทั่วไป หรือ Google Account องค์กร เข้าสู่ระบบได้)
              </p>
            </div>
          </div>

          {/* Security note */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>ระบบรักษาความปลอดภัยและการควบคุมสิทธิ์เฉพาะองค์กร</span>
          </div>
        </div>
      </div>
    </div>
  );
};
