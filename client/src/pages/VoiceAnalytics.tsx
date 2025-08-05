import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Mic2, Heart, Volume2, BarChart3, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";

interface VoiceAnalytics {
  sessionId: string;
  timestamp: Date;
  emotionalAnalysis: {
    happiness: number;
    calm: number;
    excitement: number;
    love: number;
    patience: number;
  };
  voiceCharacteristics: {
    tone: string;
    pace: string;
    volume: string;
    clarity: number;
  };
  parentingInsights: {
    style: string;
    effectiveness: number;
    childEngagementPrediction: number;
  };
  culturalValueTransmission: {
    detected: string[];
    strength: number;
  };
}

export default function VoiceAnalyticsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<VoiceAnalytics[]>([]);
  const [selectedSession, setSelectedSession] = useState<VoiceAnalytics | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    // Simulate voice analytics data
    const mockAnalytics: VoiceAnalytics[] = [
      {
        sessionId: "session_1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        emotionalAnalysis: {
          happiness: 85,
          calm: 78,
          excitement: 65,
          love: 92,
          patience: 88
        },
        voiceCharacteristics: {
          tone: "Sevgi dolu",
          pace: "Yavaş ve açık",
          volume: "Uygun seviye",
          clarity: 94
        },
        parentingInsights: {
          style: "Demokratik",
          effectiveness: 89,
          childEngagementPrediction: 91
        },
        culturalValueTransmission: {
          detected: ["Saygı", "Sevgi", "Misafirperverlik", "Dürüstlük"],
          strength: 87
        }
      },
      {
        sessionId: "session_2",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        emotionalAnalysis: {
          happiness: 70,
          calm: 82,
          excitement: 55,
          love: 88,
          patience: 75
        },
        voiceCharacteristics: {
          tone: "Sakin ve güvencelik veren",
          pace: "Normal",
          volume: "Uygun seviye",
          clarity: 89
        },
        parentingInsights: {
          style: "Destekleyici",
          effectiveness: 83,
          childEngagementPrediction: 86
        },
        culturalValueTransmission: {
          detected: ["Yardımseverlik", "Sabır", "Aile bağları"],
          strength: 81
        }
      }
    ];
    setAnalytics(mockAnalytics);
    setSelectedSession(mockAnalytics[0]);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const getEmotionColor = (emotion: string, value: number) => {
    if (value >= 80) return "text-green-600 bg-green-100";
    if (value >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-6 py-4 border-b border-indigo-100">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <button className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ana Sayfa
              </button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center">
              <Mic2 className="w-6 h-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Ses Analizi ve Duygusal İçgörüler
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Session Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Ses Kayıt Oturumları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analytics.map((session, index) => (
                  <button
                    key={session.sessionId}
                    onClick={() => setSelectedSession(session)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedSession?.sessionId === session.sessionId
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">Oturum {index + 1}</h3>
                      <p className="text-sm text-gray-500">
                        {session.timestamp.toLocaleDateString('tr-TR')} {session.timestamp.toLocaleTimeString('tr-TR')}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {session.parentingInsights.style}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          %{session.parentingInsights.effectiveness} etkili
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedSession && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emotional Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-pink-600" />
                    Duygusal Analiz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(selectedSession.emotionalAnalysis).map(([emotion, value]) => (
                    <div key={emotion}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">
                          {emotion === 'happiness' ? 'Mutluluk' :
                           emotion === 'calm' ? 'Huzur' :
                           emotion === 'excitement' ? 'Heyecan' :
                           emotion === 'love' ? 'Sevgi' :
                           emotion === 'patience' ? 'Sabır' : emotion}
                        </span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${getEmotionColor(emotion, value)}`}>
                          %{value}
                        </span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                  
                  <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                    <p className="text-sm text-pink-800">
                      <Heart className="w-4 h-4 inline mr-1" />
                      Sesinizde güçlü sevgi ve sabır tonları tespit edildi. Bu durum çocuğunuzun hikaye deneyimini oldukça olumlu etkileyecektir.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Voice Characteristics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
                    Ses Karakteristikleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Ton</label>
                      <Badge variant="secondary" className="mt-1 w-full justify-center">
                        {selectedSession.voiceCharacteristics.tone}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Hız</label>
                      <Badge variant="outline" className="mt-1 w-full justify-center">
                        {selectedSession.voiceCharacteristics.pace}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Ses Seviyesi</label>
                      <Badge variant="secondary" className="mt-1 w-full justify-center">
                        {selectedSession.voiceCharacteristics.volume}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Netlik</label>
                      <Badge variant="outline" className="mt-1 w-full justify-center">
                        %{selectedSession.voiceCharacteristics.clarity}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parenting Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Ebeveynlik İçgörüleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ebeveynlik Stili</label>
                    <Badge variant="secondary" className="mt-1 w-full justify-center text-lg py-2">
                      {selectedSession.parentingInsights.style}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Etkililik Skoru</span>
                        <span className="font-medium text-green-600">%{selectedSession.parentingInsights.effectiveness}</span>
                      </div>
                      <Progress value={selectedSession.parentingInsights.effectiveness} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Çocuk Katılımı Tahmini</span>
                        <span className="font-medium text-blue-600">%{selectedSession.parentingInsights.childEngagementPrediction}</span>
                      </div>
                      <Progress value={selectedSession.parentingInsights.childEngagementPrediction} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cultural Value Transmission */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                    Kültürel Değer Aktarımı
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Aktarım Gücü</span>
                      <span className="font-medium text-purple-600">%{selectedSession.culturalValueTransmission.strength}</span>
                    </div>
                    <Progress value={selectedSession.culturalValueTransmission.strength} className="h-3" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Tespit Edilen Değerler</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSession.culturalValueTransmission.detected.map((value, index) => (
                        <Badge key={index} variant="outline" className="text-purple-700 border-purple-300">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <Zap className="w-4 h-4 inline mr-1" />
                      AI analizi, sesinizden güçlü Türk kültürü değerlerini tespit etti. Bu değerler hikayelerinizde güzel şekilde yansıtılacak.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}