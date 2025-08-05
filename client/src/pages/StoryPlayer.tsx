import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Heart, Play, Pause, SkipBack, SkipForward, RotateCcw, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import AudioPlayer from "@/components/AudioPlayer";

export default function StoryPlayer() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: story, isLoading } = useQuery<any>({
    queryKey: ['/api/stories', id],
    enabled: !!id,
  });

  const trackListeningMutation = useMutation({
    mutationFn: async (data: { childId: string; storyId: string; duration: number }) => {
      return await apiRequest('POST', '/api/listening-history', data);
    },
  });

  const handleListeningComplete = (duration: number) => {
    if (story?.childId) {
      trackListeningMutation.mutate({
        childId: story.childId,
        storyId: story.id,
        duration,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Hikaye bulunamadı</h2>
          <Link href="/story-library">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
              Kütüphaneye Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-primary text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/story-library">
            <Button variant="ghost" size="sm" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="text-lg font-semibold text-center flex-1 mx-4 line-clamp-2">
            {story.title}
          </h2>
          <Button variant="ghost" size="sm" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white">
            <Heart className="w-5 h-5" />
          </Button>
        </div>

        {/* Story Illustration */}
        <div className="text-center mb-8">
          <img 
            src="https://picsum.photos/400/300?random=2" 
            alt="Story illustration" 
            className="w-64 h-48 rounded-2xl mx-auto object-cover shadow-2xl"
          />
        </div>

        {/* Audio Player */}
        {story.audioUrl && (
          <AudioPlayer 
            audioUrl={story.audioUrl}
            onProgress={handleListeningComplete}
            className="mb-8"
          />
        )}

        {/* Story Info */}
        <Card className="bg-white/20 backdrop-blur-sm border-white/30 mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-white">Bu Hikayede:</h3>
            <div className="flex flex-wrap gap-2">
              {story.values?.map((value: string) => (
                <span 
                  key={value}
                  className="bg-white/30 px-3 py-1 rounded-full text-sm text-white"
                >
                  {value}
                </span>
              )) || (
                <span className="bg-white/30 px-3 py-1 rounded-full text-sm text-white">
                  Genel Değerler
                </span>
              )}
            </div>
            {story.ageRange && (
              <p className="text-sm text-white/80 mt-2">
                Yaş grubu: {story.ageRange}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional Options */}
        <div className="space-y-3">
          <Button className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-2xl flex items-center justify-center text-white border-white/30">
            <RotateCcw className="w-5 h-5 mr-2" />
            Hikayeyi Tekrarla
          </Button>
          <Button className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-2xl flex items-center justify-center text-white border-white/30">
            <MessageCircle className="w-5 h-5 mr-2" />
            Hikaye Hakkında Konuş
          </Button>
        </div>

        {/* Story Text (Expandable) */}
        <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <details className="group">
              <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                Hikaye Metni
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 text-sm text-white/90 leading-relaxed">
                {story.content}
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
