import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Settings, Clock, Star, Mic, Book, BarChart3, Home, User, Brain, Plus } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import ChildProfileForm from "@/components/ChildProfileForm";
import StoryGenerationDialog from "@/components/StoryGenerationDialog";

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
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

  const { data: children = [] } = useQuery<any[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
  });

  const { data: recentActivities = [] } = useQuery<any[]>({
    queryKey: ['/api/recent-activities'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="w-10 h-10 mr-3">
              <AvatarImage src={(user as any)?.profileImageUrl} />
              <AvatarFallback className="bg-primary text-white">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-textDark">
                {(user as any)?.firstName || (user as any)?.email?.split('@')[0] || 'Hoşgeldiniz'}
              </h2>
              <p className="text-sm text-gray-500">Ebeveyn Paneli</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bu Hafta</p>
                  <p className="text-2xl font-bold text-primary">45 dk</p>
                </div>
                <Clock className="w-5 h-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Öğrenilen</p>
                  <p className="text-2xl font-bold text-secondary">12 değer</p>
                </div>
                <Star className="w-5 h-5 text-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Child Profiles */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-textDark">Çocuk Profilleri</h3>
            <ChildProfileForm 
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Ekle
                </Button>
              }
            />
          </div>
          
          {children.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Henüz çocuk profili eklenmemiş</p>
                <ChildProfileForm 
                  trigger={
                    <Button className="mt-3" size="sm">
                      İlk Profili Oluştur
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {children.map((child: any) => (
                <Card key={child.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="w-12 h-12 mr-4">
                          <AvatarImage src={child.profileImageUrl} />
                          <AvatarFallback>
                            {child.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-textDark">
                            {child.name} ({child.age} yaş)
                          </h4>
                          <p className="text-sm text-gray-500">Son aktivite: 2 saat önce</p>
                        </div>
                      </div>
                      <Link href={`/child-mode/${child.id}`}>
                        <Button size="sm" variant="ghost">
                          <span className="sr-only">Profili aç</span>
                          →
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Bu haftaki ilerleme</span>
                        <span className="text-primary font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Advanced AI Features Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-textDark mb-4">Gelişmiş AI Özellikleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Multi-Agent Story System */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mr-3">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-textDark">Çoklu-Ajan AI</h4>
                      <p className="text-xs text-gray-600">Tutor, Guardian & Psychologist</p>
                    </div>
                  </div>
                  <Link href="/multi-agent-story">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      Dene
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-textDark">AI İçgörüleri</h4>
                      <p className="text-xs text-gray-600">Psikolojik analiz ve öneriler</p>
                    </div>
                  </div>
                  <Link href="/ai-insights">
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      Gör
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Voice Analytics */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-textDark">Ses Analizi</h4>
                      <p className="text-xs text-gray-600">Duygusal ton ve etkililik</p>
                    </div>
                  </div>
                  <Link href="/voice-analytics">
                    <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      Analiz
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Story Generation */}
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mr-3">
                      <Book className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-textDark">Hızlı Hikaye</h4>
                      <p className="text-xs text-gray-600">Geleneksel hikaye üretimi</p>
                    </div>
                  </div>
                  <StoryGenerationDialog 
                    trigger={
                      <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                        Oluştur
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Architecture Documentation */}
          <div className="mt-4">
            <Card className="border border-slate-300 bg-gradient-to-r from-slate-50 to-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-gray-600 rounded-full flex items-center justify-center mr-3">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-textDark">AI Mimarisi</h4>
                      <p className="text-xs text-gray-600">Teknik detaylar ve sistem yapısı</p>
                    </div>
                  </div>
                  <Link href="/ai-architecture">
                    <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                      İncele
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-textDark mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/voice-recording">
              <Button className="gradient-accent text-white child-friendly-button w-full h-20 flex-col">
                <Mic className="w-8 h-8 mb-2" />
                <span className="font-medium">Değer Kaydet</span>
              </Button>
            </Link>
            <Link href="/story-library">
              <Button className="gradient-secondary text-white child-friendly-button w-full h-20 flex-col">
                <Book className="w-8 h-8 mb-2" />
                <span className="font-medium">Hikaye Kütüphanesi</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="pb-24">
          <h3 className="text-lg font-semibold text-textDark mb-4">Son Aktiviteler</h3>
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <Book className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-textDark">Yeni hikaye oluşturuldu</p>
                    <p className="text-sm text-gray-500">2 saat önce</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <Mic className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-textDark">Yeni değer kaydettiniz</p>
                    <p className="text-sm text-gray-500">1 gün önce</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-around">
          <Button variant="ghost" className="flex flex-col items-center text-primary">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Ana Sayfa</span>
          </Button>
          <Link href="/story-library">
            <Button variant="ghost" className="flex flex-col items-center text-gray-400">
              <Book className="w-5 h-5 mb-1" />
              <span className="text-xs">Hikayeler</span>
            </Button>
          </Link>
          <Link href="/voice-recording">
            <Button variant="ghost" className="flex flex-col items-center text-gray-400">
              <Mic className="w-5 h-5 mb-1" />
              <span className="text-xs">Kayıt</span>
            </Button>
          </Link>
          <Button variant="ghost" className="flex flex-col items-center text-gray-400">
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs">İstatistik</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
