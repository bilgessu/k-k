import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
  const [selectedChildId, setSelectedChildId] = useState<string>("");

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

  const { data: children = [], isLoading: childrenLoading } = useQuery<any[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
  });

  const { data: aiInsights, isLoading: insightsLoading } = useQuery<AIInsight[]>({
    queryKey: ['/api/ai-insights', selectedChildId],
    enabled: isAuthenticated && !!selectedChildId,
  });

  // Auto-select first child if none selected
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const currentInsight = aiInsights?.[0];

  if (isLoading || childrenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            🧠 AI İçgörüler
          </h1>
        </div>

        {/* Child Selection */}
        {children.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Çocuk Seçimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedChildId === child.id ? "default" : "outline"}
                    onClick={() => setSelectedChildId(child.id)}
                    className="transition-all duration-200"
                  >
                    {child.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedChildId ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Çocuk Profili Bulunamadı</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                AI içgörülerini görüntülemek için önce bir çocuk profili oluşturun.
              </p>
              <Link href="/">
                <Button>Ana Sayfaya Dön</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {insightsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : currentInsight ? (
              <Tabs defaultValue="psychology" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="psychology">Psikolojik Profil</TabsTrigger>
                  <TabsTrigger value="safety">Güvenlik Metrikleri</TabsTrigger>
                  <TabsTrigger value="voice">Ses Analizi</TabsTrigger>
                  <TabsTrigger value="recommendations">Öneriler</TabsTrigger>
                </TabsList>

                <TabsContent value="psychology">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-600" />
                          Gelişim Aşaması
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary" className="text-sm">
                          {currentInsight.psychologicalProfile.developmentalStage}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          Öğrenme Stili
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="text-sm">
                          {currentInsight.psychologicalProfile.learningStyle}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-600" />
                          Duygusal Zeka
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Seviye</span>
                            <span className="text-sm font-semibold">
                              {currentInsight.psychologicalProfile.emotionalIntelligence}/100
                            </span>
                          </div>
                          <Progress value={currentInsight.psychologicalProfile.emotionalIntelligence} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-600" />
                          Kültürel Uyum
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Uyum</span>
                            <span className="text-sm font-semibold">
                              {currentInsight.psychologicalProfile.culturalAlignment}/100
                            </span>
                          </div>
                          <Progress value={currentInsight.psychologicalProfile.culturalAlignment} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="safety">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          İçerik Güvenliği
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Güvenlik Skoru</span>
                            <span className="text-sm font-semibold">
                              {currentInsight.safetyMetrics.contentSafety}/100
                            </span>
                          </div>
                          <Progress value={currentInsight.safetyMetrics.contentSafety} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          Yaş Uygunluğu
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Uygunluk</span>
                            <span className="text-sm font-semibold">
                              {currentInsight.safetyMetrics.ageAppropriateness}/100
                            </span>
                          </div>
                          <Progress value={currentInsight.safetyMetrics.ageAppropriateness} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-600" />
                          Kültürel Duyarlılık
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Duyarlılık</span>
                            <span className="text-sm font-semibold">
                              {currentInsight.safetyMetrics.culturalSensitivity}/100
                            </span>
                          </div>
                          <Progress value={currentInsight.safetyMetrics.culturalSensitivity} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="voice">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mic2 className="h-5 w-5 text-purple-600" />
                          Duygusal Ton
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="text-sm">
                          {currentInsight.voiceAnalysis.emotionalTone}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-orange-600" />
                          Enerji Seviyesi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Enerji</span>
                            <span className="text-sm font-semibold">
                              {currentInsight.voiceAnalysis.energyLevel}/100
                            </span>
                          </div>
                          <Progress value={currentInsight.voiceAnalysis.energyLevel} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-pink-600" />
                          Ebeveynlik Stili
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary" className="text-sm">
                          {currentInsight.voiceAnalysis.parentingStyle}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        AI Önerileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentInsight.recommendations.map((recommendation, index) => (
                          <div key={index} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Henüz Analiz Yok</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Bu çocuk için henüz AI analizi bulunmuyor. 
                    Birkaç aktivite tamamladıktan sonra detaylı içgörüler burada görünecek.
                  </p>
                  <Link href="/">
                    <Button>Aktivitelere Başla</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}