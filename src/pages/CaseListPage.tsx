import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import { Search, Filter, Plus, Calendar, ChevronRight, MoreVertical } from 'lucide-react';
import { TicCase } from '../types/cdss';

const CaseListView: React.FC = () => {
  const { cases, addCase } = useCaseContext();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_review' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // 필터링 및 검색 로직
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.patientName.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // 미완료 Case 우선, 그 다음 최신순
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    return (b.updatedAt || b.visitDate).localeCompare(a.updatedAt || a.visitDate);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#192835]">환자 / Case 목록</h1>
          <p className="text-sm text-[#6A6A6A] mt-1">등록된 모든 환자의 검토 상태를 관리합니다.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#5EBB8F] text-white text-sm font-bold rounded-xl hover:bg-[#4FA47C] transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>환자 추가</span>
        </button>
      </div>

      {/* 검색 및 필터 바 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E3E2DF] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#898989]" size={18} />
          <input
            type="text"
            placeholder="환자 ID 또는 이름으로 검색..."
            className="w-full pl-10 pr-4 py-2 border border-[#E3E2DF] rounded-lg text-sm focus:outline-none focus:border-[#5EBB8F]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-[#898989] mr-1" />
          {(['all', 'pending', 'in_review', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                filterStatus === status
                  ? 'bg-[#192835] border-[#192835] text-white'
                  : 'bg-white border-[#E3E2DF] text-[#898989] hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? '전체' : status === 'pending' ? '대기' : status === 'in_review' ? '검토 중' : '완료'}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 리스트 */}
      <div className="bg-white rounded-xl border border-[#E3E2DF] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#F9F9F9] border-b border-[#E3E2DF]">
            <tr className="text-[11px] font-bold text-[#898989] uppercase tracking-wider">
              <th className="px-6 py-4">환자 정보</th>
              <th className="px-6 py-4 text-center">방문일 / 이전 방문일</th>
              <th className="px-6 py-4 text-center">검토 상태</th>
              <th className="px-6 py-4 text-center">최근 업데이트</th>
              <th className="px-6 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E2DF]">
            {filteredCases.map((c) => (
              <tr key={c.id} className="hover:bg-[#F9F9F9] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#E0EFE8] flex items-center justify-center text-[#2E664B] font-bold text-xs group-hover:bg-[#5EBB8F] group-hover:text-white transition-colors">
                      {c.id.split('-')[1]?.slice(-3) || 'ID'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#192835]">{c.id}</div>
                      <div className="text-xs text-[#898989]">{c.patientName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-xs font-medium text-[#192835]">{c.visitDate}</div>
                  <div className="text-[10px] text-[#898989] mt-0.5">{c.priorVisitDate || '이전 기록 없음'}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${
                    c.status === 'completed' ? 'bg-[#E0EFE8] text-[#2E664B]' :
                    c.status === 'in_review' ? 'bg-orange-50 text-orange-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {c.status === 'completed' ? '검토 완료' : c.status === 'in_review' ? '검토 진행 중' : '대기'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-[10px] text-[#6A6A6A]">{c.updatedAt || c.visitDate}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/cases/${c.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-[#5EBB8F] hover:underline"
                  >
                    <span>상세 보기</span>
                    <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCases.length === 0 && (
          <div className="p-20 text-center text-[#898989] text-sm italic">
            검색 결과에 해당하는 환자가 없습니다.
          </div>
        )}
      </div>

      {/* 환자 추가 모달 */}
      {showAddModal && (
        <PatientAddModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

const PatientAddModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addCase } = useCaseContext();
  const [form, setForm] = useState({
    patientId: `P-${Math.floor(Math.random() * 9000) + 1000}`,
    caseId: `C-${Math.floor(Math.random() * 90000) + 10000}`,
    patientName: '',
    visitDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    symptomSummary: '',
    symptomDetail: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName || !form.symptomSummary) return alert('필수 정보를 입력해주세요.');

    const newCase: TicCase = {
      id: form.caseId,
      ...form,
      status: 'pending',
      currentPhase: 1,
      updatedAt: new Date().toLocaleString('ko-KR'),
      currentVideo: {
        title: `${form.visitDate} 촬영 영상`,
        duration: 180,
        ticPoints: []
      },
      aiPrediction: {
        classification: '행동 틱',
        confidencePercent: 0,
        faceDetectionPercent: 0,
        summaryEvidence: [],
        ticPoints: []
      }
    };

    addCase(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-[#192835] mb-2">새 환자 Case 등록</h3>
        <p className="text-xs text-[#898989] mb-6">진료를 위한 환자 기본 정보 및 Case를 생성합니다.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#898989] uppercase mb-1">환자 ID (자동생성)</label>
              <input type="text" readOnly className="w-full bg-[#F4F4F4] border border-[#E3E2DF] rounded-lg p-2.5 text-sm font-bold text-[#192835]" value={form.patientId} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#898989] uppercase mb-1">Case ID (자동생성)</label>
              <input type="text" readOnly className="w-full bg-[#F4F4F4] border border-[#E3E2DF] rounded-lg p-2.5 text-sm font-bold text-[#192835]" value={form.caseId} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#898989] uppercase mb-1">환자 성함*</label>
            <input
              type="text"
              placeholder="예: 김*진"
              className="w-full border border-[#E3E2DF] rounded-lg p-2.5 text-sm focus:border-[#5EBB8F] outline-none"
              value={form.patientName}
              onChange={(e) => setForm({...form, patientName: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#898989] uppercase mb-1">방문 날짜</label>
            <input
              type="text"
              className="w-full border border-[#E3E2DF] rounded-lg p-2.5 text-sm focus:border-[#5EBB8F] outline-none"
              value={form.visitDate}
              onChange={(e) => setForm({...form, visitDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#898989] uppercase mb-1">주요 증상 요약*</label>
            <input
              type="text"
              placeholder="예: 반복적인 어깨 들썩임"
              className="w-full border border-[#E3E2DF] rounded-lg p-2.5 text-sm focus:border-[#5EBB8F] outline-none"
              value={form.symptomSummary}
              onChange={(e) => setForm({...form, symptomSummary: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#898989] uppercase mb-1">상세 관찰 메모</label>
            <textarea
              placeholder="특이사항이나 세부 증상을 기록하세요."
              className="w-full border border-[#E3E2DF] rounded-lg p-2.5 text-sm h-24 focus:border-[#5EBB8F] outline-none"
              value={form.symptomDetail}
              onChange={(e) => setForm({...form, symptomDetail: e.target.value})}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 text-sm font-bold text-[#898989] bg-[#F4F4F4] rounded-xl hover:bg-[#EAEAEA]">취소</button>
            <button type="submit" className="flex-1 py-3.5 text-sm font-bold text-white bg-[#5EBB8F] rounded-xl hover:bg-[#4FA47C]">저장 및 생성</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseListView;
