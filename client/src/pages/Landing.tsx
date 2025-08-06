import { Button } from "@/components/ui/button";
import { Heart, Mic, Brain } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full colorful-pulse"></div>
        <div className="absolute top-32 right-16 w-12 h-12 rounded-full colorful-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-64 left-32 w-8 h-8 rounded-full colorful-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-32 w-16 h-16 rounded-full colorful-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-20 left-16 w-16 h-16 bg-accent rounded-full floating-pattern" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 px-6 pt-12 pb-8">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">AtaMind</h1>
          <p className="text-white/80 text-lg">AI Destekli Çocuk Eğitim Asistanı</p>
        </div>

        {/* Hero Image */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 rounded-2xl shadow-2xl p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">🎨📚✨</div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Renkli Öğrenme</h3>
              <p className="text-purple-700 text-lg font-medium">AI ile eğlenceli hikayeler</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4 mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center">
              <Mic className="w-8 h-8 text-accent mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Sesli Hikayeler</h3>
                <p className="text-white/80">Kişiselleştirilmiş değer aktarımı</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-secondary mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Kültürel Değerler</h3>
                <p className="text-white/80">Geleneksel öğretiler, modern yöntemlerle</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-accent mr-4" />
              <div>
                <h3 className="font-semibold text-lg">AI Destekli</h3>
                <p className="text-white/80">Yaşa uygun pedagojik içerik</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-6 text-lg child-friendly-button"
          >
            <Brain className="w-5 h-5 mr-2" />
            Başlayın
          </Button>
        </div>
      </div>
    </div>
  );
}
