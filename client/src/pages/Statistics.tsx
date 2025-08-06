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

  const { data: statistics, isLoading: statsLoading } = useQuery<ChildStats[]>({
    queryKey: ['/api/statistics', selectedChildId],
    enabled: isAuthenticated && !!selectedChildId,
  });

  // Auto-select first child if none selected
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const currentStats = statistics?.[0];

  if (isLoading || childrenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            📊 İstatistikler
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
                İstatistikleri görüntülemek için önce bir çocuk profili oluşturun.
              </p>
              <Link href="/">
                <Button>Ana Sayfaya Dön</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : currentStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Weekly Usage */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Haftalık Kullanım
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {Math.round(currentStats.total_time_week)} dakika
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentStats.weekly_sessions} oturum
                    </div>
                  </CardContent>
                </Card>

                {/* Activities Completed */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Tamamlanan Aktiviteler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {currentStats.activities_completed_week}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Bu hafta
                    </div>
                  </CardContent>
                </Card>

                {/* Average Rating */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      Ortalama Değerlendirme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {currentStats.average_rating.toFixed(1)} ⭐
                    </div>
                    <Progress 
                      value={currentStats.average_rating * 20} 
                      className="w-full"
                    />
                  </CardContent>
                </Card>

                {/* Favorite Activity */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      En Sevilen Aktivite
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-sm">
                      {currentStats.favorite_activity_type || "Henüz veri yok"}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Engagement Trend */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      Katılım Trendi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge 
                      variant={
                        currentStats.engagement_trend === "increasing" ? "default" :
                        currentStats.engagement_trend === "decreasing" ? "destructive" :
                        "secondary"
                      }
                      className="text-sm"
                    >
                      {currentStats.engagement_trend === "increasing" ? "📈 Artıyor" :
                       currentStats.engagement_trend === "decreasing" ? "📉 Azalıyor" :
                       "📊 Kararlı"}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Weekly Overview */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                      Haftalık Özet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Günlük ortalama:</span>
                        <span className="text-sm font-semibold">
                          {Math.round(currentStats.total_time_week / 7)} dk
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Aktivite başına:</span>
                        <span className="text-sm font-semibold">
                          {currentStats.activities_completed_week > 0 
                            ? Math.round(currentStats.total_time_week / currentStats.activities_completed_week) 
                            : 0} dk
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Henüz Veri Yok</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Bu çocuk için henüz aktivite verisi bulunmuyor. 
                    Birkaç aktivite tamamladıktan sonra istatistikler burada görünecek.
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