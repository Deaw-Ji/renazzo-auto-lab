import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  Download, 
  MapPin, 
  ExternalLink,
  RefreshCw,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import { CarWashRecord, Branch, UserProfile, FilterState, RoleConfig } from '../types';
import { STATUS_CONFIGS, WASH_STATUS_OPTIONS, normalizeDateToYMD } from '../lib/constants';

interface HistoryViewProps {
  records: CarWashRecord[];
  branches: Branch[];
  currentUser: UserProfile | null;
  roles?: RoleConfig[];
  filterState: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onEditRecord: (record: CarWashRecord) => void;
  onDeleteRecord: (record: CarWashRecord) => void;
  onOpenNewRecord: () => void;
  onOpenSheetLink?: string | null;
  onManualSync: () => void;
  onPullFromSheet?: () => void;
  onExportExcel?: () => void;
  isSyncing: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  branches,
  currentUser,
  roles = [],
  filterState,
  onFilterChange,
  onEditRecord,
  onDeleteRecord,
  onOpenNewRecord,
  onOpenSheetLink,
  onManualSync,
  onPullFromSheet,
  onExportExcel,
  isSyncing
}) => {
  const isAdmin = currentUser?.role === 'Admin' || (currentUser?.role as any) === 'admin';
  const matchedRole = currentUser
    ? roles.find(r => r.name.toLowerCase() === currentUser.role.toLowerCase())
    : undefined;

  const canDeleteRecord = matchedRole ? matchedRole.permissions.canDeleteRecord : isAdmin;
  const canEditRecord = matchedRole ? matchedRole.permissions.canEditRecord : true;
  const canAddRecord = matchedRole ? matchedRole.permissions.canAddRecord : true;

  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');

  // Filtered records based on query, branch, month, status
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search query (plate, vin, brand, model, staff, notes)
      const q = filterState.searchQuery.toLowerCase().trim();
      const matchQuery = !q || (
        (record.licensePlate || '').toLowerCase().includes(q) ||
        (record.vinNumber || '').toLowerCase().includes(q) ||
        (record.brand || '').toLowerCase().includes(q) ||
        (record.model || '').toLowerCase().includes(q) ||
        (record.color || '').toLowerCase().includes(q) ||
        (record.branch || '').toLowerCase().includes(q) ||
        (record.notes || '').toLowerCase().includes(q) ||
        (Array.isArray(record.staffNames) ? record.staffNames : []).some(s => String(s || '').toLowerCase().includes(q))
      );

      // Month filter
      const ymd = normalizeDateToYMD(record.date, record.createdAt, record.id);
      const matchMonth = filterState.month === 'all' || (ymd && ymd.startsWith(filterState.month));

      // Branch filter
      const matchBranch = filterState.branch === 'all' || record.branch === filterState.branch;

      // Status filter
      const matchStatus = activeStatusFilter === 'all' || record.washStatus === activeStatusFilter;

      return matchQuery && matchMonth && matchBranch && matchStatus;
    });
  }, [records, filterState.searchQuery, filterState.month, filterState.branch, activeStatusFilter]);

  return (
    <div id="history-view-root" className="space-y-6 pb-12 font-['Sarabun',sans-serif]">
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              ประวัติรถล้าง
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              ค้นหาและจัดการประวัติการล้างรถทั้งหมด ({filteredRecords.length} จาก {records.length} รายการ)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pull from Google Sheet button */}
            {onPullFromSheet && (
              <button
                type="button"
                onClick={onPullFromSheet}
                disabled={isSyncing}
                title="ดึงข้อมูลล่าสุดจาก Google Sheets"
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-sky-600" />
                <span>ดึงข้อมูล (Pull)</span>
              </button>
            )}

            {/* Sync to Google Sheet button */}
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              title="ส่งข้อมูลไปยัง Google Sheets"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <ArrowUpFromLine className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>ส่งข้อมูล (Sync)</span>
            </button>

            {/* Export Excel (.xlsx) button */}
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
                title="ดาวน์โหลดไฟล์ Excel (.xlsx) ครบทั้ง 3 แท็บ"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel (.xlsx)</span>
              </button>
            )}

            {onOpenSheetLink && (
              <a
                href={onOpenSheetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:flex px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>เปิด Sheet</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}

            {canAddRecord && (
              <button
                id="history-add-record-btn"
                onClick={onOpenNewRecord}
                className="hidden sm:flex px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 active:scale-98 text-white items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>+ เพิ่มรถล้าง</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="history-search-input"
              type="text"
              placeholder="ค้นหา ทะเบียน, VIN, ยี่ห้อ, พนักงาน..."
              value={filterState.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Branch Filter */}
          <select
            id="history-branch-filter"
            value={filterState.branch}
            onChange={(e) => onFilterChange({ branch: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="all">ทุกสาขา (All Branches)</option>
            {branches.filter(b => b.isActive).map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>

          {/* Month Filter */}
          <input
            id="history-month-filter"
            type="month"
            value={filterState.month === 'all' ? '' : filterState.month}
            onChange={(e) => onFilterChange({ month: e.target.value || 'all' })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
          />

          {/* Clear Filters Button */}
          <button
            onClick={() => {
              onFilterChange({
                searchQuery: '',
                branch: 'all',
                month: 'all',
                status: 'all'
              });
              setActiveStatusFilter('all');
            }}
            className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>

        {/* Status Pills Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-1">สถานะ:</span>
          <button
            onClick={() => setActiveStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeStatusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({records.length})
          </button>
          {WASH_STATUS_OPTIONS.map((status) => {
            const count = records.filter(r => r.washStatus === status).length;
            const cfg = STATUS_CONFIGS[status] || STATUS_CONFIGS['Detailing New Car Deliver'];
            return (
              <button
                key={status}
                onClick={() => setActiveStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeStatusFilter === status
                    ? `${cfg.badgeBg} ${cfg.badgeText} ring-2 ring-sky-500 font-bold`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                <span>{status}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Records Table View (Desktop) & Card View (Mobile) */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <p className="text-base font-bold text-slate-700">ไม่พบรายการข้อมูลที่ตรงกับเงื่อนไข</p>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกด "ล้างตัวกรองทั้งหมด"</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-4">วันที่ / ทะเบียน</th>
                    <th className="py-3.5 px-4">เลขตัวถัง (VIN)</th>
                    <th className="py-3.5 px-4">ยี่ห้อ / รุ่น / สี</th>
                    <th className="py-3.5 px-4">สถานะการล้าง</th>
                    <th className="py-3.5 px-4">สาขา</th>
                    <th className="py-3.5 px-4">พนักงานผู้รับผิดชอบ</th>
                    <th className="py-3.5 px-4">หมายเหตุ</th>
                    <th className="py-3.5 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRecords.map((record) => {
                    const statusCfg = STATUS_CONFIGS[record.washStatus] || STATUS_CONFIGS['Detailing New Car Deliver'];
                    return (
                      <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Date & Plate */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {record.licensePlate || <span className="text-slate-400 italic text-xs">ไม่มีป้ายทะเบียน</span>}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {record.date}
                          </div>
                        </td>

                        {/* VIN */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {record.vinNumber || '-'}
                        </td>

                        {/* Brand, Model, Color */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">
                            {record.brand} {record.model}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {record.color || '-'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeBg} ${statusCfg.badgeText} ${statusCfg.badgeBorder}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                            <span>{record.washStatus}</span>
                          </span>
                        </td>

                        {/* Branch */}
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                          {record.branch}
                        </td>

                        {/* Staff Names */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {record.staffNames.map((name, i) => (
                              <span
                                key={i}
                                className="inline-block bg-sky-50 text-sky-800 border border-sky-100 px-2 py-0.5 rounded-md text-xs font-medium"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Notes */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[200px]">
                          {record.notes ? (
                            <span className="line-clamp-2" title={record.notes}>
                              {record.notes}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              id={`edit-record-btn-${record.id}`}
                              onClick={() => onEditRecord(record)}
                              title="แก้ไขรายการ"
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* CRITICAL: Delete button is STRICTLY ONLY VISIBLE to Admin! */}
                            {canDeleteRecord && (
                              <button
                                id={`delete-record-btn-${record.id}`}
                                onClick={() => onDeleteRecord(record)}
                                title="ลบรายการ (เฉพาะ Admin เท่านั้น)"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden space-y-3">
            {filteredRecords.map((record) => {
              const statusCfg = STATUS_CONFIGS[record.washStatus] || STATUS_CONFIGS['Detailing New Car Deliver'];
              return (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {record.licensePlate ? (
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-mono text-sm font-bold text-slate-900 border border-slate-200">
                            {record.licensePlate}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">ไม่มีป้ายทะเบียน</span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">
                          {record.date}
                        </span>
                      </div>
                      {record.vinNumber && (
                        <div className="text-[11px] text-slate-500 font-mono mt-1">
                          VIN: {record.vinNumber}
                        </div>
                      )}
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.badgeBg} ${statusCfg.badgeBorder}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                      <span>{record.washStatus}</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-1">
                    <div className="font-bold text-slate-800">
                      {record.brand} {record.model} • <span className="font-normal text-slate-600">{record.color || '-'}</span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{record.branch}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-slate-500 mb-1">พนักงานผู้รับผิดชอบ:</div>
                    <div className="flex flex-wrap gap-1">
                      {record.staffNames.map((name, i) => (
                        <span
                          key={i}
                          className="bg-sky-50 text-sky-800 border border-sky-100 px-2 py-0.5 rounded-md text-xs font-medium"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {record.notes && (
                    <div className="text-xs text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100/80">
                      <span className="font-semibold text-amber-900">หมายเหตุ: </span>
                      {record.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onEditRecord(record)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </button>

                    {/* CRITICAL: Mobile Delete is STRICTLY ONLY VISIBLE to Admin! */}
                    {canDeleteRecord && (
                      <button
                        onClick={() => onDeleteRecord(record)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
