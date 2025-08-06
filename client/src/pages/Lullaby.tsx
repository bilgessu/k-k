import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Moon, Play, Pause, Volume2, Heart } from "lucide-react";
import { useState } from "react";

export default function Lullaby() {
  const { childId } = useParams<{ childId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);

  const lullabies = [
    {
      id: 1,
      title: "Uyku Vakti Hikayesi",
      description: "Değerler eşliğinde huzurlu bir ninni",
      duration: "5 dk",
      icon: "🌙"
    },
    {
      id: 2,
      title: "Annemin Sesi",
      description: "Kaydettiğiniz değerlerle özel ninni",
      duration: "3 dk",
      icon: "💕"
    },
    {
      id: 3,
      title: "Doğa Sesleri",
      description: "Sakinleştirici doğa sesleri eşliğinde",
      duration: "10 dk",
      icon: "🍃"
    }
  ];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      {/* Header */}
      <header className="px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href={`/child-mode/${childId}`}>
            <Button variant="ghost" size="sm" className="w-10 h-10 bg-white rounded-full shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <div className="text-center">
            <h2 className="text-xl font-bold text-textDark">🌙 Ninni Zamanı</h2>
            <p className="text-sm text-gray-600">Huzurlu uykular</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <div className="px-6">
        {/* Character Avatar */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-6xl">🌙✨</span>
          </div>
          <p className="text-lg font-medium text-textDark">Hangi ninniyi dinlemek istiyorsun?</p>
        </div>

        {/* Currently Playing */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-textDark mb-2">Şimdi Çalıyor</h3>
            <p className="text-gray-600">Annemin Sesi - Değerler Ninnisi</p>
          </div>
          
          {/* Audio Controls */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Button variant="ghost" size="sm">
              <Volume2 className="w-5 h-5 text-gray-400" />
            </Button>
            <Button 
              onClick={togglePlay}
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <Heart className="w-5 h-5 text-red-400" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-1/3"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>1:30</span>
            <span>3:00</span>
          </div>
        </div>

        {/* Lullaby List */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-bold text-textDark">Ninni Listesi</h3>
          {lullabies.map((lullaby) => (
            <Card key={lullaby.id}>
              <CardContent className="p-4">
                <Button className="bg-white hover:bg-gray-50 child-friendly-button p-4 h-auto flex items-center justify-between group w-full">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-xl">{lullaby.icon}</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-md font-bold text-textDark">{lullaby.title}</h4>
                      <p className="text-gray-500 text-sm">{lullaby.description}</p>
                      <p className="text-xs text-purple-500 font-medium">{lullaby.duration}</p>
                    </div>
                  </div>
                  <Play className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Goodnight Message */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 text-center">
          <h4 className="text-lg font-bold text-textDark mb-2">İyi geceler! 🌟</h4>
          <p className="text-gray-600 text-sm">
            Annenin sevgi dolu sesiyle huzurlu uykular. Tatlı rüyalar!
          </p>
        </div>
      </div>
    </div>
  );
}