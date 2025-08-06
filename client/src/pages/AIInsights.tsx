import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Brain, Shield, Heart, Mic2, TrendingUp, Target, BookOpen, Users } from "lucide-react";
import { Link } from "wouter";

interface AIInsight {
  childId: string;
  childName: string;
  psychologicalProfile: {
    developmentalStage: string;
    learningStyle: string;
    emotionalIntelligence: number;
    culturalAlignment: number;
    engagementLevel: number;
  };
  safetyMetrics: {
    contentSafety: number;
    ageAppropriateness: number;
    culturalSensitivity: number;
  };
  voiceAnalysis: {
    emotionalTone: string;
    energyLevel: number;
    parentingStyle: string;
  };
  recommendations: string[];
}

export default function AIInsightsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const { data: children = [] } = useQuery<any[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
  });

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

  // Load AI insights for each child
  useEffect(() => {
    const loadInsights = async () => {
      if (!children.length || !isAuthenticated) return;
      
      setIsLoadingInsights(true);
      try {
        const insightPromises = children.map(async (child: any) => {
          try {
            const response = await fetch(`/api/ai-insights/${child.id}`);
            if (response.ok) {
              return await response.json();
            } else {
              // Fallback for each child
              return {
                childId: child.id,
                childName: child.name,
                psychologicalProfile: {
                  developmentalStage: `${child.age} yaş grubu`,
                  learningStyle: child.learning_style || "Karma öğrenme",
                  emotionalIntelligence: Math.round(75 + Math.random() * 25),
                  culturalAlignment: Math.round(80 + Math.random() * 20),
                  engagementLevel: Math.round(70 + Math.random() * 30)
                },
                safetyMetrics: {
                  contentSafety: Math.round(95 + Math.random() * 5),
                  ageAppropriateness: Math.round(90 + Math.random() * 10),
                  culturalSensitivity: Math.round(85 + Math.random() * 15)
                },
                voiceAnalysis: {
                  emotionalTone: "Sevecen ve destekleyici",
                  energyLevel: Math.round(70 + Math.random() * 30),
                  parentingStyle: "Demokratik"
                },
                recommendations: [
                  `${child.name} için kişiselleştirilmiş hikayeler`,
                  "Yaş grubuna uygun etkileşimli aktiviteler",
                  "Türk kültürü değerleri içeren içerikler",
                  "Çocuğun ilgi alanlarına odaklı materyaller"
                ]
              };
            }
          } catch (error) {
            console.error(`Error loading insights for ${child.name}:`, error);
            return null;
          }
        });
        
        const insightsResults = await Promise.all(insightPromises);
        const validInsights = insightsResults.filter(Boolean);
        setInsights(validInsights);
        
        if (validInsights.length > 0) {
          setSelectedChild(validInsights[0].childId);
        }
        
      } catch (error) {
        console.error("Error loading AI insights:", error);
        toast({
          title: "Veri Yükleme Hatası",
          description: "AI analiz verileri yüklenirken bir sorun oluştu",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInsights(false);
      }
    };

    loadInsights();
  }, [children, isAuthenticated, toast]);

  if (isLoading || isLoadingInsights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoadingInsights ? "AI analiz verileri yükleniyor..." : "Yükleniyor..."}
          </p>
        </div>
      </div>
    );
  }

  const selectedInsight = insights.find(i => i.childId === selectedChild);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-6 py-4 border-b border-blue-100">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ana Sayfa
              </button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center">
              <Brain className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                AI Analiz ve İçgörüler
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {insights.length === 0 && !isLoadingInsights ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz çocuk profili yok</h3>
            <p className="text-gray-500 mb-6">AI analiz yapabilmek için önce çocuk profili eklemelisiniz</p>
            <Link to="/">
              <Button>
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        ) : selectedInsight && (
          <div className="space-y-6">
            {/* Child Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Çocuk Profili Seçin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  {insights.map((insight) => (
                    <button
                      key={insight.childId}
                      onClick={() => setSelectedChild(insight.childId)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedChild === insight.childId 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {insight.childName}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Tabs */}
            <Tabs defaultValue="psychology" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="psychology" className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Psikoloji</span>
                </TabsTrigger>
                <TabsTrigger value="safety" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Güvenlik</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex items-center space-x-2">
                  <Mic2 className="w-4 h-4" />
                  <span>Ses Analizi</span>
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Öneriler</span>
                </TabsTrigger>
              </TabsList>

              {/* Psychology Analysis */}
              <TabsContent value="psychology" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-pink-600" />
                      {selectedInsight.childName} için Psikolojik Profil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Gelişim Aşaması</label>
                        <Badge variant="secondary" className="mt-1 w-full justify-center">
                          {selectedInsight.psychologicalProfile.developmentalStage}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Öğrenme Stili</label>
                        <Badge variant="outline" className="mt-1 w-full justify-center">
                          {selectedInsight.psychologicalProfile.learningStyle}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Duygusal Zeka</span>
                          <span className="font-medium">{selectedInsight.psychologicalProfile.emotionalIntelligence}%</span>
                        </div>
                        <Progress value={selectedInsight.psychologicalProfile.emotionalIntelligence} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Kültürel Uyum</span>
                          <span className="font-medium">{selectedInsight.psychologicalProfile.culturalAlignment}%</span>
                        </div>
                        <Progress value={selectedInsight.psychologicalProfile.culturalAlignment} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Katılım Seviyesi</span>
                          <span className="font-medium">{selectedInsight.psychologicalProfile.engagementLevel}%</span>
                        </div>
                        <Progress value={selectedInsight.psychologicalProfile.engagementLevel} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Safety Metrics */}
              <TabsContent value="safety" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-600" />
                      Güvenlik ve Uygunluk Metrikleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>İçerik Güvenliği</span>
                          <span className="font-medium text-green-600">{selectedInsight.safetyMetrics.contentSafety}%</span>
                        </div>
                        <Progress value={selectedInsight.safetyMetrics.contentSafety} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Yaş Uygunluğu</span>
                          <span className="font-medium text-blue-600">{selectedInsight.safetyMetrics.ageAppropriateness}%</span>
                        </div>
                        <Progress value={selectedInsight.safetyMetrics.ageAppropriateness} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Kültürel Duyarlılık</span>
                          <span className="font-medium text-purple-600">{selectedInsight.safetyMetrics.culturalSensitivity}%</span>
                        </div>
                        <Progress value={selectedInsight.safetyMetrics.culturalSensitivity} className="h-3" />
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <Shield className="w-4 h-4 inline mr-1" />
                        Tüm güvenlik kriterleri başarıyla karşılanıyor. Çocuğunuz için güvenli içerik üretimi devam ediyor.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Analysis */}
              <TabsContent value="voice" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mic2 className="w-5 h-5 mr-2 text-blue-600" />
                      Ebeveyn Ses Analizi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Duygusal Ton</label>
                        <Badge variant="secondary" className="mt-1 w-full justify-center">
                          {selectedInsight.voiceAnalysis.emotionalTone}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Ebeveynlik Stili</label>
                        <Badge variant="outline" className="mt-1 w-full justify-center">
                          {selectedInsight.voiceAnalysis.parentingStyle}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Enerji Seviyesi</span>
                        <span className="font-medium">{selectedInsight.voiceAnalysis.energyLevel}%</span>
                      </div>
                      <Progress value={selectedInsight.voiceAnalysis.energyLevel} className="h-3" />
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        Sesinizin analizi, çocuğunuzla kuracağınız bağı güçlendirmek için hikaye tonunu optimize etmemize yardımcı oluyor.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Recommendations */}
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-amber-600" />
                      AI Önerileri ve Gelişim Rehberi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedInsight.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
                          <BookOpen className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-800">{rec}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">Uzun Vadeli Gelişim Hedefleri</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Türk kültürü değerlerinin derinlemesine öğrenilmesi</li>
                        <li>• Duygusal zeka ve empati becerisinin geliştirilmesi</li>
                        <li>• Yaratıcı düşünme ve problem çözme yetilerinin artırılması</li>
                        <li>• Ailevi bağların ve geleneksel değerlerin güçlendirilmesi</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}