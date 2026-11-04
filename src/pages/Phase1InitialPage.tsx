import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import CaseHeader from '../components/layout/CaseHeader';
import VideoPlayer from '../components/video/VideoPlayer';
import { PrimaryTicClassification, SecondaryTicClassification, ConfidenceLevel } from '../types/cdss';

const Phase1InitialPage: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { getCase, updateCase } = useCaseContext();
  const caseData = getCase(caseId || '');

  const [form, setForm] = useState({
    primaryClassification: (caseData?.initialAssessment?.primaryClassification || '틱') as PrimaryTicClassification,
    secondaryClassification: (caseData?.initialAssessment?.secondaryClassification || '행동 틱') as SecondaryTicClassification,
    confidence: (caseData?.initialAssessment?.confidence || '중간') as ConfidenceLevel,
    evidence: caseData?.initialAssessment?.evidence || '',
    notes: caseData?.initialAssessment?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1차 분류가 '틱'이 아닌 경우 2차 분류는 undefined 처리
    const isTic = form.primaryClassification === '틱';
    const secondary = isTic ? form.secondaryClassification : undefined;
    const legacyClassification = isTic ? form.secondaryClassification : '해당 없음';

    updateCase(caseId!, {
      currentPhase: 2,
      status: 'in_review',
      initialAssessment: {
        primaryClassification: form.primaryClassification,
        secondaryClassification: secondary,
        classification: legacyClassification as any,
        confidence: form.confidence,
        evidence: form.evidence,
        notes: form.notes,
        submittedAt: new Date().toLocaleString('ko-KR')
      }
    });
    navigate(`/cases/${caseId}/phase2`);
  };

  if (!caseData) return <div className="p-10 text-center">Case를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CaseHeader phase={1} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Video Area */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E2DF] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E2DF] pb-3">
            <h3 className="text-sm font-bold text-[#192835]">환자 촬영 영상 (초기 판단용)</h3>
            <span className="text-xs text-[#898989] font-medium">AI 오버레이 비활성화 상태</span>
          </div>
          <VideoPlayer
            ticPoints={caseData.currentVideo.ticPoints}
            duration={caseData.currentVideo.duration}
            showAI={false}
            youtubeId={caseData.currentVideo.youtubeId}
          />
        </div>

        {/* Right: Initial Form with highlighted box */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border-2 border-[#5EBB8F] shadow-md flex flex-col justify-between relative overflow-hidden"
        >
          {/* 상단 현재 단계 안내 태그 */}
          <div className="absolute top-0 right-0 bg-[#5EBB8F] text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl">
            1단계 진행 중
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#192835] mb-1">임상의 초기 판단 작성</h2>
            <p className="text-xs text-[#898989] mb-6">
              AI 예측 결과를 확인하기 전, 의료진의 순수한 임상적 판단을 작성하여 영구 보존합니다.
            </p>

            <div className="space-y-6">
              {/* 1차 분류: 틱 여부 */}
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">
                  1차 분류: 틱 증상 여부*
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

              {/* 2차 분류: '틱'일 때만 조건부 표시 */}
              {form.primaryClassification === '틱' && (
                <div className="p-4 bg-[#F0F8F4] rounded-xl border border-[#C1E9D6] transition-all animate-fadeIn">
                  <label className="block text-xs font-bold text-[#2E664B] mb-2">
                    2차 분류: 틱 세부 유형*
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

              {/* 확신 정도 */}
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">임상적 확신 정도</label>
                <div className="flex space-x-6">
                  {(['높음', '중간', '낮음'] as ConfidenceLevel[]).map((level) => (
                    <label key={level} className="flex items-center space-x-2 text-xs font-medium text-[#192835] cursor-pointer">
                      <input
                        type="radio"
                        name="confidence"
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

              {/* 임상적 근거 */}
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">주요 판단 근거</label>
                <textarea
                  className="w-full p-3 border border-[#E3E2DF] rounded-xl text-xs focus:outline-none focus:border-[#5EBB8F] h-20"
                  placeholder="영상에서 관찰된 증거 및 근거를 입력하세요. (예: 코 끝 수축 관찰됨)"
                  value={form.evidence}
                  onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                />
              </div>

              {/* 소견 및 메모 */}
              <div>
                <label className="block text-xs font-bold text-[#192835] mb-2">추가 임상 메모</label>
                <textarea
                  className="w-full p-3 border border-[#E3E2DF] rounded-xl text-xs focus:outline-none focus:border-[#5EBB8F] h-20"
                  placeholder="환자 상태나 관찰 맥락에 대한 추가 메모를 적어주세요."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#E3E2DF] flex items-center justify-between">
            <button
              type="button"
              className="text-xs font-bold text-[#898989] hover:text-[#192835]"
              onClick={() => setForm({ primaryClassification: '틱', secondaryClassification: '행동 틱', confidence: '중간', evidence: '', notes: '' })}
            >
              초기화
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#5EBB8F] text-white font-bold text-xs rounded-xl hover:bg-[#4FA47C] transition-colors shadow-sm"
            >
              초기 판단 저장 및 2단계 이동
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Phase1InitialPage;
