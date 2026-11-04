import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Info, History, Video, CheckCircle, Clock } from 'lucide-react';
import { useCaseContext } from '../../context/CaseContext';

interface CaseHeaderProps {
  phase: 1 | 2 | 3 | 'compare';
}

const CaseHeader: React.FC<CaseHeaderProps> = ({ phase }) => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { getCase } = useCaseContext();
  const caseData = getCase(caseId || '');

  if (!caseData) return null;

  const steps = [
    { num: 1, stepStr: '01', label: '1단계: 임상의 초기 판단', path: 'phase1' },
    { num: 2, stepStr: '02', label: '2단계: AI 분석 및 근거 검토', path: 'phase2' },
    { num: 3, stepStr: '03', label: '3단계: 판단 확정 및 최종 기록', path: 'phase3' },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* 상단 네비게이션 및 환자 요약 바 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/cases/${caseData.id}`)}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-[#E3E2DF] transition-all"
            title="환자 개인 대시보드로 이동"
          >
            <ChevronLeft size={20} className="text-[#192835]" />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#898989] mb-0.5">
              <span className="flex items-center font-bold text-[#192835]">
                {caseData.patientName} ({caseData.patientId})
              </span>
              <span>•</span>
              <span className="flex items-center">
                <CalendarIcon size={12} className="mr-1 text-[#5EBB8F]" /> {caseData.visitDate}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#192835]">Case {caseData.id}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {phase !== 'compare' && (
            <button
              onClick={() => navigate(`/cases/${caseId}/compare`)}
              className="px-3.5 py-2 text-xs font-bold border border-[#E3E2DF] bg-white hover:bg-gray-50 text-[#192835] rounded-xl flex items-center space-x-2 shadow-sm transition-colors"
            >
              <Video size={14} className="text-[#5EBB8F]" />
              <span>이전 영상 비교</span>
            </button>
          )}
          <button
            onClick={() => navigate(`/cases/${caseData.id}`)}
            className="px-3.5 py-2 text-xs font-bold bg-[#E0EFE8] text-[#2E664B] hover:bg-[#C1E9D6] rounded-xl transition-colors"
          >
            환자 대시보드
          </button>
        </div>
      </div>

      {/* Case 정보 상세 바 */}
      <div className="bg-white border border-[#E3E2DF] rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="border-r border-[#E3E2DF] pr-6">
            <div className="text-[10px] uppercase tracking-wider text-[#898989] mb-1 font-bold">주요 증상 요약</div>
            <div className="text-sm font-bold text-[#192835]">{caseData.symptomSummary}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#898989] mb-1 font-bold">상세 관찰 내용</div>
            <div className="text-sm text-[#6A6A6A]">{caseData.symptomDetail}</div>
          </div>
        </div>
        {phase === 'compare' && (
          <button
            onClick={() => navigate(`/cases/${caseId}/phase${caseData.currentPhase}`)}
            className="px-4 py-2 bg-[#5EBB8F] text-white text-xs font-bold rounded-lg hover:bg-[#4FA47C] transition-colors"
          >
            검토 화면으로 돌아가기
          </button>
        )}
      </div>

      {/* 3단계 스테퍼 - 강한 시각적 구분 적용 */}
      {phase !== 'compare' && (
        <div className="grid grid-cols-3 gap-3">
          {steps.map((step) => {
            const isCurrent = phase === step.num;
            const isCompleted = caseData.currentPhase > step.num || caseData.status === 'completed';

            return (
              <div
                key={step.num}
                onClick={() => navigate(`/cases/${caseId}/${step.path}`)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-white border-[#5EBB8F] shadow-md ring-2 ring-[#5EBB8F]/10'
                    : isCompleted
                    ? 'bg-[#F0F8F4] border-[#C1E9D6] text-[#2E664B]'
                    : 'bg-[#F9F9F9] border-transparent text-[#898989] hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isCurrent
                      ? 'bg-[#5EBB8F] text-white'
                      : isCompleted
                      ? 'bg-[#C1E9D6] text-[#1F4734]'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.stepStr}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isCurrent ? 'text-[#192835]' : 'text-inherit'}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] opacity-75">
                      {isCurrent ? '현재 진행 중' : isCompleted ? '작성 완료' : '대기 중'}
                    </div>
                  </div>
                </div>
                {isCompleted && <CheckCircle size={16} className="text-[#5EBB8F]" />}
                {isCurrent && <Clock size={16} className="text-[#5EBB8F] animate-pulse" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CalendarIcon: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export default CaseHeader;
