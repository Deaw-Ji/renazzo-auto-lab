import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Sparkles, 
  Car, 
  Wrench, 
  Users, 
  MapPin, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';
import { CarWashRecord, Branch, Employee, WashStatusType, FilterState } from '../types';
import { STATUS_CONFIGS, WASH_STATUS_OPTIONS } from '../lib/constants';

interface DashboardViewProps {
  records: CarWashRecord[];
  branches: Branch[];
  employees: Employee[];
  filterState: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onOpenNewRecord: () => void;
  onViewHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  branches,
  employees,
  filterState,
  onFilterChange,
  onOpenNewRecord,
  onViewHistory
}) => {
  // Available months extracted from records + current month
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const currentMonth = new Date().toISOString().substring(0, 7);
    set.add(currentMonth);

    records.forEach(r => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.substring(0, 7));
      }
    });

    return Array.from(set).sort().reverse();
  }, [records]);

  // Filtered records by month & branch
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchMonth = filterState.month === 'all' || (r.date && r.date.startsWith(filterState.month));
      const matchBranch = filterState.branch === 'all' || r.branch === filterState.branch;
      return matchMonth && matchBranch;
    });
  }, [records, filterState.month, filterState.branch]);

  // Today's records count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = useMemo(() => {
    return records.filter(r => r.date === todayStr).length;
  }, [records, todayStr]);

  // Status breakdown metrics
  const statusStats = useMemo(() => {
    const stats: Record<WashStatusType, number> = {
      'Detailing New Car Deliver': 0,
      'Wash For Deliver': 0,
      'Wash for Service': 0
    };

    filteredRecords.forEach(r => {
      if (stats[r.washStatus] !== undefined) {
        stats[r.washStatus]++;
      }
    });

    return stats;
  }, [filteredRecords]);

  // Branch statistics breakdown
  const branchStats = useMemo(() => {
    const counts: Record<string, { total: number; detailing: number; deliver: number; service: number }> = {};
    
    // Initialize all active branches
    branches.filter(b => b.isActive).forEach(b => {
      counts[b.name] = { total: 0, detailing: 0, deliver: 0, service: 0 };
    });

    filteredRecords.forEach(r => {
      if (!counts[r.branch]) {
        counts[r.branch] = { total: 0, detailing: 0, deliver: 0, service: 0 };
      }
      counts[r.branch].total++;
      if (r.washStatus === 'Detailing New Car Deliver') counts[r.branch].detailing++;
      else if (r.washStatus === 'Wash For Deliver') counts[r.branch].deliver++;
      else if (r.washStatus === 'Wash for Service') counts[r.branch].service++;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.total - a.total);
  }, [filteredRecords, branches]);

  // Employee statistics (handles multiple staff per carwash entry)
  const employeeStats = useMemo(() => {
    const staffMap: Record<string, { totalCars: number; detailing: number; deliver: number; service: number }> = {};

    filteredRecords.forEach(r => {
      r.staffNames.forEach(staffName => {
        const trimmed = staffName.trim();
        if (!trimmed) return;
        if (!staffMap[trimmed]) {
          staffMap[trimmed] = { totalCars: 0, detailing: 0, deliver: 0, service: 0 };
        }
        staffMap[trimmed].totalCars++;
        if (r.washStatus === 'Detailing New Car Deliver') staffMap[trimmed].detailing++;
        else if (r.washStatus === 'Wash For Deliver') staffMap[trimmed].deliver++;
        else if (r.washStatus === 'Wash for Service') staffMap[trimmed].service++;
      });
    });

    return Object.entries(staffMap).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.totalCars - a.totalCars);
  }, [filteredRecords]);

  // Top performer of the selected month
  const topPerformer = employeeStats[0] || null;

  // Format Thai month label (e.g. 2026-09 -> กันยายน 2026)
  const formatMonthLabel = (m: string) => {
    if (m === 'all') return 'ทุกช่วงเวลา (All Time)';
    const [year, month] = m.split('-');
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    const yearNum = parseInt(year, 10);
    return `${thaiMonths[monthIndex] || month} ${yearNum + 543} (${year})`;
  };

  const totalFilteredCars = filteredRecords.length;

  return (
    <div id="dashboard-view-root" className="space-y-6 pb-12">
      {/* Top Banner & Filters */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-sky-600" />
              <span>สรุปผลงานและสถิติภาพรวม</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              สรุปข้อมูลการล้างรถ แยกรายเดือน สาขา และประสิทธิภาพพนักงาน
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
              <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
              <select
                id="dashboard-month-filter"
                value={filterState.month}
                onChange={(e) => onFilterChange({ month: e.target.value })}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
              >
                <option value="all">ทุกเดือน (All Months)</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
              <select
                id="dashboard-branch-filter"
                value={filterState.branch}
                onChange={(e) => onFilterChange({ branch: e.target.value })}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2 max-w-[180px] truncate"
              >
                <option value="all">ทุกสาขา (All Branches)</option>
                {branches.filter(b => b.isActive).map(b => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Cars */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">จำนวนรถล้างทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalFilteredCars.toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-400">คัน</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">วันนี้ {todayCount} คัน</span>
              <span>• ประจำ {filterState.month === 'all' ? 'รวม' : filterState.month}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Detailing New Car Deliver */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full blur-xl -mr-4 -mt-4 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800">Detailing New Car</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              {statusStats['Detailing New Car Deliver'].toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-400">คัน</span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-700 font-medium truncate">
              ส่งมอบรถใหม่ ({totalFilteredCars > 0 ? Math.round((statusStats['Detailing New Car Deliver'] / totalFilteredCars) * 100) : 0}%)
            </div>
          </div>
        </div>

        {/* Card 3: Wash For Deliver */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-sky-50 rounded-full blur-xl -mr-4 -mt-4 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-sky-800">Wash For Deliver</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 tracking-tight">
              {statusStats['Wash For Deliver'].toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-400">คัน</span>
            </div>
            <div className="mt-1 text-[11px] text-sky-700 font-medium truncate">
              ล้างส่งมอบ ({totalFilteredCars > 0 ? Math.round((statusStats['Wash For Deliver'] / totalFilteredCars) * 100) : 0}%)
            </div>
          </div>
        </div>

        {/* Card 4: Wash for Service */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-100 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-full blur-xl -mr-4 -mt-4 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-900">Wash for Service</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
              {statusStats['Wash for Service'].toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-400">คัน</span>
            </div>
            <div className="mt-1 text-[11px] text-amber-700 font-medium truncate">
              รถเข้าศูนย์บริการ ({totalFilteredCars > 0 ? Math.round((statusStats['Wash for Service'] / totalFilteredCars) * 100) : 0}%)
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics: Branch Breakdown & Employee Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Branch Statistics Breakdown */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    สถิติจำนวนรถแยกรายสาขา
                  </h3>
                  <p className="text-xs text-slate-500">
                    เปรียบเทียบยอดล้างรถตามแต่ละสาขา
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {branchStats.length} สาขา
              </span>
            </div>

            {branchStats.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                ยังไม่มีข้อมูลสำหรับสาขาที่เลือก
              </div>
            ) : (
              <div className="space-y-4">
                {branchStats.map((branchItem) => {
                  const percentage = totalFilteredCars > 0 ? (branchItem.total / totalFilteredCars) * 100 : 0;
                  return (
                    <div key={branchItem.name} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[220px]">
                          {branchItem.name}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900">
                            {branchItem.total}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">คัน ({Math.round(percentage)}%)</span>
                        </div>
                      </div>

                      {/* Multi-segment Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                        {branchItem.total > 0 && (
                          <>
                            <div 
                              style={{ width: `${(branchItem.detailing / branchItem.total) * 100}%` }}
                              title={`Detailing: ${branchItem.detailing}`}
                              className="bg-emerald-500 h-full transition-all duration-500"
                            />
                            <div 
                              style={{ width: `${(branchItem.deliver / branchItem.total) * 100}%` }}
                              title={`Deliver: ${branchItem.deliver}`}
                              className="bg-sky-500 h-full transition-all duration-500"
                            />
                            <div 
                              style={{ width: `${(branchItem.service / branchItem.total) * 100}%` }}
                              title={`Service: ${branchItem.service}`}
                              className="bg-amber-500 h-full transition-all duration-500"
                            />
                          </>
                        )}
                      </div>

                      {/* Small Status tags */}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>ดีเทลลิ่ง: {branchItem.detailing}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-sky-500" />
                          <span>ส่งมอบ: {branchItem.deliver}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>เซอร์วิส: {branchItem.service}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Employee Wash Summary & Ranking */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    จำนวนรถที่ล้างโดยพนักงานแต่ละคน
                  </h3>
                  <p className="text-xs text-slate-500">
                    สรุปผลงานตามรายชื่อพนักงานที่รับผิดชอบ
                  </p>
                </div>
              </div>
              {topPerformer && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>อันดับ 1: {topPerformer.name}</span>
                </div>
              )}
            </div>

            {employeeStats.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                ยังไม่มีข้อมูลพนักงานในช่วงเวลานี้
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {employeeStats.map((emp, idx) => {
                  const maxCount = employeeStats[0]?.totalCars || 1;
                  const barWidth = Math.max(8, (emp.totalCars / maxCount) * 100);

                  return (
                    <div 
                      key={emp.name}
                      className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          idx === 1 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                          idx === 2 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {emp.name}
                            </span>
                            <span className="text-xs font-bold text-slate-900 ml-2">
                              {emp.totalCars} <span className="text-[11px] font-normal text-slate-400">คัน</span>
                            </span>
                          </div>

                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${barWidth}%` }}
                              className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full transition-all duration-300"
                            />
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                            <span>ดีเทลลิ่ง {emp.detailing}</span>
                            <span>•</span>
                            <span>ส่งมอบ {emp.deliver}</span>
                            <span>•</span>
                            <span>เซอร์วิส {emp.service}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Mini List & Fast Navigation */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              รายการล้างรถล่าสุด ({filteredRecords.slice(0, 5).length} รายการ)
            </h3>
          </div>
          <button
            id="dashboard-view-all-history-btn"
            onClick={onViewHistory}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>ดูประวัติทั้งหมด</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">ยังไม่มีรายการบันทึกรถ</p>
            <button
              onClick={onOpenNewRecord}
              className="mt-3 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold"
            >
              + เพิ่มรถล้างคันแรก
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRecords.slice(0, 6).map((record) => {
              const statusCfg = STATUS_CONFIGS[record.washStatus] || STATUS_CONFIGS['Detailing New Car Deliver'];
              return (
                <div
                  key={record.id}
                  className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {record.licensePlate || `VIN: ${record.vinNumber.slice(-6)}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.badgeBg}`}>
                      {record.washStatus}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-medium">
                    {record.brand} {record.model} • <span className="text-slate-500">{record.color}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="truncate max-w-[130px]">{record.branch}</span>
                    <span className="font-medium text-slate-700 truncate max-w-[120px]">
                      {record.staffNames.join(', ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
