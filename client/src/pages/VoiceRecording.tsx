import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ArrowLeft, Mic, Square, Save, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function VoiceRecording() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveRecordingMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; audio: Blob }) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('audio', data.audio, 'recording.wav');
      
      return await apiRequest('POST', '/api/recordings', formData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Değer kaydınız başarıyla işlendi.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recordings'] });
      // Navigate back to home
      window.location.href = '/';
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Kayıt işlenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen bir başlık girin.",
        variant: "destructive",
      });
      return;
    }

    if (!audioBlob) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen önce ses kaydı yapın.",
        variant: "destructive",
      });
      return;
    }

    saveRecordingMutation.mutate({
      title,
      description,
      audio: audioBlob,
    });
  };

  return (
    <div className="min-h-screen gradient-accent">
      <div className="px-6 py-8 text-white">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-0 left-0 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold mb-2">Değer Paylaş</h2>
          <p className="text-orange-100">Çocuğunuza aktarmak istediğiniz değeri kaydedin</p>
        </div>

        {/* Form */}
        <div className="space-y-6 mb-8">
          <div>
            <Label htmlFor="title" className="text-white mb-2 block">
              Değer Başlığı
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Büyüklere Saygı"
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white mb-2 block">
              Açıklama (İsteğe bağlı)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu değer hakkında eklemek istediğiniz detaylar..."
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
              rows={3}
            />
          </div>
        </div>

        {/* Voice Recorder */}
        <VoiceRecorder onRecordingComplete={setAudioBlob} />

        {/* Action Buttons */}
        <div className="space-y-4 mt-8">
          <Button 
            onClick={handleSave}
            disabled={saveRecordingMutation.isPending || !audioBlob || !title.trim()}
            className="w-full bg-white text-accent hover:bg-white/90 font-semibold py-4 text-lg child-friendly-button"
          >
            <Save className="w-5 h-5 mr-2" />
            {saveRecordingMutation.isPending ? 'Kaydediliyor...' : 'Kaydı Kaydet'}
          </Button>
          
          <Link href="/">
            <Button 
              variant="outline" 
              className="w-full bg-white/20 text-white hover:bg-white/30 font-semibold py-4 text-lg border-white/30 child-friendly-button"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Geri Dön
            </Button>
          </Link>
        </div>

        {/* Tips */}
        <Card className="mt-8 bg-white/20 backdrop-blur-sm border-white/30">
          <CardContent className="p-4">
            <div className="flex items-start">
              <Lightbulb className="w-5 h-5 text-yellow-200 mr-2 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2 text-white">💡 İpuçları:</h3>
                <ul className="text-sm space-y-1 text-orange-100">
                  <li>• Net ve açık konuşun</li>
                  <li>• Örneklerle açıklayın</li>
                  <li>• Çocuğunuzun yaşını belirtin</li>
                  <li>• Kendi deneyimlerinizi paylaşın</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
