import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../../context/CaseContext';
import { useInterviewContext } from '../../context/InterviewContext';
import VideoPreviewPlaceholder from '../../components/video/VideoPreviewPlaceholder';
import { PrimaryTicClassification, SecondaryTicClassification } from '../../types/cdss';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const ClinicianFirstPhase3: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { getCase } = useCaseContext();
  const { getClinicianSession, saveClinicianSession, getAiPrediction } = useInterviewContext();

  const session = getClinicianSession(caseId!);
  const currentCase = getCase(caseId!);
  const aiPrediction = getAiPrediction(caseId!);

  const isReadonly = session.clinicianReview?.notes === 'AI 결과 확인';
  const isRejected = session.clinicianReview?.notes?.startsWith('AI 결과 거부');

  const [form, setForm] = useState({
    primaryClassification: session.finalDecision?.primaryClassification || session.initialAssessment.primaryClassification,
    secondaryClassification: session.finalDecision?.secondaryClassification || session.initialAssessment.secondaryClassification,
    confidence: session.finalDecision?.confidence || session.initialAssessment.confidence,
    evidence: session.finalDecision?.evidence || session.initialAssessment.evidence,
    notes: session.finalDecision?.notes || session.initialAssessment.notes,
    rejectReason: isRejected ? session.clinicianReview?.notes.replace('AI 결과 거부: ', '') : ''
  });

  const handleComplete = () => {
    saveClinicianSession({
      ...session,
      status: 'completed',
      finalDecision: {
        primaryClassification: form.primaryClassification,
        secondaryClassification: form.secondaryClassification,
        confidence: form.confidence,
        evidence: form.evidence,
        notes: isRejected ? `[거부 사유]: ${form.rejectReason}\n${form.notes}` : form.notes,
        savedAt: new Date().toLocaleString('ko-KR')
      }
    });
    alert('최종 판단이 완료되었습니다.');
    navigate(`/interview/cases/${caseId}/mode`);
  };

  if (!currentCase) return <div className="p-10 text-center">Case를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-[#E3E2DF] shadow-sm">
        <button onClick={() => navigate(`/interview/cases/${caseId}/clinician-first/step2`)} className="flex items-center text-xs font-bold text-[#6A6A6A] hover:text-[#192835]">
          <ArrowLeft size={16} className="mr-2" /> 2단계로 돌아가기
        </button>
        <span className="text-xs font-extrabold bg-[#192835] text-white px-3 py-1 rounded-full">
          Clinician-First • Step 3 (최종 판단)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#E3E2DF] shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E3E2DF]">
            <h3 className="text-sm font-bold text-[#192835]">환자 촬영 영상 (최종 검토용)</h3>
          </div>
          <VideoPreviewPlaceholder
            ticPoints={currentCase.currentVideo.ticPoints}
            duration={currentCase.currentVideo.duration}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-[#192835] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-[#192835]">최종 임상 판단 작성</h2>
              {isReadonly && <span className="bg-[#5EBB8F] text-white text-[10px] font-bold px-2 py-0.5 rounded">AI 결과 확인 (읽기 전용)</span>}
              {isRejected && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">AI 결과 거부됨</span>}
            </div>
            <p className="text-xs text-[#898989] mb-6">임상의의 초기 판단과 AI 분석 결과를 종합하여 최종 결론을 확정합니다.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">최종 1차 분류</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['틱', '틱 아님', '부정확 / 판단 보류'] as PrimaryTicClassification[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={isReadonly}
                      onClick={() => setForm({ ...form, primaryClassification: option })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold ${
                        form.primaryClassification === option ? 'bg-[#192835] text-white' : 'bg-white border-[#E3E2DF] text-[#898989]'
                      } ${isReadonly ? 'opacity-70 cursor-not-allowed' : ''}`}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {form.primaryClassification === '틱' && (
                <div className="p-4 bg-[#F0F8F4] rounded-xl border border-[#C1E9D6]">
                    <label className="block text-xs font-bold text-[#2E664B] mb-2">최종 2차 분류</label>
                    <div className="grid grid-cols-3 gap-2">
                    {(['행동 틱', '음성 틱', '복합 틱'] as SecondaryTicClassification[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          disabled={isReadonly}
                          onClick={() => setForm({ ...form, secondaryClassification: type })}
                          className={`py-2 px-3 rounded-lg border text-xs font-bold ${
                            form.secondaryClassification === type ? 'bg-[#5EBB8F] text-white' : 'bg-white border-[#C1E9D6] text-[#2E664B]'
                          } ${isReadonly ? 'opacity-70 cursor-not-allowed' : ''}`}>
                          {type}
                        </button>
                    ))}
                    </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">최종 판단 근거 (전체 분석 정보)</label>
                <textarea
                  className={`w-full p-3 border border-[#E3E2DF] rounded-xl text-xs h-40 ${isReadonly ? 'bg-gray-50 text-gray-700 font-mono' : ''}`}
                  value={form.evidence}
                  onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                  readOnly={isReadonly}
                />
              </div>

              {isRejected && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <label className="block text-xs font-bold text-red-700 mb-1">AI 결과 거부 사유</label>
                  <textarea
                    className="w-full p-2.5 border border-red-300 rounded-lg text-xs bg-white text-red-900"
                    placeholder="AI 결과를 거부한 임상적 사유를 입력하세요."
                    value={form.rejectReason}
                    onChange={(e) => setForm({ ...form, rejectReason: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">최종 검토 요약/메모</label>
                <textarea
                  className="w-full p-3 border border-[#E3E2DF] rounded-xl text-xs h-20"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E3E2DF] flex justify-end">
            <button onClick={handleComplete} className="px-6 py-3 bg-[#5EBB8F] text-white font-bold text-xs rounded-xl hover:bg-[#4FA47C] flex items-center shadow-sm">
              <CheckCircle2 size={16} className="mr-2" /> 최종 판단 확정 및 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicianFirstPhase3;
