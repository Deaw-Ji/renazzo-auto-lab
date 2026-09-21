import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Link2,
  ShieldCheck,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { GoogleSheetConfig } from '../types';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetConfig: GoogleSheetConfig | null;
  onConnectOrCreate: () => Promise<void>;
  onConnectCustomSheet: (urlOrId: string) => Promise<void>;
  onFullSync: () => Promise<void>;
  onPullFromSheet: () => Promise<void>;
  isSyncing: boolean;
  hasOAuthToken: boolean;
  onReauthGoogle: () => Promise<void>;
  isAdmin: boolean;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  sheetConfig,
  onConnectOrCreate,
  onConnectCustomSheet,
  onFullSync,
  onPullFromSheet,
  isSyncing,
  hasOAuthToken,
  onReauthGoogle,
  isAdmin
}) => {
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (!hasOAuthToken) {
        await onReauthGoogle();
      }
      await onConnectOrCreate();
      setSuccessMessage('สร้างและเชื่อมต่อ Master Google Sheet กลางสำเร็จแล้ว! ทุกคนในระบบจะใช้ชีตนี้ร่วมกัน');
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อ Google Sheet ได้');
    }
  };

  const handleCustomConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSheetInput.trim()) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (!hasOAuthToken) {
        await onReauthGoogle();
      }
      await onConnectCustomSheet(customSheetInput.trim());
      setSuccessMessage('เชื่อมต่อกับ Master Google Sheet ที่ระบุสำเร็จแล้ว! บันทึกเป็นชีตกลางของระบบเรียบร้อย');
      setCustomSheetInput('');
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อชีตที่ระบุได้');
    }
  };

  const handlePush = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await onFullSync();
      setSuccessMessage('ส่งข้อมูลทั้งหมดขึ้น Google Sheet กลางสำเร็จแล้ว!');
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  };

  const handlePull = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await onPullFromSheet();
      setSuccessMessage('ดึงข้อมูลล่าสุดจาก Google Sheet เรียบร้อยแล้ว!');
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
  };

  const handleCopyLink = () => {
    if (sheetConfig?.spreadsheetUrl) {
      navigator.clipboard.writeText(sheetConfig.spreadsheetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="sheet-settings-modal-container"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Google Sheets กลาง (Master Sheet)
              </h2>
              <p className="text-xs text-slate-500">
                ซิงค์ข้อมูลร่วมกันระหว่างพนักงานและผู้ดูแลระบบ
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

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Connection Status Box */}
          <div className={`p-4 rounded-2xl border ${
            sheetConfig?.isConnected 
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/60 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${sheetConfig?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-bold text-sm">
                  {sheetConfig?.isConnected ? 'เชื่อมต่อ Master Google Sheet แล้ว' : 'ยังไม่ได้เชื่อมต่อ Master Google Sheet'}
                </span>
              </div>
              {sheetConfig?.isConnected && (
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Users className="w-3 h-3" /> แชร์ให้ทุกคนในระบบ
                </span>
              )}
            </div>

            {sheetConfig?.isConnected ? (
              <div className="space-y-2 mt-3 text-xs">
                <div>
                  <span className="text-slate-500">Spreadsheet ID: </span>
                  <span className="font-mono font-semibold text-slate-800 break-all">{sheetConfig.spreadsheetId}</span>
                </div>
                <div>
                  <span className="text-slate-500">ซิงค์ล่าสุด: </span>
                  <span className="font-mono text-slate-700">
                    {sheetConfig.lastSyncedAt ? new Date(sheetConfig.lastSyncedAt).toLocaleString('th-TH') : 'กำลังทำงานอัตโนมัติ'}
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={sheetConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-700 font-semibold text-xs hover:bg-emerald-50 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดดูใน Google Sheets</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์ชีต'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-700 mt-1">
                ระบบต้องการ Master Google Sheet กลาง 1 ไฟล์ เพื่อให้พนักงานทุกคนบันทึกและซิงค์ลงชีตเดียวกัน
              </p>
            )}
          </div>

          {/* Action Buttons for Connected Sheet */}
          {sheetConfig?.isConnected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isSyncing}
                onClick={handlePush}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>ซิงค์ข้อมูลทั้งหมดขึ้น Google Sheet</span>
              </button>

              <button
                type="button"
                disabled={isSyncing}
                onClick={handlePull}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5 text-slate-600" />
                <span>ดึงข้อมูลล่าสุดจาก Google Sheet</span>
              </button>
            </div>
          )}

          {/* Custom Sheet Link Input (Admin only or if not connected) */}
          {isAdmin && (
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-slate-500" />
                <span>ระบุ Google Sheet กลางด้วยลิงก์หรือ Spreadsheet ID</span>
              </h3>
              <form onSubmit={handleCustomConnect} className="space-y-2">
                <input
                  type="text"
                  value={customSheetInput}
                  onChange={(e) => setCustomSheetInput(e.target.value)}
                  placeholder="วางลิงก์ https://docs.google.com/spreadsheets/d/... หรือ ID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSyncing || !customSheetInput.trim()}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    ตั้งเป็น Master Sheet กลางของระบบ
                  </button>
                  {!sheetConfig?.isConnected && (
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={handleConnect}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      สร้างใหม่อัตโนมัติ
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Sharing Instructions */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-sky-950 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              <span>วิธีแชร์ให้พนักงานทุกคนใช้งานไฟล์เดียวกัน</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
              <li>เปิด Google Sheet ของคุณขึ้นมา</li>
              <li>กดปุ่ม <strong>"แชร์ (Share)"</strong> มุมขวาบนของ Google Sheet</li>
              <li>เปลี่ยนสิทธิ์เป็น <strong>"ทุกคนที่มีลิงก์ (Anyone with the link)"</strong> หรือใส่อีเมลพนักงาน แล้วเลือกเป็น <strong>"ผู้แก้ไข (Editor)"</strong></li>
              <li>เพียงเท่านี้ เมื่อพนักงานเข้าสู่ระบบ ทุกคนจะบันทึกข้อมูลลงไฟล์เดียวกัน 100% ครับ</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
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
