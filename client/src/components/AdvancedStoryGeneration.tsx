import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Play, Pause, Brain, Shield, Heart, Sparkles, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdvancedStoryResult {
  story: {
    title: string;
    content: string;
    audioUrl: string;
    moralLesson: string;
  };
  agentInsights: {
    storytellerConfidence: number;
    psychologicalSuitability: string;
    safetyCleared: boolean;
    personalizationLevel: string;
  };
  validation: {
    safetyScore: number;
    ageAppropriate: number;
    culturalAlignment: number;
    approved: boolean;
    concerns: string[];
    strengths: string[];
  };
  psychologyAnalysis: {
    developmentalAssessment: string;
    learningStyle: string;
    recommendedThemes: string[];
    engagementTips: string[];
  };
  personalization: {
    level: string;
    traits: string[];
    preferences: string[];
  };
}

export function AdvancedStoryGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [storyResult, setStoryResult] = useState<AdvancedStoryResult | null>(null);
  const [formData, setFormData] = useState({
    childName: "",
    childAge: "5",
    parentMessage: "",
    culturalTheme: "Türk aile değerleri"
  });
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(timer);
      }, 60000); // Max 1 minute

    } catch (error) {
      toast({
        title: "Kayıt Hatası",
        description: "Mikrofon erişimi sağlanamadı",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const generateAdvancedStory = async () => {
    setIsGenerating(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('childName', formData.childName);
      formDataToSend.append('childAge', formData.childAge);
      formDataToSend.append('parentMessage', formData.parentMessage);
      formDataToSend.append('culturalTheme', formData.culturalTheme);
      
      if (audioBlob) {
        formDataToSend.append('voiceRecording', audioBlob, 'recording.wav');
      }

      const response = await fetch('/api/stories/generate-advanced', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Story generation failed');
      }

      const result = await response.json();
      setStoryResult(result);
      
      toast({
        title: "Çoklu-Ajan Hikaye Tamamlandı!",
        description: `${result.agentInsights.personalizationLevel === 'high' ? 'Yüksek' : 'Standart'} kişiselleştirme ile oluşturuldu`,
      });

    } catch (error) {
      toast({
        title: "Hikaye Oluşturulamadı",
        description: "Çoklu-ajan sistemi bir hata ile karşılaştı",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Çoklu-Ajan AI Hikaye Sistemi
          </CardTitle>
          <CardDescription>
            Tutor, Guardian ve Psychologist AI ajanları ile kişiselleştirilmiş Türk kültürü hikayeleri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="childName">Çocuğun Adı</Label>
                <Input
                  id="childName"
                  value={formData.childName}
                  onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
                  placeholder="Çocuğunuzun adı"
                />
              </div>
              
              <div>
                <Label htmlFor="childAge">Yaş</Label>
                <Select value={formData.childAge} onValueChange={(value) => setFormData(prev => ({ ...prev, childAge: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                      <SelectItem key={age} value={age.toString()}>{age} yaş</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="culturalTheme">Kültürel Tema</Label>
                <Select value={formData.culturalTheme} onValueChange={(value) => setFormData(prev => ({ ...prev, culturalTheme: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Türk aile değerleri">Türk Aile Değerleri</SelectItem>
                    <SelectItem value="Misafirperverlik">Misafirperverlik</SelectItem>
                    <SelectItem value="Saygı ve sevgi">Saygı ve Sevgi</SelectItem>
                    <SelectItem value="Paylaşım ve yardımlaşma">Paylaşım ve Yardımlaşma</SelectItem>
                    <SelectItem value="Dürüstlük">Dürüstlük</SelectItem>
                    <SelectItem value="Çalışkanlık">Çalışkanlık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Ebeveyn Mesajı (Ses veya Metin)</Label>
                <div className="flex gap-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                    className="flex-shrink-0"
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isRecording ? formatTime(recordingTime) : "Kayıt"}
                  </Button>
                  {audioBlob && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Ses kaydedildi
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="parentMessage">Veya Metin Mesajı</Label>
                <Textarea
                  id="parentMessage"
                  value={formData.parentMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentMessage: e.target.value }))}
                  placeholder="Çocuğunuza iletmek istediğiniz değer veya mesaj..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={generateAdvancedStory}
            disabled={isGenerating || (!formData.parentMessage && !audioBlob) || !formData.childName}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                AI Ajanları Çalışıyor...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Çoklu-Ajan Hikaye Oluştur
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {storyResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                {storyResult.story.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant={storyResult.validation.approved ? "default" : "destructive"}>
                  {storyResult.validation.approved ? "Guardian Onaylandı" : "Guardian Reddetti"}
                </Badge>
                <Badge variant="secondary">
                  Kişiselleştirme: {storyResult.personalization.level === 'high' ? 'Yüksek' : 'Standart'}
                </Badge>
                <Badge variant="outline">
                  Psikolog: {Math.round(storyResult.agentInsights.storytellerConfidence)}/10
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="story">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="story">Hikaye</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analizi</TabsTrigger>
                  <TabsTrigger value="safety">Güvenlik</TabsTrigger>
                  <TabsTrigger value="psychology">Psikoloji</TabsTrigger>
                </TabsList>

                <TabsContent value="story" className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{storyResult.story.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Ahlaki Ders:</span>
                    <span>{storyResult.story.moralLesson}</span>
                  </div>

                  <audio controls className="w-full">
                    <source src={storyResult.story.audioUrl} type="audio/mpeg" />
                  </audio>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          AI Ajan Performansı
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Storyteller Güveni</span>
                            <span className={getScoreColor(storyResult.agentInsights.storytellerConfidence)}>
                              {Math.round(storyResult.agentInsights.storytellerConfidence)}/10
                            </span>
                          </div>
                          <Progress value={storyResult.agentInsights.storytellerConfidence * 10} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <Badge variant="outline">
                            Kişiselleştirme: {storyResult.agentInsights.personalizationLevel}
                          </Badge>
                          {storyResult.agentInsights.safetyCleared && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Guardian Onayı ✓
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Kişiselleştirme Detayları</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {storyResult.personalization.traits.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Kişilik Özellikleri:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {storyResult.personalization.traits.map((trait, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {storyResult.personalization.preferences.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Tercihler:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {storyResult.personalization.preferences.map((pref, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {pref}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="safety" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Guardian Agent Güvenlik Raporu
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Güvenlik Skoru</div>
                          <div className={`text-2xl font-bold ${getScoreColor(storyResult.validation.safetyScore)}`}>
                            {storyResult.validation.safetyScore}/10
                          </div>
                          <Progress value={storyResult.validation.safetyScore * 10} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600">Yaş Uygunluğu</div>
                          <div className={`text-2xl font-bold ${getScoreColor(storyResult.validation.ageAppropriate)}`}>
                            {storyResult.validation.ageAppropriate}/10
                          </div>
                          <Progress value={storyResult.validation.ageAppropriate * 10} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-600">Kültürel Uyum</div>
                          <div className={`text-2xl font-bold ${getScoreColor(storyResult.validation.culturalAlignment)}`}>
                            {storyResult.validation.culturalAlignment}/10
                          </div>
                          <Progress value={storyResult.validation.culturalAlignment * 10} className="h-2" />
                        </div>
                      </div>

                      {storyResult.validation.concerns.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Endişeler:</strong> {storyResult.validation.concerns.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}

                      {storyResult.validation.strengths.length > 0 && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription>
                            <strong>Güçlü Yönler:</strong> {storyResult.validation.strengths.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="psychology" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        Çocuk Psikolojisi Agent Analizi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Gelişimsel Değerlendirme</h4>
                        <p className="text-gray-700">{storyResult.psychologyAnalysis.developmentalAssessment}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Öğrenme Stili</h4>
                        <p className="text-gray-700">{storyResult.psychologyAnalysis.learningStyle}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Önerilen Temalar</h4>
                        <div className="flex flex-wrap gap-2">
                          {storyResult.psychologyAnalysis.recommendedThemes.map((theme, idx) => (
                            <Badge key={idx} variant="secondary">{theme}</Badge>
                          ))}
                        </div>
                      </div>

                      {storyResult.psychologyAnalysis.engagementTips.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Etkileşim İpuçları</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {storyResult.psychologyAnalysis.engagementTips.map((tip, idx) => (
                              <li key={idx} className="text-gray-700">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}