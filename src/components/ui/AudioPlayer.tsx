import React, { useEffect, useState, useRef } from 'react';
import { PlayIcon, PauseIcon } from 'lucide-react';

export interface AudioPlayerProps {
  url: string;
  duration?: number;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function AudioPlayer({ 
  url, 
  duration, 
  variant = 'primary',
  className = ''
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * totalDuration;
    setCurrentTime(pct * totalDuration);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? currentTime / totalDuration * 100 : 0;

  const variantClasses = {
    primary: 'bg-chat-accent text-white',
    secondary: 'bg-chat-card text-chat-text dark:bg-chat-card dark:text-chat-text'
  };

  const btnClasses = {
    primary: 'bg-white/20 hover:bg-white/30',
    secondary: 'bg-chat-area hover:bg-chat-border dark:bg-chat-area dark:hover:bg-chat-border'
  };

  const trackBg = {
    primary: 'bg-white/25',
    secondary: 'bg-chat-border dark:bg-chat-border'
  };

  const trackFill = {
    primary: 'bg-white/70',
    secondary: 'bg-chat-accent'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[220px] max-w-[280px] ${variantClasses[variant]} ${className}`}>
      <audio ref={audioRef} src={url} preload="metadata" />

      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${btnClasses[variant]}`}
      >
        {isPlaying ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5 ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div
          className={`w-full h-2 rounded-full cursor-pointer ${trackBg[variant]}`}
          onClick={handleSeek}
        >
          <div
            className={`h-full rounded-full transition-all duration-100 ${trackFill[variant]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] opacity-70">
            {isPlaying || currentTime > 0
              ? formatTime(currentTime)
              : formatTime(totalDuration)}
          </span>
          <span className="text-[10px] opacity-70">
            {formatTime(totalDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}
