import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StoryGenerationDialogProps {
  trigger?: React.ReactNode;
}

interface StoryFormData {
  childId: string;
  parentValue: string;
  culturalTheme: string;
}

export default function StoryGenerationDialog({ trigger }: StoryGenerationDialogProps) {
  const [open, setOpen] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: children = [] } = useQuery<any[]>({
    queryKey: ['/api/children'],
  });

  const form = useForm<StoryFormData>({
    defaultValues: {
      childId: "",
      parentValue: "",
      culturalTheme: "geleneksel değerler",
    },
  });

  const generateStoryMutation = useMutation({
    mutationFn: async (data: StoryFormData) => {
      const child = children.find((c) => c.id === data.childId);
      if (!child) throw new Error("Çocuk profili bulunamadı");

      return await apiRequest('POST', '/api/stories/generate', {
        childId: data.childId,
        childName: child.name,
        childAge: child.age,
        parentValue: data.parentValue,
        culturalTheme: data.culturalTheme,
      });
    },
    onSuccess: (story) => {
      toast({
        title: "Hikaye Oluşturuldu! 🎉",
        description: "Gemini AI ile özel Türk kültürü hikayeniz hazır.",
      });
      setGeneratedStory(story);
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Hikaye oluşturulurken bir sorun oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StoryFormData) => {
    generateStoryMutation.mutate(data);
  };

  const culturalThemes = [
    "geleneksel değerler",
    "misafirperverlik",
    "aile değerleri", 
    "saygı ve sevgi",
    "yardımseverlik",
    "dürüstlük",
    "sabır ve azim",
    "Türk tarihi kahramanları"
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Wand2 className="w-4 h-4 mr-2" />
            AI Hikaye Oluştur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
            Gemini AI ile Türk Kültürü Hikayesi
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Çocuğunuz için özel hikaye oluşturmak üzere Google Gemini 2.5 Pro kullanıyoruz
          </p>
        </DialogHeader>

        {!generatedStory ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="childId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hangi çocuğunuz için hikaye?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Çocuk seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {children.map((child: any) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name} ({child.age} yaş)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="culturalTheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kültürel Tema</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {culturalThemes.map((theme) => (
                          <SelectItem key={theme} value={theme}>
                            {theme}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Çocuğunuza iletmek istediğiniz değer/mesaj</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Örn: Misafirlerimize nasıl saygı göstereceğimizi öğrenmesini istiyorum..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={generateStoryMutation.isPending}
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={generateStoryMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {generateStoryMutation.isPending ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Gemini AI Çalışıyor...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Hikaye Oluştur
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <Badge className="bg-green-100 text-green-800 mb-4">
                ✨ Gemini AI ile Oluşturuldu
              </Badge>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{generatedStory.title}</h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                  Hikaye
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {generatedStory.content.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {generatedStory.audioUrl && (
              <Card>
                <CardContent className="p-4">
                  <audio 
                    controls 
                    src={generatedStory.audioUrl}
                    className="w-full"
                  >
                    Ses oynatıcı desteklenmiyor.
                  </audio>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setGeneratedStory(null);
                  form.reset();
                }}
              >
                Yeni Hikaye Oluştur
              </Button>
              <Button 
                onClick={() => setOpen(false)}
                className="bg-primary hover:bg-primary/90"
              >
                Kapat
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}