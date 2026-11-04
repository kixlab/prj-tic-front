import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import CaseHeader from '../components/layout/CaseHeader';
import VideoPlayer from '../components/video/VideoPlayer';
import { Check, X, AlertCircle, Bot, User, CheckCircle2, ShieldAlert } from 'lucide-react';

const Phase2ReviewPage: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { getCase, updateCase } = useCaseContext();
  const caseData = getCase(caseId || '');
  const [showModal, setShowModal] = useState(false);

  if (!caseData) return <div className="p-10 text-center">Case를 찾을 수 없습니다.</div>;

  const handleReviewAction = (action: 'confirm' | 'edit' | 'reject') => {
    if (action === 'edit') {
      setShowModal(true);
    } else {
      updateCase(caseId!, {
        currentPhase: 3,
        reviewAction: { action, decidedAt: new Date().toLocaleString('ko-KR') }
      });
      navigate(`/cases/${caseId}/phase3`);
    }
  };

  const confirmEdit = () => {
    updateCase(caseId!, {
      currentPhase: 3,
      reviewAction: { action: 'edit', decidedAt: new Date().toLocaleString('ko-KR') }
    });
    navigate(`/cases/${caseId}/phase3`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CaseHeader phase={2} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Video & AI Evidence details */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E3E2DF] shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E3E2DF]">
              <h3 className="text-sm font-bold text-[#192835] flex items-center">
                <Bot size={16} className="mr-2 text-[#5EBB8F]" />
                환자 영상 및 AI 탐지 포인트
              </h3>
              <span className="text-[10px] font-bold bg-[#E0EFE8] text-[#2E664B] px-2.5 py-1 rounded-full">
                AI 신뢰도 {caseData.aiPrediction.confidencePercent}%
              </span>
            </div>
            <VideoPlayer
              ticPoints={caseData.currentVideo.ticPoints}
              duration={caseData.currentVideo.duration}
              showAI={true}
              youtubeId={caseData.currentVideo.youtubeId}
            />
          </div>

          {/* B. AI 분석 및 근거 확인 Box */}
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
                  <span className="text-sm font-extrabold text-[#5EBB8F]">{caseData.aiPrediction.classification}</span>
                </div>
                <div>
                  <span className="text-[#898989] font-bold block mb-1">안면 탐지 정확도</span>
                  <span className="text-sm font-extrabold text-[#192835]">{caseData.aiPrediction.faceDetectionPercent}%</span>
                </div>
              </div>

              <div>
                <span className="text-[#898989] font-bold block mb-1.5">AI 주요 탐지 증거</span>
                <ul className="space-y-1.5 pl-2">
                  {caseData.aiPrediction.summaryEvidence.map((ev, i) => (
                    <li key={i} className="flex items-center text-[#192835]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5EBB8F] mr-2"></span>
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>

              {caseData.aiPrediction.ticPoints.length > 0 && (
                <div>
                  <span className="text-[#898989] font-bold block mb-1.5">타임라인별 AI 감지 포인트</span>
                  <div className="space-y-2">
                    {caseData.aiPrediction.ticPoints.map(p => (
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

        {/* Right: A. Initial Assessment & C. Review Action */}
        <div className="space-y-6 flex flex-col justify-between">

          {/* A. 임상의 초기 판단 Box */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3E2DF] shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <User size={18} className="text-[#192835]" />
              <h3 className="text-sm font-bold text-[#192835]">A. 임상의 초기 판단 기록 (원본 보존)</h3>
            </div>

            {caseData.initialAssessment ? (
              <div className="space-y-3 text-xs bg-[#F9F9F9] p-4 rounded-xl border border-[#E3E2DF]">
                <div className="flex justify-between">
                  <span className="text-[#898989] font-bold">1차/2차 분류</span>
                  <span className="font-bold text-[#192835]">
                    {caseData.initialAssessment.primaryClassification} {caseData.initialAssessment.secondaryClassification ? `> ${caseData.initialAssessment.secondaryClassification}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#898989] font-bold">확신 정도</span>
                  <span className="font-bold text-[#192835]">{caseData.initialAssessment.confidence}</span>
                </div>
                <div>
                  <span className="text-[#898989] font-bold block mb-1">판단 근거</span>
                  <p className="text-[#192835] bg-white p-2.5 rounded-lg border border-[#E3E2DF]">{caseData.initialAssessment.evidence || '입력된 근거 없음'}</p>
                </div>
                <div>
                  <span className="text-[#898989] font-bold block mb-1">임상 메모</span>
                  <p className="text-[#192835] bg-white p-2.5 rounded-lg border border-[#E3E2DF]">{caseData.initialAssessment.notes || '입력된 메모 없음'}</p>
                </div>
                <div className="text-[10px] text-right text-[#898989]">제출일시: {caseData.initialAssessment.submittedAt}</div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-red-500 bg-red-50 rounded-xl">
                초기 판단 기록이 없습니다. Phase 1을 먼저 완료해주세요.
              </div>
            )}
          </div>

          {/* C. 검토 작업 Box */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#192835] shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 size={18} className="text-[#5EBB8F]" />
              <h3 className="text-sm font-bold text-[#192835]">C. 검토 작업 선택</h3>
            </div>
            <p className="text-xs text-[#898989] mb-6">
              AI 분석 결과를 검토한 후 아래 액션 중 하나를 선택하여 최종 단계로 진행하세요.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => handleReviewAction('edit')}
                className="p-4 bg-white border-2 border-[#5EBB8F] text-[#5EBB8F] text-xs font-bold rounded-xl hover:bg-[#F0F8F4] transition-all flex flex-col items-center justify-center space-y-1 shadow-sm"
              >
                <span>AI 결과 수정</span>
                <span className="text-[10px] font-normal text-[#898989]">내용 보완 및 편집</span>
              </button>

              <button
                onClick={() => handleReviewAction('confirm')}
                className="p-4 bg-[#5EBB8F] text-white text-xs font-bold rounded-xl hover:bg-[#4FA47C] transition-all flex flex-col items-center justify-center space-y-1 shadow-sm"
              >
                <span>AI 결과 확인</span>
                <span className="text-[10px] font-normal text-emerald-100">결과 그대로 수용</span>
              </button>

              <button
                onClick={() => handleReviewAction('reject')}
                className="p-4 bg-white border-2 border-red-400 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all flex flex-col items-center justify-center space-y-1 shadow-sm"
              >
                <span>AI 결과 거부</span>
                <span className="text-[10px] font-normal text-[#898989]">임상의 판단 우선</span>
              </button>
            </div>

            <div className="p-3 bg-[#F4F4F4] rounded-xl text-[11px] text-[#6A6A6A] leading-relaxed">
              * 각 선택에 따라 감사 로그(Audit Trail)에 기록이 남으며, 3단계(최종 판단)에서 반영됩니다.
            </div>
          </div>

        </div>
      </div>

      {/* 수정 확인 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-[#F0F8F4] text-[#5EBB8F] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#192835]">임상의 판단 수정 모드 진입</h3>
            <p className="text-xs text-[#6A6A6A] leading-relaxed">
              AI 분석 결과를 바탕으로 초기 판단을 수정할 수 있도록 편집 화면(3단계)으로 이동합니다.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 text-xs font-bold text-[#898989] bg-[#F4F4F4] rounded-xl hover:bg-[#EAEAEA]"
              >
                취소
              </button>
              <button
                onClick={confirmEdit}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#5EBB8F] rounded-xl hover:bg-[#4FA47C]"
              >
                확인 및 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Phase2ReviewPage;
