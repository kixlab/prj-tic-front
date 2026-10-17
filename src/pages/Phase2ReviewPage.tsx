import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import CaseHeader from '../components/layout/CaseHeader';
import VideoPlayer from '../components/video/VideoPlayer';
import { Check, X, AlertCircle } from 'lucide-react';

const Phase2ReviewPage: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { getCase, updateCase } = useCaseContext();
  const caseData = getCase(caseId || '');
  const [showModal, setShowModal] = useState(false);

  if (!caseData) return <div>Case not found</div>;

  const handleReviewAction = (action: 'confirm' | 'edit' | 'reject') => {
    if (action === 'edit') {
      setShowModal(true);
    } else {
      updateCase(caseId!, {
        currentPhase: 3,
        reviewAction: { action, decidedAt: new Date().toISOString() }
      });
      navigate(`/cases/${caseId}/phase3`);
    }
  };

  const confirmEdit = () => {
    updateCase(caseId!, {
      currentPhase: 3,
      reviewAction: { action: 'edit', decidedAt: new Date().toISOString() }
    });
    navigate(`/cases/${caseId}/phase3`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <CaseHeader phase={2} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-[#E3E2DF] shadow-sm">
            <VideoPlayer ticPoints={caseData.currentVideo.ticPoints} duration={caseData.currentVideo.duration} showAI={true} />
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E3E2DF] shadow-sm">
            <h3 className="text-sm font-bold text-[#192835] mb-4">AI 분석 및 근거 확인</h3>
            <div className="space-y-4">
              {caseData.aiPrediction.ticPoints.map(point => (
                <div key={point.id} className="p-3 bg-[#F4F4F4] rounded-lg">
                  <div className="text-xs font-bold text-[#5EBB8F] mb-2">{point.label}</div>
                  <ul className="text-xs text-[#6A6A6A] space-y-1">
                    {point.evidence.map((ev, i) => <li key={i}>• {ev}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E3E2DF] shadow-sm">
          <h2 className="text-lg font-bold text-[#192835] mb-2">임상의 검토</h2>
          <p className="text-xs text-[#898989] mb-6">초기 판단과 AI 예측을 나란히 비교하고 검토하세요.</p>

          <div className="overflow-hidden border border-[#E3E2DF] rounded-lg mb-8">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F4F4F4]">
                  <th className="p-3 text-left w-1/4 border-r border-[#E3E2DF]">분류 항목</th>
                  <th className="p-3 text-left w-3/8 border-r border-[#E3E2DF]">임상의 초기 판단</th>
                  <th className="p-3 text-left w-3/8">AI 예측</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E2DF]">
                <tr>
                  <td className="p-3 font-bold bg-[#F9F9F9] border-r">분류</td>
                  <td className="p-3 border-r">{caseData.initialAssessment?.classification}</td>
                  <td className="p-3 text-[#5EBB8F] font-bold">{caseData.aiPrediction.classification}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-[#F9F9F9] border-r">확신</td>
                  <td className="p-3 border-r">{caseData.initialAssessment?.confidence}</td>
                  <td className="p-3">{caseData.aiPrediction.confidencePercent}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-[#F9F9F9] border-r">증거</td>
                  <td className="p-3 border-r">{caseData.initialAssessment?.evidence}</td>
                  <td className="p-3"><ul className="space-y-1">{caseData.aiPrediction.summaryEvidence.map((e,i) => <li key={i}>• {e}</li>)}</ul></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-[#F9F9F9] border-r">메모</td>
                  <td className="p-3 border-r">{caseData.initialAssessment?.notes}</td>
                  <td className="p-3 text-[#898989] italic">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-[#E0EFE8] rounded-xl border border-[#C1E9D6]">
            <h3 className="text-sm font-bold text-[#1F4734] mb-4">검토 작업</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button onClick={() => handleReviewAction('edit')} className="p-3 bg-white border border-[#5EBB8F] text-[#5EBB8F] text-xs font-bold rounded-lg hover:bg-[#F0F8F4]">수정</button>
              <button onClick={() => handleReviewAction('confirm')} className="p-3 bg-[#5EBB8F] text-white text-xs font-bold rounded-lg hover:bg-[#4FA47C]">확인</button>
              <button onClick={() => handleReviewAction('reject')} className="p-3 bg-white border border-[#F14B2E] text-[#F14B2E] text-xs font-bold rounded-lg hover:bg-red-50">거부</button>
            </div>
            <div className="text-[10px] text-[#2E664B] leading-relaxed">
              확인 = 기존 판단 유지 | 수정 = 내용 업데이트 | 거부 = AI 판단 제거
            </div>
          </div>
        </div>
      </div>

      {/* 화면 5: 수정 확인 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#F0F8F4] text-[#5EBB8F] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#192835] mb-2">임상의 기록 수정</h3>
            <p className="text-sm text-[#6A6A6A] leading-relaxed mb-8">
              변경 사항을 반영할 수 있도록 임상의 판단 기록 창이 편집 가능한 상태로 바뀝니다.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-[#898989] bg-[#F4F4F4] rounded-xl hover:bg-[#EAEAEA]">닫기</button>
              <button onClick={confirmEdit} className="flex-1 py-3 text-sm font-bold text-white bg-[#5EBB8F] rounded-xl hover:bg-[#4FA47C]">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Phase2ReviewPage;
