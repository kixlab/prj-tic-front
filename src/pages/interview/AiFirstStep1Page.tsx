import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../../context/CaseContext';
import { useInterviewContext } from '../../context/InterviewContext';
import VideoPreviewPlaceholder from '../../components/video/VideoPreviewPlaceholder';
import ClinicianAssessmentForm from '../../components/interview/ClinicianAssessmentForm';
import { ArrowLeft, Bot, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { AssessmentData, OverallAgreement } from '../../types/interview';
import { SecondaryTicClassification } from '../../types/cdss';

const AiFirstStep1Page: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { getCase } = useCaseContext();
  const { getAiFirstSession, saveAiFirstSession, getAiPrediction } = useInterviewContext();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonDraft, setRejectReasonDraft] = useState('');

  if (!caseId) return <div>잘못된 접근입니다.</div>;

  const currentCase = getCase(caseId);
  const session = getAiFirstSession(caseId);
  const aiPrediction = getAiPrediction(caseId);

  const isLowConfidence = aiPrediction.confidencePercent <= 40;

  // AI 전체 분석 결과를 하나의 텍스트로 포맷팅 (동의/부분 동의 시 판단 근거에 미리 입력되는 원문)
  // ClinicianFirstPhase2.formatAiFullContent와 동일한 패턴
  const formatAiFullContent = () => {
    return [
      ...aiPrediction.summaryEvidence.map(e => `- ${e}`),
      ...aiPrediction.ticPoints.map(p => `- [${p.timeStr}] ${p.label} - ${p.evidence.join(', ')}`)
    ].join('\n');
  };

  // AI mock 데이터는 '행동틱'처럼 공백 없는 문자열을 쓰지만, 버튼 비교값은 '행동 틱'(공백 포함)이라
  // 단순 캐스팅(as SecondaryTicClassification)만으로는 어떤 버튼도 선택 표시되지 않는다. 명시적으로 정규화한다.
  const normalizeSecondaryClassification = (raw?: string): SecondaryTicClassification => {
    if (raw === '음성틱' || raw === '음성 틱') return '음성 틱';
    if (raw === '복합틱' || raw === '복합 틱') return '복합 틱';
    return '행동 틱';
  };

  // 동의/부분 동의 시 AI 예측값을 그대로 임상의 판단 폼에 반영 (Phase2의 confirm/edit 프리필과 동일한 패턴)
  const buildAiPrefilledAssessment = (): AssessmentData => ({
    primaryClassification: aiPrediction.classification === '틱 아님' ? '틱 아님' : '틱',
    secondaryClassification: normalizeSecondaryClassification(aiPrediction.secondaryClassification),
    confidence: aiPrediction.confidenceLevel,
    evidence: formatAiFullContent(),
    notes: '',
  });

  // 불일치/오탐 시: AI 결과는 보존하되 거부되었음을 근거에 표시 (Phase2의 reject 프리필과 동일한 패턴)
  const buildRejectedAssessment = (reason: string): AssessmentData => ({
    primaryClassification: '틱',
    secondaryClassification: '행동 틱',
    confidence: '중간',
    evidence: `[AI 결과 거부] (거부 사유: ${reason || '사유 미입력'})\n\n${formatAiFullContent()}`,
    notes: '',
  });

  const handleAssessmentChange = (field: keyof AssessmentData, value: any) => {
    saveAiFirstSession({
      ...session,
      clinicianAssessment: { ...session.clinicianAssessment, [field]: value }
    });
  };

  // 전체 AI 분석 동의 여부 선택 (불일치/오탐은 사유 입력 모달을 거침)
  const handleOverallAgreementSelect = (mode: OverallAgreement) => {
    if (mode === 'disagree') {
      setRejectReasonDraft(session.disagreeReason || '');
      setShowRejectModal(true);
      return;
    }
    saveAiFirstSession({
      ...session,
      overallAgreement: mode,
      clinicianAssessment: buildAiPrefilledAssessment(),
    });
  };

  const handleRejectConfirm = () => {
    if (!rejectReasonDraft.trim()) return;
    saveAiFirstSession({
      ...session,
      overallAgreement: 'disagree',
      disagreeReason: rejectReasonDraft,
      clinicianAssessment: buildRejectedAssessment(rejectReasonDraft),
    });
    setShowRejectModal(false);
  };

  const canProceed = !!session.overallAgreement;
  const isReadonlyForm = !session.overallAgreement || session.overallAgreement === 'agree';

  const handleNext = () => {
    saveAiFirstSession({ ...session, currentStep: 2 });
    navigate(`/interview/cases/${caseId}/ai-first/step2`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/interview/cases/${caseId}/mode`)}
          className="flex items-center space-x-2 text-sm font-bold text-[#6A6A6A] hover:text-[#192835] transition-colors"
        >
          <ArrowLeft size={18} />
          <span>모드 선택으로 돌아가기</span>
        </button>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
          AI-first 워크플로우 (1/2단계)
        </span>
      </div>

      {/* 환자 요약 */}
      <div className="bg-white rounded-xl border border-[#E3E2DF] p-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#192835] flex items-center space-x-2">
            <span>{currentCase?.patientName} 환자 ({currentCase?.id})</span>
            <span className="text-xs text-[#898989]">방문일: {currentCase?.visitDate}</span>
          </h2>
          <p className="text-xs text-[#6A6A6A] mt-0.5">주요 증상 요약: {currentCase?.symptomSummary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 좌: 영상 + AI 분석 결과 */}
        <div className="bg-white rounded-2xl border border-[#E3E2DF] shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E2DF]">
            <h3 className="text-sm font-bold text-[#192835] flex items-center">
              <Bot size={16} className="mr-2 text-blue-600" />
              환자 영상 및 AI 분석 결과
            </h3>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isLowConfidence ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              AI 신뢰도 {aiPrediction.confidencePercent}%
            </span>
          </div>

          <VideoPreviewPlaceholder ticPoints={aiPrediction.ticPoints} duration={currentCase?.currentVideo.duration} />

          {aiPrediction.warningMessage && (
            <div className={`p-3 rounded-xl border flex items-start space-x-2 ${isLowConfidence ? 'bg-red-100 border-red-300 text-red-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
              <AlertTriangle className={`shrink-0 mt-0.5 ${isLowConfidence ? 'text-red-600' : 'text-amber-600'}`} size={16} />
              <p className="text-[11px] leading-relaxed">{aiPrediction.warningMessage}</p>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F9F9F9] rounded-xl">
              <div>
                <span className="text-[#898989] font-bold block mb-1">AI 예측 분류</span>
                <span className="text-sm font-extrabold text-blue-700">
                  {aiPrediction.classification}{aiPrediction.secondaryClassification ? ` (${aiPrediction.secondaryClassification})` : ''}
                </span>
              </div>
              <div>
                <span className="text-[#898989] font-bold block mb-1">안면 탐지 정확도</span>
                <span className="text-sm font-extrabold text-[#192835]">{aiPrediction.faceDetectionPercent}%</span>
              </div>
            </div>

            <div>
              <span className="text-[#898989] font-bold block mb-1.5">AI 주요 탐지 증거</span>
              <ul className="space-y-1.5 pl-2">
                {aiPrediction.summaryEvidence.map((ev, i) => (
                  <li key={i} className="flex items-start text-[#192835]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-1 shrink-0"></span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {aiPrediction.ticPoints.length > 0 && (
              <div>
                <span className="text-[#898989] font-bold block mb-1.5">탐지 이벤트 및 판단 근거</span>
                <div className="space-y-2">
                  {aiPrediction.ticPoints.map((p) => (
                    <div key={p.id} className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100">
                      <div className="font-bold text-blue-700 text-xs mb-1">[{p.timeStr}] {p.label}</div>
                      <div className="text-[11px] text-[#6A6A6A]">{p.evidence.join(' • ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우: 전체 동의 여부 선택 + 임상의 판단 폼 (Clinician-first Phase1 폼 재사용) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-[#192835] shadow-sm p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#192835]">AI 분석 결과 전체에 동의하십니까?</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['agree', 'partial', 'disagree'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleOverallAgreementSelect(mode)}
                  className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all ${
                    session.overallAgreement === mode
                      ? mode === 'agree'
                        ? 'bg-green-600 border-green-600 text-white'
                        : mode === 'partial'
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-red-600 border-red-600 text-white'
                      : 'bg-white border-[#E3E2DF] text-[#898989] hover:bg-gray-50'
                  }`}
                >
                  {mode === 'agree' ? '동의' : mode === 'partial' ? '부분 동의' : '불일치/오탐'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#898989] pt-1">선택한 항목에 따라 아래 임상의 판단 폼의 상태(읽기전용/편집 가능)가 달라집니다.</p>

            {session.overallAgreement === 'agree' && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-full">
                <CheckCircle2 size={12} /><span>AI 결과 확인됨 (읽기 전용)</span>
              </span>
            )}
            {session.overallAgreement === 'partial' && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full">
                <AlertTriangle size={12} /><span>AI 결과 부분 수정 (편집 가능)</span>
              </span>
            )}
            {session.overallAgreement === 'disagree' && (
              <div className="space-y-1">
                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-full">
                  <AlertTriangle size={12} /><span>AI 결과 거부됨 — 채택되지 않음</span>
                </span>
                <p className="text-[11px] text-[#6A6A6A]">거부 사유: <span className="text-red-700 font-semibold">{session.disagreeReason}</span></p>
                <button
                  type="button"
                  onClick={() => { setRejectReasonDraft(session.disagreeReason || ''); setShowRejectModal(true); }}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 underline"
                >
                  거부 사유 수정
                </button>
              </div>
            )}
          </div>

          <ClinicianAssessmentForm
            title="임상의 판단 작성"
            description="AI 예측 결과를 확인한 후, 의료진의 임상적 판단을 기록합니다."
            value={session.clinicianAssessment}
            onChange={handleAssessmentChange}
            readOnly={isReadonlyForm}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`px-6 py-3 font-bold text-sm rounded-xl transition-colors flex items-center space-x-2 shadow-sm ${
            canProceed ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>2단계: 최종 판단으로 이동</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#192835]">AI 결과 거부 사유 작성</h3>
            <textarea
              className="w-full h-24 p-3 border border-[#E3E2DF] rounded-xl text-xs"
              placeholder="거부 사유를 입력하세요. (필수)"
              value={rejectReasonDraft}
              onChange={(e) => setRejectReasonDraft(e.target.value)}
            />
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 text-xs font-bold text-[#898989] bg-[#F4F4F4] rounded-xl hover:bg-[#EAEAEA]">취소</button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReasonDraft.trim()}
                className={`flex-1 py-3 text-xs font-bold rounded-xl ${rejectReasonDraft.trim() ? 'text-white bg-red-500 hover:bg-red-600' : 'text-gray-400 bg-gray-200 cursor-not-allowed'}`}
              >
                거부 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiFirstStep1Page;
