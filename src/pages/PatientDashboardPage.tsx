import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import {
  Activity,
  Video,
  Clock,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';

const PatientDashboardPage: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { getCase } = useCaseContext();
  const caseData = getCase(caseId || '');

  if (!caseData) {
    return (
      <div className="p-10 text-center text-gray-500">
        환자 정보를 찾을 수 없습니다.
        <button
          onClick={() => navigate('/cases')}
          className="ml-4 text-xs font-bold text-[#5EBB8F] hover:underline"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 상단 헤더 & 뒤로가기 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 bg-white rounded-xl border border-[#E3E2DF] hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} className="text-[#192835]" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#192835]">{caseData.patientName}</span>
              <span className="text-sm text-[#898989]">({caseData.patientId})</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                caseData.status === 'completed' ? 'bg-[#E0EFE8] text-[#2E664B]' : 'bg-orange-50 text-orange-600'
              }`}>
                {caseData.status === 'completed' ? '검토 완료' : '검토 진행 중'}
              </span>
            </div>
            <p className="text-xs text-[#6A6A6A] mt-1">Case ID: {caseData.id}</p>
          </div>
        </div>

        <Link
          to={`/cases/${caseData.id}/phase${caseData.currentPhase}`}
          className="px-5 py-2.5 bg-[#5EBB8F] text-white text-xs font-bold rounded-xl hover:bg-[#4FA47C] transition-colors flex items-center space-x-2 shadow-sm"
        >
          <span>진단 분석 화면 진입 (Phase {caseData.currentPhase})</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* 상단 환자 요약 카드 */}
      <div className="bg-white rounded-xl border border-[#E3E2DF] p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E3E2DF]">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#898989] mb-1">방문 날짜</div>
            <div className="text-sm font-bold text-[#192835] flex items-center">
              <Calendar size={14} className="mr-1 text-[#5EBB8F]" />
              {caseData.visitDate}
            </div>
            <div className="text-[10px] text-[#898989] mt-1">
              이전 방문: {caseData.priorVisitDate || '없음'}
            </div>
          </div>

          <div className="pt-4 md:pt-0 md:pl-6">
            <div className="text-[10px] uppercase font-bold text-[#898989] mb-1">주요 증상 요약</div>
            <div className="text-sm font-bold text-[#192835]">{caseData.symptomSummary}</div>
            <div className="text-[10px] text-[#6A6A6A] mt-1 truncate">{caseData.symptomDetail}</div>
          </div>

          <div className="pt-4 md:pt-0 md:pl-6">
            <div className="text-[10px] uppercase font-bold text-[#898989] mb-1">현재 진행 단계</div>
            <div className="text-sm font-bold text-[#5EBB8F]">
              Phase {caseData.currentPhase}: {
                caseData.currentPhase === 1 ? '임상의 초기 판단' :
                caseData.currentPhase === 2 ? 'AI 분석 검토' : '최종 판단'
              }
            </div>
            <div className="text-[10px] text-[#898989] mt-1">
              최종 수정: {caseData.updatedAt || caseData.visitDate}
            </div>
          </div>

          <div className="pt-4 md:pt-0 md:pl-6">
            <div className="text-[10px] uppercase font-bold text-[#898989] mb-1">최종 판단 상태</div>
            <div className="text-sm font-bold text-[#192835]">
              {caseData.finalDecision ? caseData.finalDecision.classification || caseData.finalDecision.primaryClassification : '미완료'}
            </div>
            <div className="text-[10px] text-[#898989] mt-1">
              {caseData.finalDecision ? '저장된 최종 진단 있음' : '초기 진단 진행 필요'}
            </div>
          </div>
        </div>
      </div>

      {/* 주요 기능 3가지 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. 환자 분석 */}
        <div className="bg-white rounded-xl border border-[#E3E2DF] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Activity size={20} className="text-[#5EBB8F]" />
              <h2 className="text-base font-bold text-[#192835]">환자 분석</h2>
            </div>
            <p className="text-xs text-[#6A6A6A] leading-relaxed mb-6">
              현재 Case의 틱 검토 단계별 상태를 확인하고, 임상의 초기 판단 및 AI 분석 검토를 진행합니다.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-[#F9F9F9] rounded-lg text-xs">
                <span className="font-semibold text-[#898989]">초기 판단</span>
                <span className={`font-bold ${caseData.initialAssessment ? 'text-[#2E664B]' : 'text-gray-400'}`}>
                  {caseData.initialAssessment ? '완료' : '미작성'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#F9F9F9] rounded-lg text-xs">
                <span className="font-semibold text-[#898989]">AI 검토</span>
                <span className={`font-bold ${caseData.reviewAction ? 'text-[#2E664B]' : 'text-gray-400'}`}>
                  {caseData.reviewAction ? caseData.reviewAction.action : '미검토'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#F9F9F9] rounded-lg text-xs">
                <span className="font-semibold text-[#898989]">최종 판단</span>
                <span className={`font-bold ${caseData.finalDecision ? 'text-[#2E664B]' : 'text-gray-400'}`}>
                  {caseData.finalDecision ? '확정됨' : '대기'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/cases/${caseData.id}/phase${caseData.currentPhase}`)}
            className="w-full py-3 bg-[#192835] text-white font-bold text-xs rounded-xl hover:bg-black transition-colors"
          >
            현재 단계로 이동 (Phase {caseData.currentPhase})
          </button>
        </div>

        {/* 2. 이전 영상 */}
        <div className="bg-white rounded-xl border border-[#E3E2DF] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Video size={20} className="text-[#5EBB8F]" />
              <h2 className="text-base font-bold text-[#192835]">이전 영상 검토</h2>
            </div>
            <p className="text-xs text-[#6A6A6A] leading-relaxed mb-6">
              이전 방문 시 촬영된 영상과 현재 영상을 측면 비교하여 증상 변화 및 경과를 분석합니다.
            </p>

            {caseData.priorVideo ? (
              <div className="p-4 bg-[#F0F8F4] border border-[#C1E9D6] rounded-xl mb-6">
                <div className="text-xs font-bold text-[#2E664B] mb-2 flex items-center justify-between">
                  <span>이전 영상: {caseData.priorVideo.visitDate}</span>
                  <span className="text-[10px] font-normal">{caseData.priorVideo.title}</span>
                </div>
                <div className="text-[11px] text-[#6A6A6A] space-y-1">
                  <div>변화 요약:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {caseData.priorVideo.symptomChanges.map((change, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white rounded border text-[10px] font-bold text-[#2E664B]">
                        {change}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#F9F9F9] rounded-xl text-center text-xs text-[#898989] mb-6">
                이전 방문 영상이 존재하지 않는 신규 환자입니다.
              </div>
            )}
          </div>

          <button
            onClick={() => navigate(`/cases/${caseData.id}/compare`)}
            disabled={!caseData.priorVideo}
            className={`w-full py-3 font-bold text-xs rounded-xl transition-colors ${
              caseData.priorVideo
                ? 'bg-[#5EBB8F] text-white hover:bg-[#4FA47C]'
                : 'bg-[#F4F4F4] text-[#898989] cursor-not-allowed'
            }`}
          >
            이전 영상 비교 화면으로 이동
          </button>
        </div>

        {/* 3. 검토 이력 및 작업 */}
        <div className="bg-white rounded-xl border border-[#E3E2DF] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FileText size={20} className="text-[#5EBB8F]" />
              <h2 className="text-base font-bold text-[#192835]">검토 이력</h2>
            </div>
            <p className="text-xs text-[#6A6A6A] leading-relaxed mb-6">
              지금까지 입력된 임상의의 판단 기록 및 감사 로그(Audit Trail)를 확인합니다.
            </p>

            <div className="space-y-3 mb-6">
              {caseData.initialAssessment && (
                <div className="p-3 bg-[#F9F9F9] rounded-lg">
                  <div className="text-[10px] font-bold text-[#898989]">초기 판단 기록</div>
                  <div className="text-xs font-bold text-[#192835] mt-1">
                    {caseData.initialAssessment.classification || caseData.initialAssessment.primaryClassification} (확신도: {caseData.initialAssessment.confidence})
                  </div>
                </div>
              )}
              {caseData.finalDecision && (
                <div className="p-3 bg-[#E0EFE8] rounded-lg">
                  <div className="text-[10px] font-bold text-[#2E664B]">최종 확정 기록</div>
                  <div className="text-xs font-bold text-[#1F4734] mt-1">
                    {caseData.finalDecision.classification || caseData.finalDecision.primaryClassification} (확신도: {caseData.finalDecision.confidence})
                  </div>
                </div>
              )}
              {!caseData.initialAssessment && !caseData.finalDecision && (
                <div className="p-6 text-center text-xs text-[#898989]">
                  기록된 검토 이력이 아직 없습니다.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/cases/${caseData.id}/phase1`)}
            className="w-full py-3 border border-[#E3E2DF] text-[#192835] font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
          >
            Phase 1부터 다시 검토하기
          </button>
        </div>

      </div>
    </div>
  );
};

export default PatientDashboardPage;
