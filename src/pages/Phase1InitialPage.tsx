import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import CaseHeader from '../components/layout/CaseHeader';
import VideoPlayer from '../components/video/VideoPlayer';

const Phase1InitialPage: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { getCase, updateCase } = useCaseContext();
  const caseData = getCase(caseId || '');

  const [form, setForm] = useState({
    classification: caseData?.initialAssessment?.classification || '행동 틱',
    confidence: caseData?.initialAssessment?.confidence || '중간',
    evidence: caseData?.initialAssessment?.evidence || '',
    notes: caseData?.initialAssessment?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCase(caseId!, {
      currentPhase: 2,
      initialAssessment: { ...form, submittedAt: new Date().toISOString() }
    });
    navigate(`/cases/${caseId}/phase2`);
  };

  if (!caseData) return <div>Case not found</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <CaseHeader phase={1} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Video Area */}
        <div className="bg-white p-4 rounded-xl border border-[#E3E2DF] shadow-sm">
          <VideoPlayer ticPoints={caseData.currentVideo.ticPoints} duration={caseData.currentVideo.duration} showAI={false} />
        </div>

        {/* Right: Initial Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-[#E3E2DF] shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-bold text-[#192835] mb-2">임상의 초기 판단</h2>
          <p className="text-xs text-[#898989] mb-6">AI 예측 결과가 공개되기 전에 임상적 판단을 내리세요.</p>

          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-xs font-bold text-[#898989] mb-2">초기 분류</label>
              <select
                className="w-full p-2.5 border border-[#E3E2DF] rounded-lg text-sm"
                value={form.classification}
                onChange={(e) => setForm({...form, classification: e.target.value as any})}
              >
                <option>행동 틱</option>
                <option>음성 틱</option>
                <option>복합 틱</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#898989] mb-2">확신 정도</label>
              <div className="flex space-x-4">
                {['높음', '중간', '낮음'].map((level) => (
                  <label key={level} className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="confidence"
                      value={level}
                      checked={form.confidence === level}
                      onChange={(e) => setForm({...form, confidence: e.target.value as any})}
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#898989] mb-2">증거</label>
              <textarea
                className="w-full p-3 border border-[#E3E2DF] rounded-lg text-sm h-24"
                placeholder="영상에 나타나는 현상을 입력해주세요."
                value={form.evidence}
                onChange={(e) => setForm({...form, evidence: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#898989] mb-2">메모</label>
              <textarea
                className="w-full p-3 border border-[#E3E2DF] rounded-lg text-sm h-24"
                placeholder="간단한 임상적 관찰 내용 추가 (운동 양상, 맥락 등)"
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between border-t border-[#E3E2DF] pt-6">
            <button type="button" className="text-xs font-bold text-[#898989] hover:text-[#192835]" onClick={() => setForm({classification:'행동 틱', confidence:'중간', evidence:'', notes:''})}>전체 지우기</button>
            <button type="submit" className="px-6 py-2 bg-[#5EBB8F] text-white font-bold text-xs rounded-lg hover:bg-[#4FA47C]">초기 판단 제출하기</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Phase1InitialPage;
