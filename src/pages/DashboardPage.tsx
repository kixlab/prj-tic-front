import React, { useState, useMemo } from 'react';
import { useCaseContext } from '../context/CaseContext';
import {
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScheduleEvent } from '../types/cdss';

// Helper date utilities
const formatDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMondayOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const addDays = (d: Date, days: number): Date => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const DashboardView: React.FC = () => {
  const { cases, schedules, getDashboardMetrics, deleteSchedule, updateSchedule } = useCaseContext();
  const navigate = useNavigate();
  const metrics = getDashboardMetrics();

  const [selectedDate, setSelectedDate] = useState<string>(formatDateString(new Date()));
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<ScheduleEvent | null>(null);

  const [monthlyViewDate, setMonthlyViewDate] = useState<Date>(() => new Date());
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);

  const weekDays = useMemo(() => {
    const monday = getMondayOfWeek(selectedDateObj);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [selectedDateObj]);

  const monthlyCalendarGrid = useMemo(() => {
    const year = monthlyViewDate.getFullYear();
    const month = monthlyViewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    let startingDayOfWeek = firstDayOfMonth.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    const daysInMonth = lastDayOfMonth.getDate();
    const grid: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      grid.push({ dateStr: formatDateString(d), dayNumber: d.getDate(), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      grid.push({ dateStr: formatDateString(d), dayNumber: i, isCurrentMonth: true });
    }
    const remainingCells = grid.length <= 35 ? 35 - grid.length : 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      grid.push({ dateStr: formatDateString(d), dayNumber: i, isCurrentMonth: false });
    }
    return grid;
  }, [monthlyViewDate]);

  const handlePrevMonth = () => setMonthlyViewDate(new Date(monthlyViewDate.getFullYear(), monthlyViewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setMonthlyViewDate(new Date(monthlyViewDate.getFullYear(), monthlyViewDate.getMonth() + 1, 1));
  const handlePrevWeek = () => { const newDate = addDays(selectedDateObj, -7); setSelectedDate(formatDateString(newDate)); setMonthlyViewDate(newDate); };
  const handleNextWeek = () => { const newDate = addDays(selectedDateObj, 7); setSelectedDate(formatDateString(newDate)); setMonthlyViewDate(newDate); };
  const handleTodayClick = () => { const today = new Date(); setSelectedDate(formatDateString(today)); setMonthlyViewDate(today); };

  const handleDragStart = (e: React.DragEvent, eventId: string) => { setDraggedEventId(eventId); e.dataTransfer.setData('text/plain', eventId); };
  const handleDropOnSlot = (e: React.DragEvent, targetDate: string, targetTime: string) => {
    e.preventDefault();
    if (!draggedEventId) return;
    updateSchedule(draggedEventId, { date: targetDate, time: targetTime });
    setDraggedEventId(null);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const pendingCases = cases.filter(c => c.status !== 'completed').sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 3);
  const todayStr = formatDateString(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#192835]">대시보드</h1>
          <p className="text-sm text-[#6A6A6A] mt-1">월간 및 주간 캘린더 통합 진료 일정 관리 및 환자 Case 요약</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button onClick={handleTodayClick} className="px-3 py-1.5 bg-white border border-[#E3E2DF] text-xs font-bold text-[#192835] rounded-lg hover:bg-gray-50 shadow-sm transition-colors">오늘</button>
          <button onClick={() => setShowScheduleModal(true)} className="flex items-center space-x-1.5 px-4 py-2 bg-[#5EBB8F] text-white text-xs font-bold rounded-xl hover:bg-[#4FA47C] shadow-sm transition-colors">
            <Plus size={15} /> <span>일정 추가</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E3E2DF] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E3E2DF] flex items-center justify-between bg-[#F9F9F9]">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-[#5EBB8F]" />
              <h2 className="text-base font-bold text-[#192835]">{monthlyViewDate.getFullYear()}년 {monthlyViewDate.getMonth() + 1}월</h2>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 text-[#6A6A6A] transition-colors"><ChevronLeft size={16} /></button>
              <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-gray-200 text-[#6A6A6A] transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="grid grid-cols-7 text-center text-xs font-bold text-[#898989] mb-2">
              {['월', '화', '수', '목', '금', '토', '일'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-1">
              {monthlyCalendarGrid.map((cell, idx) => {
                const hasSchedules = schedules.some(s => s.date === cell.dateStr);
                const scheduleCount = schedules.filter(s => s.date === cell.dateStr).length;
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === todayStr;
                return (
                  <button key={idx} onClick={() => setSelectedDate(cell.dateStr)} className={`h-10 rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-medium ${isSelected ? 'bg-[#5EBB8F] text-white font-bold shadow-md' : isToday ? 'bg-[#E0EFE8] text-[#2E664B] font-bold border border-[#5EBB8F]' : cell.isCurrentMonth ? 'text-[#192835] hover:bg-[#F4F4F4]' : 'text-[#C4C4C4]'}`}>
                    <span>{cell.dayNumber}</span>
                    {hasSchedules && <div className="absolute bottom-1 flex space-x-0.5">{Array.from({ length: Math.min(scheduleCount, 3) }).map((_, i) => <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#5EBB8F]'}`} />)}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E3E2DF] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E3E2DF] flex items-center justify-between bg-[#F9F9F9]">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-[#5EBB8F]" />
              <h2 className="text-base font-bold text-[#192835]">주간 진료 시간표</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={handlePrevWeek} className="p-1.5 rounded-lg border border-[#E3E2DF] hover:bg-white text-[#6A6A6A] text-xs font-bold transition-colors"><ChevronLeft size={14} /></button>
              <button onClick={handleNextWeek} className="p-1.5 rounded-lg border border-[#E3E2DF] hover:bg-white text-[#6A6A6A] text-xs font-bold transition-colors"><ChevronRight size={14} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[600px]">
            <div className="min-w-[700px] grid grid-cols-8 border-b border-[#E3E2DF] bg-white sticky top-0 z-10">
              <div className="p-3 text-center text-xs font-bold text-[#898989] border-r border-[#E3E2DF] bg-[#F9F9F9]">시간</div>
              {weekDays.map((day, idx) => {
                const dateStr = formatDateString(day);
                const isSelected = dateStr === selectedDate;
                return (
                  <div key={idx} onClick={() => setSelectedDate(dateStr)} className={`p-2 text-center border-r border-[#E3E2DF] cursor-pointer ${isSelected ? 'bg-[#E0EFE8]/60' : 'bg-[#F9F9F9]'}`}>
                    <div className="text-[11px] font-bold text-[#898989]">{['월', '화', '수', '목', '금', '토', '일'][idx]}</div>
                    <div className={`text-sm font-extrabold mt-0.5 inline-flex w-7 h-7 items-center justify-center rounded-full ${isSelected ? 'bg-[#2E664B] text-white' : 'text-[#192835]'}`}>{day.getDate()}</div>
                  </div>
                );
              })}
            </div>
            <div className="min-w-[700px] divide-y divide-[#E3E2DF]">
              {TIME_SLOTS.map((slotTime) => (
                <div key={slotTime} className="grid grid-cols-8 min-h-[70px]">
                  <div className="p-2 text-right pr-4 text-xs font-bold text-[#898989] border-r border-[#E3E2DF] bg-[#FAFAFA]">{slotTime}</div>
                  {weekDays.map((day, dayIdx) => {
                    const dateStr = formatDateString(day);
                    const slotSchedules = schedules.filter(s => s.date === dateStr && s.time.startsWith(slotTime.substring(0, 2)));
                    return (
                      <div key={dayIdx} onDragOver={handleDragOver} onDrop={(e) => handleDropOnSlot(e, dateStr, slotTime)} className="p-1 border-r border-[#E3E2DF] relative group hover:bg-[#F4F4F4]/50 flex flex-col space-y-1">
                        {slotSchedules.map(s => (
                          <div key={s.id} draggable onDragStart={(e) => handleDragStart(e, s.id)} onClick={(e) => { e.stopPropagation(); setSelectedEventForDetail(s); }} className={`p-2 rounded-lg border text-xs cursor-grab ${s.visitType === '초진' ? 'bg-blue-50 border-blue-200' : s.visitType === '재진' ? 'bg-[#E0EFE8] border-[#5EBB8F]/40' : 'bg-amber-50 border-amber-200'}`}>
                            <div className="font-extrabold truncate">{s.patientName}</div>
                            <div className="opacity-80">{s.time}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-[#E3E2DF] shadow-sm">
          <div className="text-xs font-semibold text-[#898989] mb-2">전체 환자 영상 검토 진행율</div>
          <div className="flex items-baseline space-x-2"><span className="text-4xl font-extrabold text-[#5EBB8F]">{metrics.totalReviewProgress}%</span><span className="text-sm font-medium text-[#6A6A6A]">({metrics.completedCasesCount}건 완료)</span></div>
          <div className="w-full bg-[#EAEAEA] h-2.5 rounded-full mt-4 overflow-hidden"><div className="bg-[#5EBB8F] h-full rounded-full transition-all" style={{ width: `${metrics.totalReviewProgress}%` }} /></div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E3E2DF] shadow-sm">
          <div className="text-xs font-semibold text-[#898989] mb-2">검토 대기 영상</div>
          <div className="text-4xl font-extrabold text-[#192835]">{metrics.remainingVideoCount}<span className="text-lg font-normal text-[#898989]"> / {metrics.totalVideoCount}</span></div>
          <p className="text-xs text-[#6A6A6A] mt-4 flex items-center"><Clock size={13} className="mr-1 text-[#5EBB8F]" /> 남은 영상 수 : {metrics.remainingVideoCount}/{metrics.totalVideoCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E3E2DF] shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[#898989] mb-2">총 관리 환자 수</div>
            <div className="text-4xl font-extrabold text-[#192835]">{metrics.thisWeekPatients}<span className="text-lg font-normal text-[#898989]"> 명</span></div>
          </div>
          <Link to="/cases" className="mt-4 inline-flex items-center justify-between text-xs font-semibold text-[#2E664B] bg-[#E0EFE8] hover:bg-[#C1E9D6] px-3.5 py-2 rounded-xl transition-colors"><span>환자 목록 보기</span><ChevronRight size={14} /></Link>
        </div>
      </div>

      {showScheduleModal && <ScheduleAddModal onClose={() => setShowScheduleModal(false)} selectedDate={selectedDate} />}
      {selectedEventForDetail && <ScheduleDetailModal event={selectedEventForDetail} onClose={() => setSelectedEventForDetail(null)} onDelete={(id: string) => { if(confirm('일정을 삭제하시겠습니까?')) { deleteSchedule(id); setSelectedEventForDetail(null); } }} />}
    </div>
  );
};

const ScheduleAddModal: React.FC<{ onClose: () => void, selectedDate: string }> = ({ onClose, selectedDate }) => {
  const { addSchedule, cases } = useCaseContext();
  const [form, setForm] = useState({ patientName: '', patientId: '', caseId: '', date: selectedDate, time: '09:00', visitType: '재진' as any, notes: '' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!form.patientName || !form.patientId) return alert('필수 정보를 입력해주세요.'); addSchedule({ id: `S-${Date.now()}`, ...form }); onClose(); };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#192835] mb-4">새 진료 일정 추가</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-[#898989] mb-1">환자명*</label><input type="text" className="w-full border border-[#E3E2DF] rounded-xl p-2.5 text-sm outline-none focus:border-[#5EBB8F]" value={form.patientName} onChange={(e) => setForm({...form, patientName: e.target.value})} required /></div>
            <div><label className="block text-xs font-bold text-[#898989] mb-1">환자 ID*</label><input type="text" className="w-full border border-[#E3E2DF] rounded-xl p-2.5 text-sm outline-none focus:border-[#5EBB8F]" value={form.patientId} onChange={(e) => setForm({...form, patientId: e.target.value})} required /></div>
          </div>
          <div><label className="block text-xs font-bold text-[#898989] mb-1">연동할 Case (선택)</label><select className="w-full border border-[#E3E2DF] rounded-xl p-2.5 text-sm outline-none focus:border-[#5EBB8F]" value={form.caseId} onChange={(e) => setForm({...form, caseId: e.target.value})}><option value="">연동 안 함</option>{cases.map(c => <option key={c.id} value={c.id}>{c.id} ({c.patientName})</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-[#898989] mb-1">날짜</label><input type="date" className="w-full border border-[#E3E2DF] rounded-xl p-2.5 text-sm outline-none focus:border-[#5EBB8F]" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} /></div>
            <div><label className="block text-xs font-bold text-[#898989] mb-1">시간</label><input type="time" className="w-full border border-[#E3E2DF] rounded-xl p-2.5 text-sm outline-none focus:border-[#5EBB8F]" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} /></div>
          </div>
          <div><label className="block text-xs font-bold text-[#898989] mb-1">방문 유형</label><div className="flex space-x-2">{['초진', '재진', '정기 검진', '경과 관찰'].map(type => (<button key={type} type="button" onClick={() => setForm({...form, visitType: type as any})} className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition-colors ${form.visitType === type ? 'bg-[#5EBB8F] border-[#5EBB8F] text-white' : 'bg-white border-[#E3E2DF] text-[#898989] hover:bg-gray-50'}`}>{type}</button>))}</div></div>
          <div><label className="block text-xs font-bold text-[#898989] mb-1">간단 메모</label><textarea className="w-full border border-[#E3E2DF] rounded-xl p-2.5 text-sm h-20 outline-none focus:border-[#5EBB8F]" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
          <div className="flex space-x-3 pt-2"><button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-[#898989] bg-[#F4F4F4] rounded-xl hover:bg-[#EAEAEA]">취소</button><button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-[#5EBB8F] rounded-xl hover:bg-[#4FA47C]">저장하기</button></div>
        </form>
      </div>
    </div>
  );
};

const ScheduleDetailModal: React.FC<{ event: ScheduleEvent, onClose: () => void, onDelete: (id: string) => void }> = ({ event, onClose, onDelete }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3E2DF] pb-3"><div className="flex items-center space-x-2"><span className="px-2.5 py-1 bg-[#5EBB8F]/20 text-[#2E664B] rounded-lg text-xs font-bold">{event.visitType}</span><h3 className="text-base font-bold text-[#192835]">{event.patientName} 환자 진료 일정</h3></div><button onClick={onClose} className="text-[#898989] hover:text-[#192835] font-bold text-sm">✕</button></div>
        <div className="space-y-3 text-sm text-[#192835]">
          <div className="flex items-center space-x-3 text-xs text-[#6A6A6A]"><User size={15} className="text-[#5EBB8F]" /><span>환자 ID: <strong className="text-[#192835]">{event.patientId}</strong></span></div>
          <div className="flex items-center space-x-3 text-xs text-[#6A6A6A]"><Calendar size={15} className="text-[#5EBB8F]" /><span>진료 일시: <strong className="text-[#192835]">{event.date} {event.time}</strong></span></div>
          {event.notes && <div className="p-3 bg-[#F9F9F9] rounded-xl border border-[#E3E2DF] text-xs text-[#6A6A6A]"><span className="font-bold block mb-1 text-[#192835]">메모:</span>{event.notes}</div>}
        </div>
        <div className="flex space-x-3 pt-4 border-t border-[#E3E2DF]">{event.caseId ? <button onClick={() => { onClose(); navigate(`/cases/${event.caseId}`); }} className="flex-1 py-3 text-xs font-bold text-white bg-[#5EBB8F] hover:bg-[#4FA47C] rounded-xl transition-colors flex items-center justify-center space-x-1"><FileText size={14} /><span>Case 상세 보기</span></button> : <button disabled className="flex-1 py-3 text-xs font-bold text-[#898989] bg-[#F4F4F4] rounded-xl cursor-not-allowed">연동된 Case 없음</button>} <button onClick={() => onDelete(event.id)} className="px-4 py-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">일정 삭제</button></div>
      </div>
    </div>
  );
};

export default DashboardView;
