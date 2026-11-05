import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../../context/CaseContext';
import { useInterviewContext } from '../../context/InterviewContext';
import VideoPreviewPlaceholder from '../../components/video/VideoPreviewPlaceholder';
import { PrimaryTicClassification, SecondaryTicClassification } from '../../types/cdss';
import { ArrowLeft, CheckCircle2, MessageSquareText } from 'lucide-react';

const AiFirstStep2Page: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { getCase } = useCaseContext();
  const { getAiFirstSession, saveAiFirstSession, getAiPrediction } = useInterviewContext();

  if (!caseId) return <div>잘못된 접근입니다.</div>;

  const currentCase = getCase(caseId);
  const session = getAiFirstSession(caseId);
  const aiPrediction = getAiPrediction(caseId);

  const isPartial = session.overallAgreement === 'partial';
  const isRejected = session.overallAgreement === 'disagree';

  // 1단계에서 이미 채워진 임상의 판단(clinicianAssessment)을 최종 판단의 기본값으로 사용
  const [rejectReasonDraft, setRejectReasonDraft] = useState(session.disagreeReason || '');

  const handleUpdate = (field: string, value: string) => {
    saveAiFirstSession({
      ...session,
      finalDecision: {
        ...session.clinicianAssessment,
        ...(session.finalDecision || {}),
        [field]: value
      }
    });
  };

  const handleRejectReasonChange = (value: string) => {
    setRejectReasonDraft(value);
    saveAiFirstSession({ ...session, disagreeReason: value });
  };

  const handleComplete = () => {
    const notes = session.finalDecision?.notes ?? session.clinicianAssessment.notes;
    saveAiFirstSession({
      ...session,
      status: 'completed',
      finalDecision: {
        primaryClassification: session.finalDecision?.primaryClassification || session.clinicianAssessment.primaryClassification,
        secondaryClassification: session.finalDecision?.secondaryClassification || session.clinicianAssessment.secondaryClassification,
        confidence: session.finalDecision?.confidence || session.clinicianAssessment.confidence,
        evidence: session.finalDecision?.evidence ?? session.clinicianAssessment.evidence,
        notes: isRejected ? `[거부 사유]: ${rejectReasonDraft}\n${notes}` : notes,
        submittedAt: new Date().toLocaleString('ko-KR')
      }
    });
    alert('최종 판단이 완료되었습니다.');
    navigate(`/interview/cases/${caseId}/mode`);
  };

  if (!currentCase) return <div className="p-10 text-center">Case를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-[#E3E2DF] shadow-sm">
        <button
          onClick={() => navigate(`/interview/cases/${caseId}/ai-first/step1`)}
          className="flex items-center text-xs font-bold text-[#6A6A6A] hover:text-[#192835]"
        >
          <ArrowLeft size={16} className="mr-2" /> 1단계로 돌아가기
        </button>
        <span className="text-xs font-extrabold bg-blue-600 text-white px-3 py-1 rounded-full">
          AI-first • Step 2 (최종 판단)
        </span>
      </div>

      {/* 1단계 검토 요약 참조 박스 */}
      <div className="bg-[#F9F9F9] rounded-2xl border border-[#E3E2DF] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#192835] flex items-center space-x-2">
          <MessageSquareText size={16} className="text-blue-600" />
          <span>1단계 검토 요약 (참조용)</span>
        </h3>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#898989]">전체 AI 분석 동의 여부:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
            session.overallAgreement === 'agree' ? 'bg-green-100 text-green-700' :
            session.overallAgreement === 'partial' ? 'bg-amber-100 text-amber-700' :
            session.overallAgreement === 'disagree' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {session.overallAgreement === 'agree' ? '동의' : session.overallAgreement === 'partial' ? '부분 동의' : session.overallAgreement === 'disagree' ? '불일치/오탐' : '미선택'}
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs shadow-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#898989] font-bold">1차/2차 분류</span>
            <span className="font-bold text-[#192835]">
              {session.clinicianAssessment.primaryClassification} {session.clinicianAssessment.secondaryClassification ? `> ${session.clinicianAssessment.secondaryClassification}` : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#898989] font-bold">확신 정도</span>
            <span className="font-bold text-[#192835]">{session.clinicianAssessment.confidence}</span>
          </div>
          <div>
            <span className="text-[#898989] font-bold block mb-1">판단 근거</span>
            <p className="text-[#192835] bg-[#F9F9F9] p-2 rounded-lg whitespace-pre-wrap">{session.clinicianAssessment.evidence || '입력된 근거 없음'}</p>
          </div>
          {isRejected && (
            <div>
              <span className="text-red-700 font-bold block mb-1">거부 사유</span>
              <p className="text-red-800">{session.disagreeReason}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 좌: 영상 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E2DF] shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E3E2DF]">
            <h3 className="text-sm font-bold text-[#192835]">환자 촬영 영상 (최종 검토용)</h3>
          </div>
          <VideoPreviewPlaceholder ticPoints={aiPrediction.ticPoints} duration={currentCase.currentVideo.duration} />
        </div>

        {/* 우: 최종 판단 */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#192835] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-[#192835]">최종 임상 판단 작성</h2>
              {session.overallAgreement === 'agree' && <span className="bg-[#5EBB8F] text-white text-[10px] font-bold px-2 py-0.5 rounded">AI 결과 확인됨</span>}
              {isPartial && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">AI 결과 부분 수정됨</span>}
              {isRejected && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">AI 결과 거부됨</span>}
            </div>
            <p className="text-xs text-[#898989] mb-6">AI 분석 결과와 임상의 검토 의견을 종합하여 최종 결론을 확정합니다.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">최종 1차 분류</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['틱', '틱 아님', '부정확 / 판단 보류'] as PrimaryTicClassification[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleUpdate('primaryClassification', option)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold ${
                        (session.finalDecision?.primaryClassification || session.clinicianAssessment.primaryClassification) === option
                          ? 'bg-[#192835] border-[#192835] text-white'
                          : 'bg-white border-[#E3E2DF] text-[#898989] hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {(session.finalDecision?.primaryClassification || session.clinicianAssessment.primaryClassification) === '틱' && (
                <div className="p-4 bg-[#F0F8F4] rounded-xl border border-[#C1E9D6]">
                  <label className="block text-xs font-bold text-[#2E664B] mb-2">최종 2차 분류</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['행동 틱', '음성 틱', '복합 틱'] as SecondaryTicClassification[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleUpdate('secondaryClassification', type)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold ${
                          (session.finalDecision?.secondaryClassification || session.clinicianAssessment.secondaryClassification) === type
                            ? 'bg-[#5EBB8F] border-[#5EBB8F] text-white'
                            : 'bg-white border-[#C1E9D6] text-[#2E664B] hover:bg-emerald-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">임상적 확신도</label>
                <div className="flex items-center space-x-2">
                  {(['높음', '중간', '낮음'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleUpdate('confidence', level)}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-colors ${
                        (session.finalDecision?.confidence || session.clinicianAssessment.confidence) === level
                          ? 'bg-[#192835] border-[#192835] text-white'
                          : 'bg-white border-[#E3E2DF] text-[#898989] hover:bg-gray-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">최종 판단 근거 (전체 분석 정보)</label>
                <textarea
                  className="w-full p-3 border border-[#E3E2DF] rounded-xl text-xs h-40 font-mono"
                  value={session.finalDecision?.evidence ?? session.clinicianAssessment.evidence}
                  onChange={(e) => handleUpdate('evidence', e.target.value)}
                />
              </div>

              {isRejected && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <label className="block text-xs font-bold text-red-700 mb-1">AI 결과 거부 사유</label>
                  <textarea
                    className="w-full p-2.5 border border-red-300 rounded-lg text-xs bg-white text-red-900"
                    placeholder="AI 결과를 거부한 임상적 사유를 입력하세요."
                    value={rejectReasonDraft}
                    onChange={(e) => handleRejectReasonChange(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">최종 검토 요약/메모</label>
                <textarea
                  className="w-full p-3 border border-[#E3E2DF] rounded-xl text-xs h-20"
                  value={session.finalDecision?.notes || ''}
                  onChange={(e) => handleUpdate('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E3E2DF] flex justify-end">
            <button onClick={handleComplete} className="px-6 py-3 bg-[#5EBB8F] text-white font-bold text-xs rounded-xl hover:bg-[#4FA47C] flex items-center shadow-sm">
              <CheckCircle2 size={16} className="mr-2" />
              {session.status === 'completed' ? '수정 사항 저장 및 완료' : '최종 판단 확정 및 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiFirstStep2Page;
