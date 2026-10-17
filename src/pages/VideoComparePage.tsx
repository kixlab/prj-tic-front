import React from 'react';
import { useParams } from 'react-router-dom';
import { useCaseContext } from '../context/CaseContext';
import CaseHeader from '../components/layout/CaseHeader';
import VideoPlayer from '../components/video/VideoPlayer';
import { TrendingUp, PlusCircle, AlertCircle } from 'lucide-react';

const VideoComparePage: React.FC = () => {
  const { caseId } = useParams();
  const { getCase } = useCaseContext();
  const caseData = getCase(caseId || '');

  if (!caseData || !caseData.priorVideo) return <div>Comparison data not available</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <CaseHeader phase="compare" />

      <div className="bg-white border border-[#E3E2DF] rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-[#192835] mb-4 flex items-center">
          <TrendingUp size={16} className="mr-2 text-[#5EBB8F]" />
          이전 영상과 현재 영상의 증상 변화
        </h3>
        <div className="flex flex-wrap gap-3">
          {caseData.priorVideo.symptomChanges.map((change, i) => (
            <div key={i} className="flex items-center px-3 py-1.5 bg-[#F0F8F4] text-[#2E664B] text-xs font-bold rounded-full border border-[#C1E9D6]">
              {change.includes('New') ? <PlusCircle size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
              {change}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 이전 영상 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#898989]">이전 영상 ({caseData.priorVideo.visitDate})</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#E3E2DF] shadow-sm">
            <VideoPlayer ticPoints={caseData.priorVideo.ticPoints} duration={caseData.priorVideo.duration} showAI={true} />
            <div className="mt-4 p-4 bg-[#F9F9F9] rounded-lg">
              <div className="text-xs font-bold text-[#192835] mb-2">{caseData.priorVideo.ticPoints[0]?.label}</div>
              <ul className="text-xs text-[#6A6A6A] space-y-1">
                {caseData.priorVideo.ticPoints[0]?.evidence.map((ev, i) => <li key={i}>• {ev}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 현재 영상 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#192835]">현재 영상 ({caseData.visitDate})</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#E3E2DF] shadow-sm">
            <VideoPlayer ticPoints={caseData.currentVideo.ticPoints} duration={caseData.currentVideo.duration} showAI={true} />
            <div className="mt-4 p-4 bg-[#F9F9F9] rounded-lg">
              <div className="text-xs font-bold text-[#192835] mb-2">{caseData.currentVideo.ticPoints[0]?.label}</div>
              <ul className="text-xs text-[#6A6A6A] space-y-1">
                {caseData.currentVideo.ticPoints[0]?.evidence.map((ev, i) => <li key={i}>• {ev}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoComparePage;
