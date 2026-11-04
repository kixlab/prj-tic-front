import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Maximize, Target, Video } from 'lucide-react';
import { TicPoint } from '../../types/cdss';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

interface VideoPlayerProps {
  ticPoints: TicPoint[];
  duration: number;
  showAI?: boolean;
  youtubeId?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  ticPoints,
  duration: initialDuration,
  showAI = false,
  youtubeId,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration);
  const [activePoint, setActivePoint] = useState<TicPoint | null>(null);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const elementIdRef = useRef<string>(`yt-player-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    setDuration(initialDuration);
  }, [initialDuration]);

  // YouTube IFrame Player API initialization
  useEffect(() => {
    if (!youtubeId) return;

    let isMounted = true;
    let timer: number;

    const initPlayer = () => {
      if (!isMounted || !window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }

      playerRef.current = new window.YT.Player(elementIdRef.current, {
        videoId: youtubeId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            const dur = event.target.getDuration();
            if (dur && dur > 0) {
              setDuration(Math.round(dur));
            }
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2 || event.data === 0) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!window.onYouTubeIframeAPIReady) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (existingCallback) existingCallback();
        initPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [youtubeId]);

  // Sync YouTube current time or simulation interval
  useEffect(() => {
    let interval: number;

    if (youtubeId) {
      interval = window.setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(Math.floor(time || 0));
        }
      }, 250);
    } else {
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
    }

    return () => clearInterval(interval);
  }, [youtubeId, isPlaying, duration]);

  // Track active TIC point bounding box
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

  const togglePlayPause = () => {
    if (youtubeId && playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseInt(e.target.value, 10);
    setCurrentTime(targetTime);
    if (youtubeId && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(targetTime, true);
    }
  };

  const jumpToPoint = (seconds: number) => {
    setCurrentTime(seconds);
    if (youtubeId && playerRef.current) {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, true);
      }
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* 메인 영상 컨테이너 */}
      <div
        ref={containerRef}
        className="relative aspect-video bg-[#192835] rounded-xl overflow-hidden shadow-inner flex items-center justify-center group"
      >
        {/* YouTube Player or Placeholder */}
        {youtubeId ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <div id={elementIdRef.current} className="w-full h-full" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#192835] to-[#2c4051] flex flex-col items-center justify-center text-white/20">
            <Video size={80} strokeWidth={1} />
            <span className="mt-4 text-sm font-medium tracking-widest uppercase">
              Patient Clinical Video
            </span>
          </div>
        )}

        {/* AI 탐지 바운딩 박스 오버레이 */}
        {showAI && activePoint && activePoint.detectionBox && (
          <div
            className="absolute border-2 border-[#5EBB8F] rounded transition-all duration-300 pointer-events-none z-10"
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

        {/* 재생/일시정지 중앙 오버레이 버튼 */}
        {!isPlaying && (
          <button
            onClick={togglePlayPause}
            className="z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-5 rounded-full transition-all scale-110 group-hover:scale-125"
          >
            <Play fill="white" className="text-white ml-1" size={32} />
          </button>
        )}

        {/* 하단 컨트롤 바 */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity group-hover:opacity-100 opacity-90 z-20">
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
              <button onClick={togglePlayPause} className="hover:text-[#5EBB8F]">
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button onClick={() => jumpToPoint(0)} className="hover:text-[#5EBB8F]">
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

      {/* 틱 포인트 퀵 네비게이션 버튼 */}
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
