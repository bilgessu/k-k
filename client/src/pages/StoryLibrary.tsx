import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, Search, Play, Clock, Volume2, Heart } from "lucide-react";
import { useState } from "react";

export default function StoryLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [playingStory, setPlayingStory] = useState<string | null>(null);

  const { data: stories = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/stories'],
  });

  const categories = ["Tümü", "Saygı", "Paylaşım", "Sorumluluk", "Nezaket"];

  const filteredStories = stories.filter((story: any) => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tümü" || 
                           story.values?.includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 bg-gray-100 rounded-full mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-textDark">Hikaye Kütüphanesi</h2>
            <p className="text-sm text-gray-500">Değer temelli hikayeler</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Hikaye ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl pl-12 shadow-sm border-0 focus:ring-2 focus:ring-primary"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 mb-6">
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className="flex-shrink-0 rounded-full text-sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Story Grid */}
      <div className="px-6 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredStories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== "Tümü" 
                  ? "Aradığınız kriterlere uygun hikaye bulunamadı" 
                  : "Henüz hikaye bulunmuyor"}
              </p>
              <Link href="/voice-recording">
                <Button>İlk Hikayenizi Oluşturun</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredStories.map((story: any) => (
              <Card key={story.id} className="shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <img 
                      src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
                      alt="Children learning through storytelling" 
                      className="w-24 h-24 object-cover"
                    />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-textDark mb-1 line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {story.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{Math.ceil((story.duration || 300) / 60)} dakika</span>
                            <span className="mx-2">•</span>
                            <span>{story.ageRange || "3-8 yaş"}</span>
                          </div>
                          {story.values && story.values.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {story.values.slice(0, 2).map((value: string) => (
                                <span 
                                  key={value}
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                >
                                  {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2 ml-2">
                          <Link href={`/story-player/${story.id}`}>
                            <Button size="sm" className="w-10 h-10 rounded-full">
                              <Play className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-10 h-10 rounded-full border-pink-200 text-pink-500 hover:bg-pink-50"
                            onClick={() => {
                              setPlayingStory(story.id);
                              // Simulate mother's voice audio playback
                              setTimeout(() => setPlayingStory(null), 3000);
                            }}
                          >
                            {playingStory === story.id ? (
                              <Volume2 className="w-4 h-4 text-pink-600" />
                            ) : (
                              <Heart className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {playingStory === story.id && (
                        <div className="px-4 pb-4">
                          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-pink-700 font-medium">
                                🎵 Anne sesi ile çalıyor...
                              </span>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-150"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
