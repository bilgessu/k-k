import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Headphones, Gamepad2, Moon, Play } from "lucide-react";

export default function ChildMode() {
  const { childId } = useParams<{ childId: string }>();

  const { data: child } = useQuery<any>({
    queryKey: ['/api/children', childId],
    enabled: !!childId,
  });

  const { data: stories = [] } = useQuery<any[]>({
    queryKey: ['/api/stories'],
    enabled: !!childId,
  });

  const childName = child?.name || "Sevgili Çocuğum";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 bg-white rounded-full shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <div className="text-center">
            <h2 className="text-xl font-bold text-textDark">Merhaba {childName}! 👋</h2>
            <p className="text-sm text-gray-600">Bugün ne öğrenmek istiyorsun?</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <div className="px-6">
        {/* Character Avatar */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-6xl">🌟</span>
          </div>
          <p className="text-lg font-medium text-textDark">AtaMind arkadaşın hazır!</p>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <Button className="bg-white hover:bg-gray-50 child-friendly-button p-6 h-auto flex items-center justify-between group">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-4">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-textDark">Hikaye Dinle</h3>
                <p className="text-gray-500">Yeni bir maceraya başla</p>
              </div>
            </div>
            <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          </Button>

          <Button className="bg-white hover:bg-gray-50 child-friendly-button p-6 h-auto flex items-center justify-between group">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mr-4">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-textDark">Oyunlar</h3>
                <p className="text-gray-500">Eğlenceli aktiviteler</p>
              </div>
            </div>
            <Gamepad2 className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
          </Button>

          <Button className="bg-white hover:bg-gray-50 child-friendly-button p-6 h-auto flex items-center justify-between group">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-purple-400 rounded-2xl flex items-center justify-center mr-4">
                <Moon className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-textDark">Ninni</h3>
                <p className="text-gray-500">Annemin sesiyle</p>
              </div>
            </div>
            <span className="text-purple-400 text-xl group-hover:scale-110 transition-transform">💜</span>
          </Button>
        </div>

        {/* Recent Stories */}
        <div>
          <h3 className="text-lg font-bold text-textDark mb-4">Son Hikayeler</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {stories.length === 0 ? (
              <Card className="flex-shrink-0 w-40">
                <CardContent className="p-4 text-center">
                  <div className="w-full h-20 bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
                    <span className="text-gray-400">Henüz hikaye yok</span>
                  </div>
                  <p className="text-sm text-gray-500">İlk hikayenizi oluşturun</p>
                </CardContent>
              </Card>
            ) : (
              stories.slice(0, 5).map((story: any) => (
                <Card key={story.id} className="flex-shrink-0 w-40">
                  <CardContent className="p-4">
                    <Link href={`/story-player/${story.id}`}>
                      <img 
                        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
                        alt="Educational storytelling illustration" 
                        className="w-full h-20 object-cover rounded-xl mb-3"
                      />
                      <h4 className="font-semibold text-sm text-textDark mb-1 line-clamp-2">
                        {story.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((story.duration || 300) / 60)} dakika
                      </p>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
