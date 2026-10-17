import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Info, History, Video } from 'lucide-react';
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
    { num: '01', label: '영상 검토 및 임상의 초기 판단', path: 'phase1' },
    { num: '02', label: 'AI 분석 및 근거 확인', path: 'phase2' },
    { num: '03', label: '판단 수정 및 최종 기록', path: 'phase3' },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* 상단 네비게이션 및 환자 요약 바 (Mockup 상단부) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/cases')}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#898989] mb-0.5">
              <span className="hover:underline cursor-pointer flex items-center">
                <Info size={12} className="mr-1" /> 환자 정보
              </span>
              <span>•</span>
              <span className="hover:underline cursor-pointer flex items-center text-[#5EBB8F]">
                <History size={12} className="mr-1" /> 이전 방문 정보
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#192835]">Case {caseData.id}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-[#192835]">환자 ID · 방문 날짜</div>
            <div className="text-sm text-[#6A6A6A]">{caseData.patientId} · {caseData.visitDate}</div>
          </div>
          {phase !== 'compare' && (
            <button
              onClick={() => navigate(`/cases/${caseId}/compare`)}
              className="px-3.5 py-2 text-xs font-semibold border border-[#E3E2DF] bg-white hover:bg-gray-50 rounded-lg flex items-center space-x-2 shadow-sm"
            >
              <Video size={14} className="text-[#5EBB8F]" />
              <span>이전 영상 보기</span>
            </button>
          )}
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

      {/* 3단계 스테퍼 (Mockup 핵심 요소) */}
      {phase !== 'compare' && (
        <div className="flex items-center space-x-1">
          {steps.map((step, idx) => {
            const isCurrent = phase === (idx + 1);
            const isCompleted = (caseData.currentPhase > idx + 1) || (caseData.status === 'completed');

            return (
              <React.Fragment key={step.num}>
                <div
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-[#192835] text-white shadow-md'
                      : 'text-[#898989] hover:text-[#6A6A6A]'
                  }`}
                >
                  <span className={`text-xs font-bold ${isCurrent ? 'text-[#5EBB8F]' : ''}`}>
                    {step.num}
                  </span>
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="w-4 flex justify-center text-[#E3E2DF]">
                    <ChevronLeft size={16} className="rotate-180" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CaseHeader;
