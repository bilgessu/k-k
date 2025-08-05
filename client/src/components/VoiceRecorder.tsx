import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Kayıt Başladı",
        description: "Konuşmaya başlayabilirsiniz",
      });
    } catch (error) {
      toast({
        title: "Mikrofon Hatası",
        description: "Mikrofon erişimi için izin gerekli",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast({
        title: "Kayıt Tamamlandı",
        description: "Ses kaydınız işlendi",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      {/* Recording Button */}
      <div 
        className={`w-48 h-48 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95 ${
          isRecording 
            ? 'bg-red-500 recording-pulse' 
            : 'bg-white hover:bg-gray-50'
        }`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <Square className="w-16 h-16 text-white" />
        ) : (
          <Mic className={`w-16 h-16 ${isRecording ? 'text-white' : 'text-accent'}`} />
        )}
      </div>

      {/* Recording Status */}
      <div className="mb-4">
        {isRecording ? (
          <div>
            <p className="text-xl font-semibold text-red-200 mb-2">Kaydediliyor...</p>
            <p className="text-orange-100">Konuşmayı bitirmek için tekrar dokunun</p>
          </div>
        ) : (
          <div>
            <p className="text-xl font-semibold">Kayda başlamak için dokunun</p>
            <p className="text-orange-100">Örnek: "Misafirlerimize nasıl davranacağımızı öğrenmek istiyorum"</p>
          </div>
        )}
      </div>

      {/* Recording Timer */}
      {isRecording && (
        <div className="flex items-center justify-center mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2 recording-pulse"></div>
          <span className="text-xl font-mono text-white">{formatTime(recordingTime)}</span>
        </div>
      )}

      {/* Recording Progress Bar */}
      {isRecording && (
        <div className="bg-white/20 rounded-full h-2 w-64 mx-auto">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-1000" 
            style={{ width: `${Math.min((recordingTime / 120) * 100, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}