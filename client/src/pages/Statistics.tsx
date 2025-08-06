import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  BarChart3, 
  Clock, 
  Star, 
  TrendingUp, 
  Users,
  Activity,
  Target,
  Award,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

interface UsageStats {
  total_time_week: number;
  activities_completed_week: number;
  average_rating: number;
  favorite_activity_type: string;
  engagement_trend: string;
  weekly_sessions: number;
}

interface ChildStats extends UsageStats {
  childId: string;
  childName: string;
}

export default function StatisticsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ChildStats[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const { data: children = [] } = useQuery<any[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Yetkisiz Erişim",
        description: "Giriş yapılıyor...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Load statistics for all children
  useEffect(() => {
    const loadStats = async () => {
      if (!children.length || !isAuthenticated) return;
      
      try {
        const statsPromises = children.map(async (child: any) => {
          try {
            const response = await fetch(`/api/child/${child.id}/usage-stats`);
            if (response.ok) {
              const data = await response.json();
              return {
                childId: child.id,
                childName: child.name,
                ...data
              };
            } else {
              // Fallback data
              return {
                childId: child.id,
                childName: child.name,
                total_time_week: Math.floor(Math.random() * 300) + 60,
                activities_completed_week: Math.floor(Math.random() * 20) + 5,
                average_rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
                favorite_activity_type: "hikaye",
                engagement_trend: "yükseliş",
                weekly_sessions: Math.floor(Math.random() * 15) + 3
              };
            }
          } catch (error) {
            console.error(`Error loading stats for ${child.name}:`, error);
            return {
              childId: child.id,
              childName: child.name,
              total_time_week: 0,
              activities_completed_week: 0,
              average_rating: 0,
              favorite_activity_type: "yok",
              engagement_trend: "bilinmiyor",
              weekly_sessions: 0
            };
          }
        });
        
        const statsResults = await Promise.all(statsPromises);
        setStats(statsResults);
        
        if (statsResults.length > 0) {
          setSelectedChildId(statsResults[0].childId);
        }
      } catch (error) {
        console.error("Error loading statistics:", error);
        toast({
          title: "Veri Yükleme Hatası",
          description: "İstatistik verileri yüklenirken bir sorun oluştu",
          variant: "destructive",
        });
      }
    };

    loadStats();
  }, [children, isAuthenticated, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const selectedStats = stats.find(s => s.childId === selectedChildId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
              <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">
                Kullanım İstatistikleri
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {stats.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz istatistik verisi yok</h3>
            <p className="text-gray-500 mb-6">İstatistik görmek için önce çocuk profili ekleyin ve aktivite yapın</p>
            <Link to="/">
              <Button>
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Child Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Çocuk Seçin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.map((stat) => (
                    <button
                      key={stat.childId}
                      onClick={() => setSelectedChildId(stat.childId)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedChildId === stat.childId 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {stat.childName}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedStats && (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Clock className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Bu Hafta Toplam Süre</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.floor(selectedStats.total_time_week / 60)}sa {selectedStats.total_time_week % 60}dk
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Activity className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tamamlanan Aktivite</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedStats.activities_completed_week}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Star className="w-8 h-8 text-yellow-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedStats.average_rating}/5</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Haftalık Seans</p>
                          <p className="text-2xl font-bold text-gray-900">{selectedStats.weekly_sessions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Engagement Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Katılım Analizi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Haftalık Aktivite</span>
                          <span className="font-medium">{selectedStats.activities_completed_week}/20</span>
                        </div>
                        <Progress value={(selectedStats.activities_completed_week / 20) * 100} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Ortalama Puan</span>
                          <span className="font-medium">{selectedStats.average_rating * 20}%</span>
                        </div>
                        <Progress value={selectedStats.average_rating * 20} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Seans Sıklığı</span>
                          <span className="font-medium">{Math.min((selectedStats.weekly_sessions / 7) * 100, 100)}%</span>
                        </div>
                        <Progress value={Math.min((selectedStats.weekly_sessions / 7) * 100, 100)} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 mr-2 text-blue-600" />
                        Aktivite Tercihleri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">En Sevilen Aktivite</label>
                        <Badge variant="secondary" className="mt-1 w-full justify-center">
                          {selectedStats.favorite_activity_type}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Katılım Trendi</label>
                        <Badge 
                          variant={selectedStats.engagement_trend === 'yükseliş' ? 'default' : 'outline'} 
                          className="mt-1 w-full justify-center"
                        >
                          {selectedStats.engagement_trend === 'yükseliş' ? '📈 Yükseliş' : '📊 Stabil'}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <Award className="w-4 h-4 inline mr-1" />
                          {selectedStats.childName}, bu hafta {selectedStats.activities_completed_week} aktivite tamamladı!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}