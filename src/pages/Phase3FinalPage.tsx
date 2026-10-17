import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import CaseHeader from '../components/layout/CaseHeader';
import VideoPlayer from '../components/video/VideoPlayer';

const Phase3FinalPage: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { getCase, updateCase } = useCaseContext();
  const caseData = getCase(caseId || '');

  // 초기값: 수정 모드면 초기판단 내용을 불러오고, 확인 모드면 AI 내용 등을 참고하여 구성 가능
  const [form, setForm] = useState({
    classification: caseData?.finalDecision?.classification || caseData?.initialAssessment?.classification || '행동 틱',
    confidence: caseData?.finalDecision?.confidence || caseData?.initialAssessment?.confidence || '중간',
    evidence: caseData?.finalDecision?.evidence || (caseData?.reviewAction?.action === 'edit' ? caseData?.initialAssessment?.evidence : '') || '',
    notes: caseData?.finalDecision?.notes || caseData?.initialAssessment?.notes || '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCase(caseId!, {
      status: 'completed',
      finalDecision: { ...form, savedAt: new Date().toISOString() }
    });
    alert('최종 판단이 성공적으로 저장되었습니다.');
    navigate('/cases');
  };

  if (!caseData) return <div>Case not found</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <CaseHeader phase={3} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl border border-[#E3E2DF] shadow-sm">
          <VideoPlayer ticPoints={caseData.currentVideo.ticPoints} duration={caseData.currentVideo.duration} showAI={true} />
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-[#E3E2DF] shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-[#192835] mb-2">최종 기록</h2>
          <p className="text-xs text-[#898989] mb-6">임상의 최종 판단 수정 및 기록.</p>

          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-xs font-bold text-[#898989] mb-2">최종 분류</label>
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
                      name="final_confidence"
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
                value={form.evidence}
                onChange={(e) => setForm({...form, evidence: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#898989] mb-2">메모</label>
              <textarea
                className="w-full p-3 border border-[#E3E2DF] rounded-lg text-sm h-24"
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="mt-8 w-full py-3 bg-[#192835] text-white font-bold text-sm rounded-lg hover:bg-black transition-colors">
            최종 저장하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default Phase3FinalPage;
