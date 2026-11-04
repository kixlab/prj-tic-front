import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import CaseHeader from '../components/layout/CaseHeader';
import VideoPlayer from '../components/video/VideoPlayer';
import { TrendingUp, PlusCircle, AlertCircle, FileText, Check, Video } from 'lucide-react';
import { PriorVideoItem } from '../types/cdss';

const VideoComparePage: React.FC = () => {
  const { caseId } = useParams();
  const { getCase, updateCase } = useCaseContext();
  const caseData = getCase(caseId || '');

  // 이전 영상 목록 구성 (priorVideos 또는 단일 priorVideo 호환)
  const priorList: PriorVideoItem[] = caseData?.priorVideos || (caseData?.priorVideo ? [caseData.priorVideo] : []);
  const [selectedPriorId, setSelectedPriorId] = useState<string>(priorList[0]?.id || 'PV-1');

  // 현재 선택된 이전 영상
  const selectedPrior = priorList.find(p => p.id === selectedPriorId) || priorList[0];

  const [comparisonNotes, setComparisonNotes] = useState(caseData?.comparisonNotes || '');
  const [savedNote, setSavedNote] = useState(false);

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    updateCase(caseId!, { comparisonNotes });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  if (!caseData) return <div className="p-10 text-center">Case를 찾을 수 없습니다.</div>;

  if (priorList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <CaseHeader phase="compare" />
        <div className="bg-white rounded-2xl border border-[#E3E2DF] p-16 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Video size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#192835]">이전 방문 영상이 없습니다</h3>
          <p className="text-xs text-[#898989] max-w-md mx-auto">
            해당 환자는 이전 방문 기록이나 촬영된 과거 영상이 존재하지 않아 측면 비교를 수행할 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <CaseHeader phase="compare" />

      {/* 상단 컨트롤 및 복수 이전 영상 선택 바 */}
      <div className="bg-white border border-[#E3E2DF] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#192835] flex items-center">
            <TrendingUp size={16} className="mr-2 text-[#5EBB8F]" />
            이전 영상과 현재 영상 간의 증상 경과 비교
          </h3>
          <p className="text-xs text-[#898989] mt-0.5">
            각 비디오 플레이어는 완전히 독립적으로 재생 및 탐색할 수 있습니다.
          </p>
        </div>

        {priorList.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#898989]">비교할 이전 영상 선택:</span>
            <select
              className="border border-[#E3E2DF] rounded-xl px-3 py-1.5 text-xs font-bold text-[#192835] bg-gray-50 outline-none focus:border-[#5EBB8F]"
              value={selectedPriorId}
              onChange={(e) => setSelectedPriorId(e.target.value)}
            >
              {priorList.map(p => (
                <option key={p.id} value={p.id}>{p.visitDate} — {p.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 변화 요약 배지 */}
      {selectedPrior?.symptomChanges && selectedPrior.symptomChanges.length > 0 && (
        <div className="bg-[#F0F8F4] border border-[#C1E9D6] rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
          <span className="text-xs font-bold text-[#2E664B] whitespace-nowrap">주요 증상 변화:</span>
          <div className="flex flex-wrap gap-2">
            {selectedPrior.symptomChanges.map((change, i) => (
              <div key={i} className="flex items-center px-3 py-1 bg-white text-[#2E664B] text-xs font-bold rounded-lg border border-[#C1E9D6] shadow-2xs">
                {change.includes('New') ? <PlusCircle size={12} className="mr-1 text-blue-500" /> : <AlertCircle size={12} className="mr-1 text-orange-500" />}
                {change}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 듀얼 영상 비교 플레이어 영역 (완전 독립 제어) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 이전 영상 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3E2DF] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E2DF] pb-3">
            <div>
              <span className="text-xs font-bold text-[#898989] uppercase tracking-wider block">Prior Visit Video</span>
              <span className="text-sm font-bold text-[#192835]">{selectedPrior.title} ({selectedPrior.visitDate})</span>
            </div>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold">이전 기록</span>
          </div>

          <VideoPlayer
            ticPoints={selectedPrior.ticPoints}
            duration={selectedPrior.duration}
            showAI={true}
          />

          <div className="p-3.5 bg-[#F9F9F9] rounded-xl border border-[#E3E2DF]">
            <div className="text-xs font-bold text-[#192835] mb-1">관찰된 틱 포인트 ({selectedPrior.ticPoints.length}건)</div>
            <ul className="text-xs text-[#6A6A6A] space-y-1">
              {selectedPrior.ticPoints.map((tp, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="font-bold text-[#5EBB8F]">[{tp.timeStr}]</span>
                  <span>{tp.evidence.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 현재 영상 */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#5EBB8F] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E2DF] pb-3">
            <div>
              <span className="text-xs font-bold text-[#5EBB8F] uppercase tracking-wider block">Current Visit Video</span>
              <span className="text-sm font-bold text-[#192835]">{caseData.currentVideo.title} ({caseData.visitDate})</span>
            </div>
            <span className="px-2.5 py-1 bg-[#E0EFE8] text-[#2E664B] rounded-lg text-[10px] font-bold">현재 진료</span>
          </div>

          <VideoPlayer
            ticPoints={caseData.currentVideo.ticPoints}
            duration={caseData.currentVideo.duration}
            showAI={true}
            youtubeId={caseData.currentVideo.youtubeId}
          />

          <div className="p-3.5 bg-[#F9F9F9] rounded-xl border border-[#E3E2DF]">
            <div className="text-xs font-bold text-[#192835] mb-1">관찰된 틱 포인트 ({caseData.currentVideo.ticPoints.length}건)</div>
            <ul className="text-xs text-[#6A6A6A] space-y-1">
              {caseData.currentVideo.ticPoints.map((tp, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="font-bold text-[#5EBB8F]">[{tp.timeStr}]</span>
                  <span>{tp.evidence.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 비교 관찰 메모 작성 영역 */}
      <form onSubmit={handleSaveNotes} className="bg-white p-6 rounded-2xl border border-[#E3E2DF] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#192835] flex items-center">
            <FileText size={16} className="mr-2 text-[#5EBB8F]" />
            이전 영상 비교 관찰 메모 및 소견
          </h3>
          {savedNote && (
            <span className="text-xs font-bold text-[#5EBB8F] flex items-center animate-fadeIn">
              <Check size={14} className="mr-1" /> 메모가 저장되었습니다
            </span>
          )}
        </div>

        <textarea
          className="w-full p-4 border border-[#E3E2DF] rounded-xl text-xs focus:outline-none focus:border-[#5EBB8F] h-28"
          placeholder="이전 영상과 비교하여 증상의 빈도, 강도, 새로운 틱 발생 여부 등에 대한 임상의 소견을 기록하세요."
          value={comparisonNotes}
          onChange={(e) => setComparisonNotes(e.target.value)}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#5EBB8F] text-white text-xs font-bold rounded-xl hover:bg-[#4FA47C] transition-colors shadow-sm"
          >
            비교 메모 저장하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoComparePage;
