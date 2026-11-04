import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import CaseHeader from '../components/layout/CaseHeader';
import VideoPlayer from '../components/video/VideoPlayer';
import { PrimaryTicClassification, SecondaryTicClassification, ConfidenceLevel } from '../types/cdss';
import { CheckCircle2, ArrowLeft, RefreshCw, Video } from 'lucide-react';

const Phase3FinalPage: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { getCase, updateCase } = useCaseContext();
  const caseData = getCase(caseId || '');

  // 초기값 설정 (최종 판단 기록이 있으면 불러오고, 없으면 초기 판단 또는 AI 예측을 참고)
  const [form, setForm] = useState({
    primaryClassification: (caseData?.finalDecision?.primaryClassification || caseData?.initialAssessment?.primaryClassification || '틱') as PrimaryTicClassification,
    secondaryClassification: (caseData?.finalDecision?.secondaryClassification || caseData?.initialAssessment?.secondaryClassification || '행동 틱') as SecondaryTicClassification,
    confidence: (caseData?.finalDecision?.confidence || caseData?.initialAssessment?.confidence || '중간') as ConfidenceLevel,
    evidence: caseData?.finalDecision?.evidence || caseData?.initialAssessment?.evidence || '',
    notes: caseData?.finalDecision?.notes || caseData?.initialAssessment?.notes || '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isTic = form.primaryClassification === '틱';
    const secondary = isTic ? form.secondaryClassification : undefined;
    const legacyClassification = isTic ? form.secondaryClassification : '해당 없음';

    updateCase(caseId!, {
      status: 'completed',
      currentPhase: 3,
      finalDecision: {
        primaryClassification: form.primaryClassification,
        secondaryClassification: secondary,
        classification: legacyClassification as any,
        confidence: form.confidence,
        evidence: form.evidence,
        notes: form.notes,
        savedAt: new Date().toLocaleString('ko-KR')
      }
    });
    alert('최종 판단 기록이 성공적으로 저장되었습니다.');
    navigate(`/cases/${caseId}`);
  };

  if (!caseData) return <div className="p-10 text-center">Case를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CaseHeader phase={3} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Video & Summary Audit trail */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E3E2DF] shadow-sm">
            <h3 className="text-sm font-bold text-[#192835] mb-3">최종 확정 영상 검토</h3>
            <VideoPlayer
              ticPoints={caseData.currentVideo.ticPoints}
              duration={caseData.currentVideo.duration}
              showAI={true}
              youtubeId={caseData.currentVideo.youtubeId}
            />
          </div>

          {/* 이전 기록 요약 박스 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3E2DF] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#192835]">검토 이력 요약 (Audit Trail)</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#F9F9F9] rounded-xl border border-[#E3E2DF]">
                <span className="text-[#898989] font-bold block mb-1">임상의 초기 판단</span>
                <span className="font-bold text-[#192835]">
                  {caseData.initialAssessment ? `${caseData.initialAssessment.primaryClassification} (${caseData.initialAssessment.confidence})` : '미작성'}
                </span>
              </div>
              <div className="p-3 bg-[#F9F9F9] rounded-xl border border-[#E3E2DF]">
                <span className="text-[#898989] font-bold block mb-1">AI 분석 예측</span>
                <span className="font-bold text-[#5EBB8F]">
                  {caseData.aiPrediction.classification} ({caseData.aiPrediction.confidencePercent}%)
                </span>
              </div>
            </div>
            <div className="p-3 bg-[#E0EFE8] rounded-xl border border-[#C1E9D6] text-xs">
              <span className="text-[#2E664B] font-bold block mb-1">선택된 검토 작업 방식</span>
              <span className="font-semibold text-[#1F4734]">
                {caseData.reviewAction?.action === 'confirm' ? 'AI 결과 확인 및 수용' :
                 caseData.reviewAction?.action === 'edit' ? 'AI 결과 수정 및 반영' :
                 caseData.reviewAction?.action === 'reject' ? 'AI 결과 거부 및 임상의 판단 우선' : '직접 확정'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Final Decision Form */}
        <form
          onSubmit={handleSave}
          className="bg-white p-6 rounded-2xl border-2 border-[#192835] shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#192835]">3단계: 최종 판단 및 기록 확정</h2>
              <span className="text-[10px] font-bold bg-[#192835] text-white px-3 py-1 rounded-full">
                최종 단계
              </span>
            </div>
            <p className="text-xs text-[#898989] mb-6">
              초기 판단, AI 분석 결과, 검토 작업을 종합하여 최종 진단명을 확정하고 저장합니다.
            </p>

            <div className="space-y-6">
              {/* 1차 최종 분류 */}
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">
                  최종 1차 분류 (틱 여부)*
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['틱', '틱 아님', '부정확 / 판단 보류'] as PrimaryTicClassification[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setForm({ ...form, primaryClassification: option })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        form.primaryClassification === option
                          ? 'bg-[#192835] border-[#192835] text-white shadow-sm'
                          : 'bg-white border-[#E3E2DF] text-[#898989] hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2차 최종 분류 */}
              {form.primaryClassification === '틱' && (
                <div className="p-4 bg-[#F0F8F4] rounded-xl border border-[#C1E9D6]">
                  <label className="block text-xs font-bold text-[#2E664B] mb-2">
                    최종 2차 분류 (틱 세부 유형)*
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['행동 틱', '음성 틱', '복합 틱'] as SecondaryTicClassification[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, secondaryClassification: type })}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors ${
                          form.secondaryClassification === type
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

              {/* 최종 확신 정도 */}
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">최종 진단 확신 정도</label>
                <div className="flex space-x-6">
                  {(['높음', '중간', '낮음'] as ConfidenceLevel[]).map((level) => (
                    <label key={level} className="flex items-center space-x-2 text-xs font-medium text-[#192835] cursor-pointer">
                      <input
                        type="radio"
                        name="final_confidence"
                        value={level}
                        checked={form.confidence === level}
                        onChange={(e) => setForm({ ...form, confidence: e.target.value as ConfidenceLevel })}
                        className="accent-[#5EBB8F]"
                      />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 최종 증거 입력 */}
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">최종 진단 근거</label>
                <textarea
                  className="w-full p-3 border border-[#E3E2DF] rounded-xl text-xs focus:outline-none focus:border-[#5EBB8F] h-20"
                  value={form.evidence}
                  onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                />
              </div>

              {/* 최종 소견 메모 */}
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">최종 임상 소견 메모</label>
                <textarea
                  className="w-full p-3 border border-[#E3E2DF] rounded-xl text-xs focus:outline-none focus:border-[#5EBB8F] h-20"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#192835] text-white font-bold text-xs rounded-xl hover:bg-black transition-colors shadow-md flex items-center justify-center space-x-2"
            >
              <CheckCircle2 size={16} className="text-[#5EBB8F]" />
              <span>최종 판단 확정 및 저장</span>
            </button>

            {/* 단계 이동 제어 버튼들 */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#E3E2DF]">
              <button
                type="button"
                onClick={() => navigate(`/cases/${caseId}/phase1`)}
                className="py-2 text-[10px] font-bold text-[#898989] bg-[#F4F4F4] hover:bg-gray-200 rounded-lg"
              >
                1단계로 이동
              </button>
              <button
                type="button"
                onClick={() => navigate(`/cases/${caseId}/phase2`)}
                className="py-2 text-[10px] font-bold text-[#898989] bg-[#F4F4F4] hover:bg-gray-200 rounded-lg"
              >
                2단계로 이동
              </button>
              <button
                type="button"
                onClick={() => navigate(`/cases/${caseId}/compare`)}
                className="py-2 text-[10px] font-bold text-[#2E664B] bg-[#E0EFE8] hover:bg-[#C1E9D6] rounded-lg flex items-center justify-center space-x-1"
              >
                <Video size={10} />
                <span>이전 영상 비교</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/cases/${caseId}`)}
                className="py-2 text-[10px] font-bold text-white bg-[#5EBB8F] hover:bg-[#4FA47C] rounded-lg"
              >
                환자 대시보드
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Phase3FinalPage;
