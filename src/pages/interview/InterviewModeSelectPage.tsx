import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCaseContext } from '../../context/CaseContext';
import { useInterviewContext } from '../../context/InterviewContext';
import { Stethoscope, Bot, ArrowLeft, CheckCircle2, Clock, Play, ChevronRight, AlertTriangle } from 'lucide-react';

const InterviewModeSelectPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { getCase } = useCaseContext();
  const { getClinicianSession, getAiFirstSession, getAiPrediction } = useInterviewContext();

  if (!caseId) return <div>환자 ID가 올바르지 않습니다.</div>;

  const currentCase = getCase(caseId);
  if (!currentCase) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-[#192835]">환자를 찾을 수 없습니다.</h2>
        <Link to="/interview/cases" className="text-[#5EBB8F] font-bold mt-4 inline-block hover:underline">
          Interview 환자 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const aiPrediction = getAiPrediction(caseId);
  const clinicianSession = getClinicianSession(caseId);
  const aiFirstSession = getAiFirstSession(caseId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 상단 헤더 & 뒤로가기 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/interview/cases')}
          className="flex items-center space-x-2 text-sm font-bold text-[#6A6A6A] hover:text-[#192835] transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Interview 환자 목록으로 돌아가기</span>
        </button>
        <span className="px-3 py-1 bg-[#E0EFE8] text-[#2E664B] text-xs font-bold rounded-full">
          Interview 전용 워크플로우
        </span>
      </div>

      {/* 환자 정보 카드 */}
      <div className="bg-white rounded-xl border border-[#E3E2DF] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-[#192835]">{currentCase.patientName}</span>
            <span className="text-sm font-medium text-[#898989]">({currentCase.id})</span>
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">
              {currentCase.patientId}
            </span>
          </div>
          <p className="text-sm text-[#6A6A6A] mt-2">
            <span className="font-semibold text-[#192835]">주요 증상:</span> {currentCase.symptomSummary}
          </p>
          <p className="text-xs text-[#898989] mt-1">방문일: {currentCase.visitDate}</p>
        </div>

        {/* AI Mock 신뢰도 40% 경고 표시가 필요하다면 작게 안내 */}
        {aiPrediction.scenarioType === 'low_confidence' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-xs text-xs text-red-700 flex items-start space-x-2">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">낮은 AI 신뢰도 (40%)</span>
              <p className="text-[11px] text-red-600 mt-0.5">영상 화질 및 제스처 모호함으로 AI 신뢰도가 낮습니다.</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-2">
        <h2 className="text-xl font-bold text-[#192835]">AI 협업 워크플로우 방식을 선택하세요</h2>
        <p className="text-sm text-[#6A6A6A] mt-1">
          임상의 선행 판단 후 AI와 비교할지, AI 분석 결과를 먼저 검토할지 선택합니다.
        </p>
      </div>

      {/* 모드 선택 카드 2개 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Clinician-first 카드 */}
        <div className="bg-white rounded-2xl border-2 border-[#E3E2DF] hover:border-[#5EBB8F] transition-all p-6 shadow-sm flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#E0EFE8] text-[#1F4734] flex items-center justify-center group-hover:bg-[#5EBB8F] group-hover:text-white transition-colors">
                <Stethoscope size={24} />
              </div>
              {clinicianSession.status === 'completed' ? (
                <span className="flex items-center space-x-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  <CheckCircle2 size={13} />
                  <span>작성 완료</span>
                </span>
              ) : clinicianSession.initialAssessment.symptomDescription ? (
                <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  <Clock size={13} />
                  <span>진행 중 ({clinicianSession.currentStep}단계)</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                  미작성
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-[#192835]">Clinician-first 워크플로우</h3>
            <p className="text-xs font-semibold text-[#5EBB8F] mt-0.5">3단계 프로세스</p>

            <p className="text-sm text-[#6A6A6A] mt-3 leading-relaxed">
              AI 편향 없이 <strong>임상의가 독자적으로 먼저 환자 상태를 판단</strong>한 후, AI 분석 결과를 공개하여 대조 및 비교 검토를 거쳐 최종 판단을 내립니다.
            </p>

            <div className="mt-4 p-3 bg-[#F9F9F9] rounded-xl text-xs space-y-1.5 text-[#6A6A6A]">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#192835] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>임상의 초기 판단 (자연어 작성, AI 결과 비공개)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#192835] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>AI 분석 결과 공개 및 임상의 판단과 비교·검토</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-[#192835] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>임상의 최종 판단 및 완료</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/interview/cases/${caseId}/clinician-first/step1`)}
            className="mt-6 w-full py-3 bg-[#192835] text-white font-bold text-sm rounded-xl hover:bg-[#2A3E50] transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>{clinicianSession.status === 'completed' ? '결과 확인 및 수정하기' : clinicianSession.initialAssessment.symptomDescription ? '이어서 진행하기' : 'Clinician-first 시작하기'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* AI-first 카드 */}
        <div className="bg-white rounded-2xl border-2 border-[#E3E2DF] hover:border-[#5EBB8F] transition-all p-6 shadow-sm flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Bot size={24} />
              </div>
              {aiFirstSession.status === 'completed' ? (
                <span className="flex items-center space-x-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  <CheckCircle2 size={13} />
                  <span>작성 완료</span>
                </span>
              ) : aiFirstSession.overallAgreement ? (
                <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  <Clock size={13} />
                  <span>진행 중 ({aiFirstSession.currentStep}단계)</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                  미작성
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-[#192835]">AI-first 워크플로우</h3>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">2단계 프로세스</p>

            <p className="text-sm text-[#6A6A6A] mt-3 leading-relaxed">
              <strong>AI 분석 결과를 먼저 검토</strong>하면서, 각 AI 감지 포인트와 증상 분석 옆에 임상의가 자연어로 대응 의견을 직접 작성하고 빠른 진단을 수행합니다.
            </p>

            <div className="mt-4 p-3 bg-[#F9F9F9] rounded-xl text-xs space-y-1.5 text-[#6A6A6A]">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>AI 결과 검토 및 각 항목별 임상의 자연어 대응 작성</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>임상의 최종 판단 및 완료</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/interview/cases/${caseId}/ai-first/step1`)}
            className="mt-6 w-full py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>{aiFirstSession.status === 'completed' ? '결과 확인 및 수정하기' : aiFirstSession.overallAgreement ? '이어서 진행하기' : 'AI-first 시작하기'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewModeSelectPage;
