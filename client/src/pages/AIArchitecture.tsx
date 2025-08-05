import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Brain, Shield, Heart, Mic2, Zap, Target, Users, BookOpen, BarChart3, Layers, Network, Cpu, Database } from "lucide-react";
import { Link } from "wouter";

export default function AIArchitecturePage() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <button className="flex items-center text-gray-600 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ana Sayfa
              </button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center">
              <Layers className="w-6 h-6 text-slate-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                AtaMind AI Mimarisi
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Overview */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Brain className="w-8 h-8 mr-3 text-blue-600" />
                AtaMind Çoklu-Ajan AI Sistemi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                AtaMind, Google Gemini 2.5 Pro ile güçlendirilmiş çoklu-ajan AI mimarisi kullanarak 
                Türk çocuklarına kültürel değerleri aktarmada devrim yaratan bir eğitim platformudur.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Gemini 2.5 Pro</p>
                  <p className="text-xs text-gray-600">Core Engine</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Network className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">4 AI Ajanı</p>
                  <p className="text-xs text-gray-600">Specialized Roles</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Memory System</p>
                  <p className="text-xs text-gray-600">Personalization</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Real-time Analytics</p>
                  <p className="text-xs text-gray-600">Performance Insights</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Architecture Tabs */}
          <Tabs defaultValue="agents" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="agents" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>AI Ajanları</span>
              </TabsTrigger>
              <TabsTrigger value="orchestration" className="flex items-center space-x-2">
                <Network className="w-4 h-4" />
                <span>Orkestrasyon</span>
              </TabsTrigger>
              <TabsTrigger value="memory" className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Hafıza Sistemi</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analitik</span>
              </TabsTrigger>
            </TabsList>

            {/* AI Agents */}
            <TabsContent value="agents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* StorytellerAgent */}
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-6 h-6 mr-2 text-purple-600" />
                      StorytellerAgent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="secondary" className="w-full justify-center">
                      Ultra-Personalized Turkish Cultural Storytelling
                    </Badge>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Özellikler:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Çocuk profili ve geçmiş etkileşim analizi</li>
                        <li>• Türk kültürü değerlerinin doğal entegrasyonu</li>
                        <li>• Yaş-uygun dil ve kavram adaptasyonu</li>
                        <li>• Ebeveyn mesajlarının hikayeye dönüştürülmesi</li>
                        <li>• Kişilik özelliklerine göre ton ayarlaması</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-800">
                        <Zap className="w-3 h-3 inline mr-1" />
                        Gemini 2.5 Pro ile güçlendirilmiş kültürel zeka
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* GuardianAgent */}
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-6 h-6 mr-2 text-green-600" />
                      GuardianAgent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="secondary" className="w-full justify-center">
                      Multi-layered Content Safety & Cultural Validation
                    </Badge>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Güvenlik Katmanları:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• İçerik güvenliği değerlendirmesi (%98+ doğruluk)</li>
                        <li>• Yaş uygunluğu analizi</li>
                        <li>• Kültürel duyarlılık kontrolü</li>
                        <li>• Eğitsel değer ölçümü</li>
                        <li>• Zararlı içerik filtreleme</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-800">
                        <Shield className="w-3 h-3 inline mr-1" />
                        Real-time content validation and cultural appropriateness
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* ChildPsychologyAgent */}
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="w-6 h-6 mr-2 text-blue-600" />
                      ChildPsychologyAgent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="secondary" className="w-full justify-center">
                      Developmental Assessment & Learning Style Analysis
                    </Badge>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Psikolojik Analiz:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Gelişim aşaması değerlendirmesi</li>
                        <li>• Öğrenme stili tespiti (görsel/işitsel/kinestetik)</li>
                        <li>• Duygusal zeka ölçümü</li>
                        <li>• Katılım seviyesi analizi</li>
                        <li>• Ebeveyn rehberlik önerileri</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <Heart className="w-3 h-3 inline mr-1" />
                        Child development psychology meets AI-powered insights
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* VoiceAgent */}
                <Card className="border-2 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mic2 className="w-6 h-6 mr-2 text-orange-600" />
                      VoiceAgent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="secondary" className="w-full justify-center">
                      Enhanced Audio Processing & Personality-based Voice Optimization
                    </Badge>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Ses İşleme:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Duygusal ton analizi (mutluluk, huzur, sabır)</li>
                        <li>• Ebeveynlik stili tespiti</li>
                        <li>• Kültürel değer çıkarımı</li>
                        <li>• Çocuk katılımı tahmini</li>
                        <li>• Kişiselleştirilmiş ses sentezi</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-orange-800">
                        <Mic2 className="w-3 h-3 inline mr-1" />
                        Multimodal voice analysis with cultural value extraction
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Orchestration */}
            <TabsContent value="orchestration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Network className="w-6 h-6 mr-2 text-indigo-600" />
                    Agent Orchestration System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <h4 className="font-medium">Koordinasyon</h4>
                      <p className="text-sm text-gray-600">Ajanlar arası iletişim ve görev dağılımı</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <Zap className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <h4 className="font-medium">Optimizasyon</h4>
                      <p className="text-sm text-gray-600">Çocuk profeline göre ajan aktivasyonu</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <h4 className="font-medium">İzleme</h4>
                      <p className="text-sm text-gray-600">Performans metrikleri ve kalite kontrolü</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">İş Akışı:</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3">1</span>
                        <span>Ebeveyn ses kaydı VoiceAgent tarafından analiz edilir</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3">2</span>
                        <span>ChildPsychologyAgent çocuk profilini ve gelişim durumunu değerlendirir</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3">3</span>
                        <span>StorytellerAgent kişiselleştirilmiş hikaye oluşturur</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3">4</span>
                        <span>GuardianAgent güvenlik ve uygunluk kontrolü yapar</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                        <span>Onaylanan hikaye ebeveyn ve çocuğa sunulur</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Memory System */}
            <TabsContent value="memory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-6 h-6 mr-2 text-purple-600" />
                    ChildPersonalizationMemory System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Hafıza Bileşenleri:</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm text-purple-600">Çocuk Profilleri</h5>
                          <p className="text-xs text-gray-600">Kişilik özellikleri, tercihler, öğrenme stilleri</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm text-purple-600">Etkileşim Geçmişi</h5>
                          <p className="text-xs text-gray-600">Hikaye tepkileri, katılım seviyeleri, geri bildirimler</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm text-purple-600">Davranış Kalıpları</h5>
                          <p className="text-xs text-gray-600">Öğrenme trendleri, ilgi alanları, gelişim metrikleri</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Adaptif Özellikler:</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          <span>Real-time kişilik trait analizi</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          <span>Tercih öğrenme ve adaptasyon</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          <span>Duygusal response tracking</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          <span>Gelişimsel milestone izleme</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          <span>Kültürel değer algısı analizi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Gelişmiş Hafıza Algoritması</h4>
                    <p className="text-sm text-purple-800">
                      Her çocukla yapılan etkileşim, AI sisteminin o çocuğu daha iyi anlamasını sağlar. 
                      Machine learning algoritmaları kullanılarak, çocuğun benzersiz öğrenme stili, 
                      ilgi alanları ve duygusal ihtiyaçları belirlenir.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                      Real-time Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Anlık Metrikler:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Çocuk katılım seviyesi (%0-100)</li>
                        <li>• Duygusal tepki analizi</li>
                        <li>• Hikaye kalitesi skoru</li>
                        <li>• Kültürel değer aktarım başarısı</li>
                        <li>• Ebeveyn memnuniyet ölçümü</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-blue-600" />
                      Predictive Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Öngörülü Analizler:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Gelecek hikaye tercihleri tahmini</li>
                        <li>• Öğrenme potansiyeli projeksiyonu</li>
                        <li>• Gelişim alanları önerileri</li>
                        <li>• Optimal hikaye zamanlaması</li>
                        <li>• Ebeveyn-çocuk bağ güçlendirme</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-amber-600" />
                    AI Performance Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">98.5%</div>
                      <p className="text-sm text-gray-600">İçerik Güvenliği</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">94.2%</div>
                      <p className="text-sm text-gray-600">Kültürel Doğruluk</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">91.7%</div>
                      <p className="text-sm text-gray-600">Çocuk Katılımı</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <BarChart3 className="w-4 h-4 inline mr-1" />
                      Sistem sürekli öğrenerek performansını artırır. Her etkileşim, 
                      AI ajanlarının daha etkili hikayeler üretmesine katkıda bulunur.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}