import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  Calendar, 
  Hash, 
  Palette, 
  MapPin, 
  Users, 
  FileText, 
  Check, 
  AlertCircle,
  Plus,
  Sparkles,
  Wrench
} from 'lucide-react';
import { 
  CarWashRecord, 
  WashStatusType, 
  CarColor, 
  Branch, 
  CarBrand, 
  Employee, 
  UserProfile 
} from '../types';
import { STATUS_CONFIGS, WASH_STATUS_OPTIONS, sortEnFirstThenTh } from '../lib/constants';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<CarWashRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheet'>, existingId?: string) => Promise<void>;
  initialRecord?: CarWashRecord | null;
  colors: CarColor[];
  branches: Branch[];
  brands: CarBrand[];
  employees: Employee[];
  currentUser: UserProfile | null;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRecord,
  colors,
  branches,
  brands,
  employees,
  currentUser
}) => {
  const isEditing = !!initialRecord;

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [licensePlate, setLicensePlate] = useState('');
  const [vinNumber, setVinNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [isCustomModelInput, setIsCustomModelInput] = useState(false);
  const [color, setColor] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [washStatus, setWashStatus] = useState<WashStatusType>('Detailing New Car Deliver');
  const [branch, setBranch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Quick staff add state
  const [customStaffInput, setCustomStaffInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isOtherColorSelected = (colorVal: string) => {
    if (!colorVal) return false;
    const lower = colorVal.toLowerCase();
    return lower.includes('อื่นๆ') || lower.includes('other') || lower === 'custom';
  };

  // Sort brands with English (A-Z) first, and Thai at the bottom
  const sortedBrands = React.useMemo(() => {
    return [...brands].sort((a, b) => sortEnFirstThenTh(a.name, b.name));
  }, [brands]);

  // Find model suggestions for selected brand and sort them with English (A-Z) first, and Thai at the bottom
  const currentBrandObj = brands.find(b => b.name === brand);
  const sortedModels = React.useMemo(() => {
    if (!currentBrandObj?.models) return [];
    return [...currentBrandObj.models].sort((a, b) => sortEnFirstThenTh(a, b));
  }, [currentBrandObj]);

  // Initialize or reset form only once when modal opens or initialRecord changes
  useEffect(() => {
    if (!isOpen) return;

    const activeBranches = branches.filter(b => b.isActive);
    const activeEmployees = employees.filter(e => e.isActive);
    const firstBranch = activeBranches[0]?.name || branches[0]?.name || 'สาขาสำนักงานใหญ่';
    const firstBrand = sortedBrands[0]?.name || brands[0]?.name || 'BMW';
    const firstColor = colors[0]?.name || 'ขาว (Pure White)';
    const firstStaff = activeEmployees[0]?.name || employees[0]?.name || '';

    if (initialRecord) {
      setDate(initialRecord.date || new Date().toISOString().split('T')[0]);
      setLicensePlate(initialRecord.licensePlate || '');
      setVinNumber(initialRecord.vinNumber || '');
      setBrand(initialRecord.brand || firstBrand);
      setModel(initialRecord.model || '');
      
      const recordBrandObj = brands.find(b => b.name === (initialRecord.brand || firstBrand));
      const brandModels = recordBrandObj?.models || [];
      setIsCustomModelInput(!!initialRecord.model && !brandModels.includes(initialRecord.model));

      // Match existing color with options or treat as custom
      const exactColorMatch = colors.find(c => c.name === initialRecord.color);
      if (exactColorMatch && !isOtherColorSelected(exactColorMatch.name)) {
        setColor(initialRecord.color);
        setCustomColor('');
      } else {
        const otherOpt = colors.find(c => isOtherColorSelected(c.name))?.name || colors[colors.length - 1]?.name || 'อื่นๆ (Custom / Other)';
        setColor(otherOpt);
        setCustomColor(initialRecord.color && !isOtherColorSelected(initialRecord.color) ? initialRecord.color : '');
      }

      setWashStatus(initialRecord.washStatus || 'Detailing New Car Deliver');
      setBranch(initialRecord.branch || firstBranch);
      setSelectedStaff(initialRecord.staffNames && initialRecord.staffNames.length > 0 ? initialRecord.staffNames : (firstStaff ? [firstStaff] : []));
      setNotes(initialRecord.notes || '');
    } else {
      // Default new record values
      setDate(new Date().toISOString().split('T')[0]);
      setLicensePlate('');
      setVinNumber('');
      setBrand(firstBrand);
      setModel('');
      setIsCustomModelInput(false);
      setColor(firstColor);
      setCustomColor('');
      setWashStatus('Detailing New Car Deliver');
      setBranch(firstBranch);
      setSelectedStaff(firstStaff ? [firstStaff] : []);
      setNotes('');
    }
    setValidationError(null);
  }, [isOpen, initialRecord?.id]); // Only re-run when modal opens or editing a different record

  if (!isOpen) return null;

  // Handle Staff Selection Toggle
  const toggleStaff = (staffName: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffName)
        ? prev.filter(s => s !== staffName)
        : [...prev, staffName]
    );
  };

  const handleAddCustomStaff = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customStaffInput.trim();
    if (trimmed && !selectedStaff.includes(trimmed)) {
      setSelectedStaff(prev => [...prev, trimmed]);
      setCustomStaffInput('');
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    setValidationError(null);

    // Flexible Plate / VIN Validation: At least one must be provided
    const cleanPlate = licensePlate.trim();
    const cleanVin = vinNumber.trim();

    if (!cleanPlate && !cleanVin) {
      setValidationError('กรุณาระบุ "ทะเบียนรถ" หรือ "เลข Vin" อย่างน้อย 1 อย่าง');
      return;
    }

    if (!brand.trim()) {
      setValidationError('กรุณาเลือกหรือระบุยี่ห้อรถ');
      return;
    }

    const isOther = isOtherColorSelected(color);
    let finalColor = color.trim();
    if (isOther) {
      const cleanCustom = customColor.trim();
      if (!cleanCustom) {
        setValidationError('กรุณาระบุชื่อสีรถในช่อง "ระบุสีรถเพิ่มเติม"');
        return;
      }
      finalColor = cleanCustom;
    }

    if (!finalColor) {
      setValidationError('กรุณาเลือกหรือระบุสีรถ');
      return;
    }

    const finalBranch = branch.trim() || (branches.filter(b => b.isActive)[0]?.name || branches[0]?.name || 'สาขาสำนักงานใหญ่');

    if (selectedStaff.length === 0) {
      setValidationError('กรุณาเลือกหรือระบุชื่อพนักงานที่รับผิดชอบอย่างน้อย 1 คน');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        date,
        licensePlate: cleanPlate,
        vinNumber: cleanVin,
        brand: brand.trim(),
        model: model.trim(),
        color: finalColor,
        washStatus,
        branch: finalBranch,
        staffNames: selectedStaff,
        notes: notes.trim(),
        loggedBy: currentUser?.displayName || currentUser?.email || 'User',
        loggedByEmail: currentUser?.email
      }, initialRecord?.id);

      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        id="record-form-modal-container"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center border border-sky-100">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'แก้ไขข้อมูลรถล้าง' : 'เพิ่มรถล้าง'}
              </h2>
              <p className="text-xs text-slate-500">
                กรอกรายละเอียดรถเพื่อบันทึกและซิงค์ลง Google Sheet
              </p>
            </div>
          </div>
          <button
            id="modal-close-button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Row 1: Date & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>วันที่เข้าล้าง <span className="text-rose-500">*</span></span>
              </label>
              <input
                id="form-input-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>สาขา <span className="text-rose-500">*</span></span>
              </label>
              <select
                id="form-select-branch"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
              >
                {branches.filter(b => b.isActive).map(b => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Wash Status Selector (Highlighting the 3 distinct statuses with unique colors) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>สถานะการล้าง <span className="text-rose-500">*</span></span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">เลือกตามประเภทงาน</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {WASH_STATUS_OPTIONS.map((statusKey) => {
                const cfg = STATUS_CONFIGS[statusKey];
                const isSelected = washStatus === statusKey;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    id={`status-option-${statusKey.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setWashStatus(statusKey)}
                    className={`relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? `${cfg.cardBg} ${cfg.badgeBorder} ring-2 ring-offset-1 ring-sky-500/30 shadow-xs`
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor}`} />
                        <span className="font-bold text-xs text-slate-900 leading-snug">
                          {cfg.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      {cfg.subLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: License Plate & VIN Number */}
          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-sky-600" />
                <span>ข้อมูลระบุรถ (ใส่ทะเบียน หรือ เลข VIN)</span>
              </span>
              <span className="text-[11px] text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md font-medium">
                *หากไม่มีทะเบียน ใส่แค่เลข VIN ได้
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  ทะเบียนรถ (เช่น 9กก 8899 หรือ ป้ายแดง)
                </label>
                <input
                  id="form-input-plate"
                  type="text"
                  placeholder="เช่น 9กก 8899 หรือ ว่างไว้ถ้าไม่มี"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm uppercase font-medium tracking-wide focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder:text-slate-400 placeholder:normal-case"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  เลขตัวถัง (VIN Number)
                </label>
                <input
                  id="form-input-vin"
                  type="text"
                  placeholder="เช่น WBA53AY060FS..."
                  value={vinNumber}
                  onChange={(e) => setVinNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder:text-slate-400 placeholder:font-sans"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Brand, Model, Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ยี่ห้อรถ <span className="text-rose-500">*</span>
              </label>
              <select
                id="form-select-brand"
                required
                value={brand}
                onChange={(e) => {
                  const newBrand = e.target.value;
                  setBrand(newBrand);
                  setModel('');
                  setIsCustomModelInput(false);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
              >
                {sortedBrands.map(b => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  รุ่นรถ (Model)
                </label>
                {sortedModels.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomModelInput(!isCustomModelInput);
                      if (isCustomModelInput && sortedModels.length > 0) {
                        setModel(sortedModels[0]);
                      }
                    }}
                    className="text-[11px] text-sky-600 hover:text-sky-800 font-medium hover:underline transition-colors"
                  >
                    {isCustomModelInput ? '← เลือกจากรายการ (A-Z)' : '+ พิมพ์ระบุเอง'}
                  </button>
                )}
              </div>

              {!isCustomModelInput && sortedModels.length > 0 ? (
                <select
                  id="form-select-model"
                  value={model}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomModelInput(true);
                      setModel('');
                    } else {
                      setModel(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
                >
                  <option value="">-- เลือกรุ่นรถ (เรียง A-Z) --</option>
                  {sortedModels.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value="__custom__">+ พิมพ์ระบุรุ่นเอง (Custom Model)...</option>
                </select>
              ) : (
                <div className="relative">
                  <input
                    id="form-input-model"
                    type="text"
                    placeholder="พิมพ์ระบุรุ่นรถ (เรียง A-Z)"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    list="model-suggestions"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
                  />
                  {sortedModels.length > 0 && (
                    <datalist id="model-suggestions">
                      {sortedModels.map(m => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-sky-600" />
                  <span>สีรถ <span className="text-rose-500">*</span></span>
                </span>
                {isOtherColorSelected(color) && (
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                    ระบุสีเอง
                  </span>
                )}
              </label>
              <select
                id="form-select-color"
                required
                value={color}
                onChange={(e) => {
                  const val = e.target.value;
                  setColor(val);
                  if (!isOtherColorSelected(val)) {
                    setCustomColor('');
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
              >
                {colors.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Custom Color Input Field when Other is selected */}
              {isOtherColorSelected(color) && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <input
                    id="form-input-custom-color"
                    type="text"
                    required
                    placeholder="พิมพ์ระบุชื่อสี เช่น ชมพูพาสเทล, ทูโทน ดำ-แดง..."
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-full px-3 py-2 bg-amber-50/60 border border-amber-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all shadow-xs"
                    autoFocus
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    *กรุณาระบุชื่อสีรถที่ต้องการบันทึก
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Staff Names (Multiple selection supported & easy summary) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>ชื่อพนักงานผู้รับผิดชอบ (เลือกได้หลายคน) <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[11px] text-slate-400">
                เลือกแล้ว {selectedStaff.length} คน
              </span>
            </div>

            {/* Quick staff picker pills */}
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 min-h-[50px] items-center">
              {employees.filter(e => e.isActive).map((emp) => {
                const isSelected = selectedStaff.includes(emp.name);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleStaff(emp.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{emp.name} {emp.nickname ? `(${emp.nickname})` : ''}</span>
                  </button>
                );
              })}

              {/* Display any custom staff not in employee master */}
              {selectedStaff
                .filter(name => !employees.some(e => e.name === name))
                .map((customName) => (
                  <span
                    key={customName}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-teal-600 text-white shadow-xs"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{customName}</span>
                    <button
                      type="button"
                      onClick={() => toggleStaff(customName)}
                      className="ml-1 hover:text-rose-200"
                    >
                      &times;
                    </button>
                  </span>
                ))}
            </div>

            {/* Add custom staff input */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="หรือพิมพ์ชื่อพนักงานเพิ่มเติมที่นี่..."
                value={customStaffInput}
                onChange={(e) => setCustomStaffInput(e.target.value)}
                onKeyDown={handleAddCustomStaff}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomStaff}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>หมายเหตุเพิ่มเติม</span>
            </label>
            <textarea
              id="form-textarea-notes"
              rows={2}
              placeholder="เช่น เคลือบแก้วพิเศษ, ตรวจสอบริ้วรอยก่อนส่งมอบ, ล้างห้องเครื่อง, รถลูกค้านัดรับ 17:00..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors resize-none placeholder:text-slate-400"
            />
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">
            ข้อมูลจะถูกบันทึกและซิงค์ไปยัง Google Sheet
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="form-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              id="form-submit-btn"
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 rounded-xl shadow-xs shadow-sky-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลรถ'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
