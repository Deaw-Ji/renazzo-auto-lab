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
  Copy,
  Check,
  Code2,
  Download,
  ShieldCheck,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import { GoogleSheetConfig, CarWashRecord, UserProfile, MasterSettingsData } from '../types';
import { APPS_SCRIPT_TEMPLATE } from '../lib/googleSheetsService';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetConfig: GoogleSheetConfig | null;
  onConnectWebApp: (url: string) => Promise<void>;
  onFullSync: () => Promise<void>;
  onPullFromSheet: () => Promise<void>;
  onExportExcel: () => void;
  isSyncing: boolean;
  isAdmin: boolean;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  sheetConfig,
  onConnectWebApp,
  onFullSync,
  onPullFromSheet,
  onExportExcel,
  isSyncing,
  isAdmin
}) => {
  const [webAppUrlInput, setWebAppUrlInput] = useState(sheetConfig?.webAppUrl || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webAppUrlInput.trim()) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onConnectWebApp(webAppUrlInput.trim());
      setSuccessMessage('เชื่อมต่อ Google Sheet และดึงข้อมูลเดิมที่มีอยู่เข้ามาในระบบเรียบร้อยแล้ว!');
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อ Google Sheets Web App ได้');
    }
  };

  const handleManualPush = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await onFullSync();
      setSuccessMessage('ส่งข้อมูลทั้งหมดขึ้น 3 แท็บ (Jobs, Users, Settings) ใน Google Sheet สำเร็จแล้ว!');
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  };

  const handleManualPull = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await onPullFromSheet();
      setSuccessMessage('ดึงข้อมูลล่าสุดจาก Google Sheet ทั้ง 3 แท็บเรียบร้อยแล้ว!');
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 font-['Sarabun',sans-serif]">
      <div 
        id="sheet-settings-modal-container"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ตั้งค่า Google Sheets กลาง (Web App API)
              </h2>
              <p className="text-xs text-slate-500">
                เชื่อมต่อและจัดเก็บข้อมูลแยก 3 แท็บ: 'Jobs', 'Users', 'Settings_MasterData'
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Connection Status Box */}
          <div className={`p-4 rounded-2xl border ${
            sheetConfig?.isConnected 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${sheetConfig?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-bold text-sm">
                  {sheetConfig?.isConnected ? 'เชื่อมต่อ Google Sheet กลางเรียบร้อย' : 'ยังไม่ได้เชื่อมต่อ Google Sheet'}
                </span>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-100/90 text-emerald-800 px-2 py-0.5 rounded-md">
                3 แท็บ: Jobs | Users | Settings
              </span>
            </div>

            {sheetConfig?.isConnected ? (
              <div className="space-y-2 mt-3 text-xs">
                <div>
                  <span className="text-slate-500">Web App URL: </span>
                  <span className="font-mono font-medium text-slate-800 break-all">{sheetConfig.webAppUrl}</span>
                </div>
                <div>
                  <span className="text-slate-500">ซิงค์ล่าสุด: </span>
                  <span className="font-mono text-slate-700">
                    {sheetConfig.lastSyncedAt ? new Date(sheetConfig.lastSyncedAt).toLocaleString('th-TH') : 'พร้อมใช้งาน'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-800 mt-1">
                โปรดนำ Web App URL จาก Google Apps Script มาใส่เพื่อเชื่อมต่อและดึงข้อมูลเดิมมาแสดงผล
              </p>
            )}
          </div>

          {/* Sync & Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              disabled={isSyncing || !sheetConfig?.webAppUrl}
              onClick={handleManualPull}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4 text-sky-600" />
              <span>ดึงข้อมูลล่าสุด (Pull)</span>
            </button>

            <button
              type="button"
              disabled={isSyncing || !sheetConfig?.webAppUrl}
              onClick={handleManualPush}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <ArrowUpFromLine className="w-4 h-4" />
              <span>ส่งข้อมูลไป Sheet (Sync/Push)</span>
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="ดาวน์โหลดข้อมูลทั้งหมดเป็นไฟล์ Excel (.xlsx) ครบ 3 แท็บ"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export Excel (.xlsx)</span>
            </button>
          </div>

          {/* Connect Input Form (Admin Only) */}
          {isAdmin && (
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-slate-500" />
                <span>ระบุ Google Apps Script Web App URL (doGet / doPost)</span>
              </h3>
              <form onSubmit={handleConnect} className="space-y-2">
                <input
                  type="url"
                  required
                  value={webAppUrlInput}
                  onChange={(e) => setWebAppUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSyncing || !webAppUrlInput.trim()}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>เชื่อมต่อและดึงข้อมูลเดิม (Fetch Existing Data)</span>
                  </button>
                </div>
              </form>
              <p className="text-[11px] text-slate-500 mt-1.5">
                💡 <strong>สำคัญมาก:</strong> เมื่อกดเชื่อมต่อ ระบบจะ <em>อ่านข้อมูลเดิมที่มีอยู่ใน Google Sheet ก่อนเสมอ</em> และนำมาแสดงผลในระบบโดยไม่เขียนทับข้อมูลเดิม
              </p>
            </div>
          )}

          {/* Google Apps Script Code Drawer & Instructions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Code2 className="w-4 h-4 text-sky-600" />
                <span>โค้ด Google Apps Script (Code.gs) สำหรับสร้าง 3 แท็บอัตโนมัติ</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ด'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {showCode ? 'ซ่อนโค้ด' : 'ดูโค้ด'}
                </button>
              </div>
            </div>

            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
              <li>เปิด Google Sheet ของท่าน &rarr; ไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong></li>
              <li>วางโค้ดชุดนี้ลงไปแทนที่ของเดิม &rarr; กดปุ่ม <strong>บันทึก (Save)</strong></li>
              <li>กด <strong>ทำให้ใช้งานได้ (Deploy)</strong> &gt; <strong>การทำให้ใช้งานได้รายการใหม่ (New deployment)</strong> &gt; เลือกประเภท <strong>เว็บแอป (Web app)</strong></li>
              <li>ตั้งค่า <em>ผู้ที่มีสิทธิ์เข้าถึง (Who has access)</em> เป็น <strong>"ทุกคน (Anyone)"</strong> แล้วกด Deploy</li>
              <li>คัดลอก Web App URL มาใส่ในช่องด้านบนได้ทันทีครับ</li>
            </ol>

            {showCode && (
              <div className="relative mt-2">
                <pre className="max-h-48 overflow-y-auto p-3 bg-slate-900 text-slate-100 rounded-xl text-[10px] font-mono leading-tight">
                  {APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:text-emerald-900"
          >
            <Download className="w-4 h-4" />
            <span>Export ข้อมูล 3 แท็บเป็น Excel (.xlsx)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
