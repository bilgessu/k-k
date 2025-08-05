import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  onProgress?: (currentTime: number) => void;
  className?: string;
}

export default function AudioPlayer({ audioUrl, onProgress, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      onProgress?.(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onProgress?.(audio.duration);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onProgress]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`text-center ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2 text-white">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Progress 
          value={progress} 
          className="h-2 bg-white/30"
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-8">
        <Button 
          onClick={() => skipTime(-10)}
          variant="ghost"
          size="sm"
          className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full text-white"
        >
          <SkipBack className="w-5 h-5" />
        </Button>
        
        <Button 
          onClick={togglePlayPause}
          className="w-16 h-16 bg-white hover:bg-white/90 rounded-full shadow-lg transform transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-primary" />
          ) : (
            <Play className="w-6 h-6 text-primary ml-1" />
          )}
        </Button>
        
        <Button 
          onClick={() => skipTime(10)}
          variant="ghost"
          size="sm"
          className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full text-white"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}