import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  Car, 
  Wrench,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { CarWashRecord, Branch, UserProfile, FilterState, WashStatusType } from '../types';
import { STATUS_CONFIGS, WASH_STATUS_OPTIONS } from '../lib/constants';

interface HistoryViewProps {
  records: CarWashRecord[];
  branches: Branch[];
  currentUser: UserProfile | null;
  filterState: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onEditRecord: (record: CarWashRecord) => void;
  onDeleteRecord: (record: CarWashRecord) => void;
  onOpenNewRecord: () => void;
  onOpenSheetLink?: string | null;
  onManualSync: () => void;
  isSyncing: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  branches,
  currentUser,
  filterState,
  onFilterChange,
  onEditRecord,
  onDeleteRecord,
  onOpenNewRecord,
  onOpenSheetLink,
  onManualSync,
  isSyncing
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');

  // Filtered records based on query, branch, month, status
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search query (plate, vin, brand, model, staff, notes)
      const q = filterState.searchQuery.toLowerCase().trim();
      const matchQuery = !q || (
        record.licensePlate.toLowerCase().includes(q) ||
        record.vinNumber.toLowerCase().includes(q) ||
        record.brand.toLowerCase().includes(q) ||
        record.model.toLowerCase().includes(q) ||
        record.color.toLowerCase().includes(q) ||
        record.branch.toLowerCase().includes(q) ||
        record.notes.toLowerCase().includes(q) ||
        record.staffNames.some(s => s.toLowerCase().includes(q))
      );

      // Month filter
      const matchMonth = filterState.month === 'all' || (record.date && record.date.startsWith(filterState.month));

      // Branch filter
      const matchBranch = filterState.branch === 'all' || record.branch === filterState.branch;

      // Status filter
      const matchStatus = activeStatusFilter === 'all' || record.washStatus === activeStatusFilter;

      return matchQuery && matchMonth && matchBranch && matchStatus;
    });
  }, [records, filterState.searchQuery, filterState.month, filterState.branch, activeStatusFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'ID',
      'วันที่',
      'ทะเบียนรถ',
      'เลขตัวถัง (VIN)',
      'ยี่ห้อ',
      'รุ่น',
      'สี',
      'สถานะการล้าง',
      'สาขา',
      'พนักงานผู้รับผิดชอบ',
      'หมายเหตุ',
      'ผู้บันทึก',
      'วันที่บันทึก'
    ];

    const rows = filteredRecords.map(r => [
      r.id,
      r.date,
      `"${r.licensePlate || '-'}"`,
      `"${r.vinNumber || '-'}"`,
      `"${r.brand}"`,
      `"${r.model}"`,
      `"${r.color}"`,
      `"${r.washStatus}"`,
      `"${r.branch}"`,
      `"${r.staffNames.join(', ')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      `"${r.loggedBy}"`,
      `"${r.createdAt}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `carwash_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="history-view-root" className="space-y-6 pb-12">
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

          <div className="flex items-center gap-2">
            {onOpenSheetLink && (
              <a
                href={onOpenSheetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">เปิด Google Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>

            <button
              onClick={onOpenNewRecord}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>+ เพิ่มรถล้าง</span>
            </button>
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
            {branches.map(b => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="history-status-filter"
            value={activeStatusFilter}
            onChange={(e) => setActiveStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="all">ทุกสถานะการล้าง (All Statuses)</option>
            {WASH_STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Month Selector */}
          <input
            id="history-month-filter"
            type="month"
            value={filterState.month === 'all' ? '' : filterState.month}
            onChange={(e) => onFilterChange({ month: e.target.value || 'all' })}
            placeholder="เลือกเดือน"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Quick Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400 mr-1">สถานะ:</span>
          <button
            onClick={() => setActiveStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeStatusFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({records.length})
          </button>
          {WASH_STATUS_OPTIONS.map((statusKey) => {
            const cfg = STATUS_CONFIGS[statusKey];
            const count = records.filter(r => r.washStatus === statusKey).length;
            const isSelected = activeStatusFilter === statusKey;
            return (
              <button
                key={statusKey}
                onClick={() => setActiveStatusFilter(statusKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? `${cfg.badgeBg} border ${cfg.badgeBorder} ring-1 ring-offset-0`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                <span>{statusKey} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Records Listing: Desktop Table & Mobile Cards */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">ไม่พบรายการที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูรายการทั้งหมด
          </p>
          <button
            onClick={() => {
              onFilterChange({ searchQuery: '', branch: 'all', month: 'all' });
              setActiveStatusFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <tr>
                    <th className="py-3.5 px-4">วันที่ / ทะเบียน</th>
                    <th className="py-3.5 px-4">ยี่ห้อ & รุ่น / สี</th>
                    <th className="py-3.5 px-4">สถานะการล้าง</th>
                    <th className="py-3.5 px-4">สาขา</th>
                    <th className="py-3.5 px-4">พนักงานผู้รับผิดชอบ</th>
                    <th className="py-3.5 px-4">หมายเหตุ</th>
                    {isAdmin && <th className="py-3.5 px-4 text-right">จัดการ (Admin)</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => {
                    const statusCfg = STATUS_CONFIGS[record.washStatus] || STATUS_CONFIGS['Detailing New Car Deliver'];
                    return (
                      <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Date & Plate / VIN */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {record.licensePlate ? (
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-xs font-bold text-slate-800 border border-slate-200">
                                {record.licensePlate}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-xs">ไม่มีป้ายทะเบียน</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 font-mono">
                            VIN: {record.vinNumber || '-'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {record.date}
                          </div>
                        </td>

                        {/* Brand, Model & Color */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {record.brand} <span className="font-medium text-slate-600">{record.model}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0" />
                            <span>{record.color}</span>
                          </div>
                        </td>

                        {/* Status Badge with distinct colors */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.badgeBg} ${statusCfg.badgeBorder}`}>
                            <span className={`w-2 h-2 rounded-full ${statusCfg.dotColor}`} />
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
                        <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[220px]">
                          {record.notes ? (
                            <span className="line-clamp-2" title={record.notes}>
                              {record.notes}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Admin Action buttons */}
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                id={`edit-record-btn-${record.id}`}
                                onClick={() => onEditRecord(record)}
                                title="แก้ไขรายการ"
                                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                id={`delete-record-btn-${record.id}`}
                                onClick={() => onDeleteRecord(record)}
                                title="ลบรายการ (Admin)"
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
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
                      {record.brand} {record.model} • <span className="font-normal text-slate-600">{record.color}</span>
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

                  {isAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onEditRecord(record)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => onDeleteRecord(record)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
