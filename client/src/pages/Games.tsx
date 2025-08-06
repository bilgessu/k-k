import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Gamepad2, Star, Trophy, Zap, Sparkles } from "lucide-react";

export default function Games() {
  const { childId } = useParams<{ childId: string }>();

  const games = [
    {
      id: 1,
      title: "Değer Eşleştirme",
      description: "Karakterleri doğru değerlerle eşleştir",
      icon: "🧩",
      color: "bg-blue-500",
      difficulty: "Kolay"
    },
    {
      id: 2,
      title: "Hikaye Tamamlama",
      description: "Eksik kelimeleri bularak hikayeyi tamamla",
      icon: "📝",
      color: "bg-green-500",
      difficulty: "Orta"
    },
    {
      id: 3,
      title: "Karakter Oyunu",
      description: "Hangi karakter hangi değeri temsil ediyor?",
      icon: "🎭",
      color: "bg-purple-500",
      difficulty: "Kolay"
    },
    {
      id: 4,
      title: "Değer Yarışması",
      description: "En sevdiğin değerleri seç ve puanla",
      icon: "🏆",
      color: "bg-yellow-500",
      difficulty: "Kolay"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href={`/child-mode/${childId}`}>
            <Button variant="ghost" size="sm" className="w-10 h-10 bg-white rounded-full shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <div className="text-center">
            <h2 className="text-xl font-bold text-textDark">🎮 Eğitici Oyunlar</h2>
            <p className="text-sm text-gray-600">Oynayarak öğren!</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <div className="px-6">
        {/* Character Avatar */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-4xl">🎯</span>
          </div>
          <p className="text-lg font-medium text-textDark">Hangi oyunu oynamak istiyorsun?</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {games.map((game) => (
            <Card key={game.id} className="overflow-hidden">
              <CardContent className="p-0">
                <Button className="bg-white hover:bg-gray-50 child-friendly-button p-6 h-auto flex items-center justify-between group w-full">
                  <div className="flex items-center">
                    <div className={`w-16 h-16 ${game.color} rounded-2xl flex items-center justify-center mr-4`}>
                      <span className="text-2xl">{game.icon}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-textDark">{game.title}</h3>
                      <p className="text-gray-500 text-sm">{game.description}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          {game.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Gamepad2 className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Play Results */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-textDark mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Bugünkü Başarıların
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-500">12</p>
              <p className="text-xs text-gray-500">Puan</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">3</p>
              <p className="text-xs text-gray-500">Oyun</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-500">5</p>
              <p className="text-xs text-gray-500">Değer</p>
            </div>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 text-center">
          <h4 className="text-lg font-bold text-textDark mb-2">Harika gidiyorsun! 🌟</h4>
          <p className="text-gray-600 text-sm">
            Her oyun oynayışında yeni değerler öğreniyorsun. Devam et!
          </p>
        </div>
      </div>
    </div>
  );
}