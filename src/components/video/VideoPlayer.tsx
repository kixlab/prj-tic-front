import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Maximize, Target, Video } from 'lucide-react';
import { TicPoint } from '../../types/cdss';

interface VideoPlayerProps {
  ticPoints: TicPoint[];
  duration: number;
  showAI?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ ticPoints, duration, showAI = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activePoint, setActivePoint] = useState<TicPoint | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // 시뮬레이션: 재생 상태일 때 시간 흐름
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // 현재 시간에 맞는 틱 포인트 바운딩 박스 표시
  useEffect(() => {
    const point = ticPoints.find(
      (p) => currentTime >= p.seconds && currentTime < p.seconds + 3
    );
    setActivePoint(point || null);
  }, [currentTime, ticPoints]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseInt(e.target.value));
  };

  const jumpToPoint = (seconds: number) => {
    setCurrentTime(seconds);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* 메인 영상 컨테이너 */}
      <div
        ref={videoContainerRef}
        className="relative aspect-video bg-[#192835] rounded-xl overflow-hidden shadow-inner flex items-center justify-center group"
      >
        {/* 가상 영상 콘텐츠 (그라데이션과 텍스트로 대체) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#192835] to-[#2c4051] flex flex-col items-center justify-center text-white/20">
          <Video size={80} strokeWidth={1} />
          <span className="mt-4 text-sm font-medium tracking-widest uppercase">Patient Clinical Video</span>
        </div>

        {/* AI 탐지 바운딩 박스 (Mockup: face 99% 틱 ▾) */}
        {showAI && activePoint && activePoint.detectionBox && (
          <div
            className="absolute border-2 border-[#5EBB8F] rounded transition-all duration-300"
            style={{
              left: `${activePoint.detectionBox.x}%`,
              top: `${activePoint.detectionBox.y}%`,
              width: `${activePoint.detectionBox.width}%`,
              height: `${activePoint.detectionBox.height}%`,
            }}
          >
            <div className="absolute -top-6 left-0 bg-[#5EBB8F] text-white text-[10px] px-1.5 py-0.5 rounded-sm flex items-center space-x-1 whitespace-nowrap">
              <Target size={10} />
              <span className="font-bold">{activePoint.detectionBox.label}</span>
              <span>틱 ▾</span>
            </div>
          </div>
        )}

        {/* 재생 일시정지 중앙 오버레이 */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-5 rounded-full transition-all scale-110 group-hover:scale-125"
          >
            <Play fill="white" className="text-white ml-1" size={32} />
          </button>
        )}

        {/* 하단 컨트롤 바 */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity group-hover:opacity-100 opacity-90">
          {/* 타임라인 바 */}
          <div className="relative mb-3 flex items-center">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-[#5EBB8F]"
            />
            {/* 틱 포인트 마커 표시 */}
            {ticPoints.map((p) => (
              <div
                key={p.id}
                className={`absolute w-2 h-2 rounded-full cursor-pointer border border-white transform -translate-y-1/2 top-1/2 transition-all ${
                  currentTime === p.seconds ? 'bg-white scale-150' : 'bg-[#5EBB8F]'
                }`}
                style={{ left: `${(p.seconds / duration) * 100}%` }}
                title={p.label}
                onClick={() => jumpToPoint(p.seconds)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-[#5EBB8F]">
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button onClick={() => setCurrentTime(0)} className="hover:text-[#5EBB8F]">
                <RotateCcw size={18} />
              </button>
              <span className="text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Volume2 size={18} className="cursor-pointer hover:text-[#5EBB8F]" />
              <Maximize size={18} className="cursor-pointer hover:text-[#5EBB8F]" />
            </div>
          </div>
        </div>
      </div>

      {/* 틱 포인트 퀵 네비게이션 (Mockup: TIC Point 1:20 | TIC Point 4:00) */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-hide">
        {ticPoints.map((p) => (
          <button
            key={p.id}
            onClick={() => jumpToPoint(p.seconds)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
              currentTime >= p.seconds && currentTime < p.seconds + 5
                ? 'bg-[#192835] text-white border-[#192835]'
                : 'bg-white text-[#6A6A6A] border-[#E3E2DF] hover:border-[#5EBB8F]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;
