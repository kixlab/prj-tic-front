// VIDEO INTEGRATION POINT
// 협업자가 서버 영상을 연결할 때 이 컴포넌트 내부(아래 return 블록)를 실제 플레이어로 교체하세요.
// 바깥 aspect-video 컨테이너 및 하단 틱 포인트 배지 영역의 크기를 유지해야
// AI-first / Clinician-first 화면 레이아웃이 깨지지 않습니다.
// 사용처: AiFirstStep1Page, AiFirstStep2Page, ClinicianFirstPhase1, ClinicianFirstPhase2, ClinicianFirstPhase3
import React from 'react';
import { Video, Clock } from 'lucide-react';
import { TicPoint } from '../../types/cdss';

interface VideoPreviewPlaceholderProps {
  ticPoints: TicPoint[];
  duration?: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const VideoPreviewPlaceholder: React.FC<VideoPreviewPlaceholderProps> = ({
  ticPoints,
  duration,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      {/* 영상 영역 — 서버 영상 연결 전까지 표시되는 placeholder */}
      <div className="relative aspect-video bg-[#192835] rounded-xl overflow-hidden shadow-inner flex items-center justify-center group border-2 border-dashed border-white/20">
        <div className="flex flex-col items-center justify-center text-white/40 px-6 text-center">
          <Video size={64} strokeWidth={1} />
          <span className="mt-4 text-sm font-bold tracking-wide text-white/70">
            서버 영상 연결 대기 중
          </span>
          <span className="mt-1 text-[11px] text-white/40">
            협업자가 서버의 실제 환자 영상을 이 영역에 연결할 예정입니다.
          </span>
          {typeof duration === 'number' && (
            <span className="mt-3 text-[11px] font-mono text-white/30">
              예상 길이: {formatTime(duration)}
            </span>
          )}
        </div>
      </div>

      {/* 탐지 이벤트 타임스탬프 — 비인터랙티브 배지 (영상 연결 전까지는 탐색 불가) */}
      {ticPoints.length > 0 && (
        <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-hide">
          {ticPoints.map((p) => (
            <span
              key={p.id}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border bg-white text-[#898989] border-[#E3E2DF] flex items-center space-x-1.5"
            >
              <Clock size={12} />
              <span>{p.timeStr}</span>
              <span className="text-[#6A6A6A]">{p.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoPreviewPlaceholder;
