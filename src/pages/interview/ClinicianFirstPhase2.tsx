import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../../context/CaseContext';
import { useInterviewContext } from '../../context/InterviewContext';
import VideoPreviewPlaceholder from '../../components/video/VideoPreviewPlaceholder';
import { ArrowLeft, Bot, User, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

const ClinicianFirstPhase2: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { getCase } = useCaseContext();
  const { getClinicianSession, saveClinicianSession, getAiPrediction } = useInterviewContext();

  const session = getClinicianSession(caseId!);
  const currentCase = getCase(caseId!);
  const aiPrediction = getAiPrediction(caseId!);

  const [showModal, setShowModal] = useState(false);

  const isLowConfidence = aiPrediction.confidencePercent <= 40;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const formatAiFullContent = () => {
    return [
      ...aiPrediction.summaryEvidence.map(e => `- ${e}`),
      ...aiPrediction.ticPoints.map(p => `- [${p.timeStr}] ${p.label} - ${p.evidence.join(', ')}`)
    ].join('\n');
  };

  const handleReviewAction = (action: 'confirm' | 'edit' | 'reject') => {
    if (action === 'edit') {
      // 수정 모드: AI 전체 분석 내용을 pre-fill하여 3단계로 이동
      const fullAiText = formatAiFullContent();
      const finalDecision = session.finalDecision || {
        primaryClassification: aiPrediction.classification === '틱 아님' ? '틱 아님' : '틱',
        secondaryClassification: (aiPrediction.secondaryClassification as SecondaryTicClassification) || '행동 틱',
        confidence: aiPrediction.confidenceLevel,
        evidence: fullAiText,
        notes: session.initialAssessment.notes || '',
        savedAt: new Date().toLocaleString('ko-KR')
      };

      saveClinicianSession({
        ...session,
        currentStep: 3,
        finalDecision,
        clinicianReview: {
          ...session.clinicianReview,
          notes: 'AI 결과 수정 모드'
        }
      });
      navigate(`/interview/cases/${caseId}/clinician-first/step3`);
    } else if (action === 'confirm') {
      // 확인 모드: AI 전체 분석 내용을 읽기 전용으로 반영
      const fullAiText = formatAiFullContent();
      const finalDecision = {
        primaryClassification: (aiPrediction.classification === '틱 아님' ? '틱 아님' : '틱') as PrimaryTicClassification,
        secondaryClassification: (aiPrediction.secondaryClassification as SecondaryTicClassification) || '행동 틱',
        confidence: aiPrediction.confidenceLevel,
        evidence: fullAiText,
        notes: 'AI 결과 확인 수용됨',
        savedAt: new Date().toLocaleString('ko-KR')
      };

      saveClinicianSession({
        ...session,
        currentStep: 3,
        finalDecision,
        clinicianReview: {
          ...session.clinicianReview,
          notes: 'AI 결과 확인'
        }
      });
      navigate(`/interview/cases/${caseId}/clinician-first/step3`);
    } else if (action === 'reject') {
      setShowRejectModal(true);
    }
  };

  const handleRejectSubmit = () => {
    const fullAiText = formatAiFullContent();
    const rejectedEvidence = `[AI 결과 거부] (거부 사유: ${rejectReason || '사유 미입력'})\n\n${fullAiText}`;

    const finalDecision = {
      ...session.initialAssessment,
      evidence: rejectedEvidence,
      notes: `거부 사유: ${rejectReason}`,
      savedAt: new Date().toLocaleString('ko-KR')
    };

    saveClinicianSession({
      ...session,
      currentStep: 3,
      finalDecision,
      clinicianReview: {
        ...session.clinicianReview,
        notes: `AI 결과 거부: ${rejectReason}`
      }
    });
    setShowRejectModal(false);
    navigate(`/interview/cases/${caseId}/clinician-first/step3`);
  };

  const confirmEdit = () => {
    handleReviewAction('edit');
  };

  if (!currentCase) return <div className="p-10 text-center">Case를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-[#E3E2DF] shadow-sm">
        <button onClick={() => navigate(`/interview/cases/${caseId}/clinician-first/step1`)} className="flex items-center text-xs font-bold text-[#6A6A6A] hover:text-[#192835]">
          <ArrowLeft size={16} className="mr-2" /> 1단계로 돌아가기
        </button>
        <span className="text-xs font-extrabold bg-[#5EBB8F] text-white px-3 py-1 rounded-full">
          Clinician-First • Step 2 (AI 분석 검토)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Video & AI */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E3E2DF] shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E3E2DF]">
              <h3 className="text-sm font-bold text-[#192835] flex items-center">
                <Bot size={16} className="mr-2 text-[#5EBB8F]" />
                환자 영상 및 AI 탐지 포인트
              </h3>
              <span className="text-[10px] font-bold bg-[#E0EFE8] text-[#2E664B] px-2.5 py-1 rounded-full">
                AI 신뢰도 {aiPrediction.confidencePercent}%
              </span>
            </div>
            <VideoPreviewPlaceholder
              ticPoints={aiPrediction.ticPoints}
              duration={currentCase.currentVideo.duration}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-[#5EBB8F] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#5EBB8F] text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl">
              AI 분석 결과
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Bot size={18} className="text-[#5EBB8F]" />
              <h3 className="text-sm font-bold text-[#192835]">B. AI 분석 및 근거 확인</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-[#F9F9F9] rounded-xl">
                <div>
                  <span className="text-[#898989] font-bold block mb-1">AI 예측 분류</span>
                  <span className="text-sm font-extrabold text-[#5EBB8F]">{aiPrediction.classification}</span>
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
                    <li key={i} className="flex items-center text-[#192835]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5EBB8F] mr-2"></span>
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>

              {aiPrediction.ticPoints.length > 0 && (
                <div>
                  <span className="text-[#898989] font-bold block mb-1.5">타임라인별 AI 감지 포인트</span>
                  <div className="space-y-2">
                    {aiPrediction.ticPoints.map(p => (
                      <div key={p.id} className="p-2.5 bg-[#F0F8F4] rounded-lg border border-[#C1E9D6]">
                        <div className="font-bold text-[#2E664B] mb-1">{p.label}</div>
                        <div className="text-[11px] text-[#6A6A6A]">{p.evidence.join(' • ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Initial Assessment & Review Action */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="bg-white p-6 rounded-2xl border border-[#E3E2DF] shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <User size={18} className="text-[#192835]" />
              <h3 className="text-sm font-bold text-[#192835]">A. 임상의 초기 판단 기록 (원본 보존)</h3>
            </div>
            <div className="space-y-3 text-xs bg-[#F9F9F9] p-4 rounded-xl border border-[#E3E2DF]">
              <div className="flex justify-between">
                <span className="text-[#898989] font-bold">1차/2차 분류</span>
                <span className="font-bold text-[#192835]">
                  {session.initialAssessment.primaryClassification} {session.initialAssessment.secondaryClassification ? `> ${session.initialAssessment.secondaryClassification}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#898989] font-bold">확신 정도</span>
                <span className="font-bold text-[#192835]">{session.initialAssessment.confidence}</span>
              </div>
              <div>
                <span className="text-[#898989] font-bold block mb-1">판단 근거</span>
                <p className="text-[#192835] bg-white p-2.5 rounded-lg border border-[#E3E2DF]">{session.initialAssessment.evidence || '입력된 근거 없음'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-[#192835] shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 size={18} className="text-[#5EBB8F]" />
              <h3 className="text-sm font-bold text-[#192835]">C. 검토 작업 선택</h3>
            </div>
            <p className="text-xs text-[#898989] mb-6">AI 분석 결과를 검토한 후 아래 액션 중 하나를 선택하세요.</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button onClick={() => handleReviewAction('edit')} className="p-4 bg-white border-2 border-[#5EBB8F] text-[#5EBB8F] text-xs font-bold rounded-xl hover:bg-[#F0F8F4] transition-all flex flex-col items-center justify-center space-y-1 shadow-sm">
                <span>AI 결과 수정</span>
              </button>
              <button onClick={() => handleReviewAction('confirm')} className="p-4 bg-[#5EBB8F] text-white text-xs font-bold rounded-xl hover:bg-[#4FA47C] transition-all flex flex-col items-center justify-center space-y-1 shadow-sm">
                <span>AI 결과 확인</span>
              </button>
              <button onClick={() => handleReviewAction('reject')} className="p-4 bg-white border-2 border-red-400 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all flex flex-col items-center justify-center space-y-1 shadow-sm">
                <span>AI 결과 거부</span>
              </button>
            </div>
            <div className="p-3 bg-[#F4F4F4] rounded-xl text-[11px] text-[#6A6A6A]">
              * 각 선택에 따라 감사 로그가 남으며 3단계에서 반영됩니다.
            </div>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#192835]">AI 결과 거부 사유 작성</h3>
            <textarea
              className="w-full h-24 p-3 border border-[#E3E2DF] rounded-xl text-xs"
              placeholder="거부 사유를 입력하세요."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 text-xs font-bold text-[#898989] bg-[#F4F4F4] rounded-xl hover:bg-[#EAEAEA]">취소</button>
              <button onClick={handleRejectSubmit} className="flex-1 py-3 text-xs font-bold text-white bg-red-500 rounded-xl hover:bg-red-600">거부 확인</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-[#F0F8F4] text-[#5EBB8F] rounded-full flex items-center justify-center mx-auto"><AlertCircle size={32} /></div>
            <h3 className="text-lg font-bold text-[#192835]">임상의 판단 수정 모드</h3>
            <p className="text-xs text-[#6A6A6A]">편집 화면(3단계)으로 이동합니다.</p>
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-xs font-bold text-[#898989] bg-[#F4F4F4] rounded-xl hover:bg-[#EAEAEA]">취소</button>
              <button onClick={confirmEdit} className="flex-1 py-3 text-xs font-bold text-white bg-[#5EBB8F] rounded-xl hover:bg-[#4FA47C]">확인 및 이동</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicianFirstPhase2;
