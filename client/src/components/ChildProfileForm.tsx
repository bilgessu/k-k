import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertChildSchema, type InsertChild } from "@shared/schema";
import { Plus, Baby } from "lucide-react";

interface ChildProfileFormProps {
  trigger?: React.ReactNode;
}

export default function ChildProfileForm({ trigger }: ChildProfileFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertChild>({
    resolver: zodResolver(insertChildSchema.omit({ parentId: true })),
    defaultValues: {
      name: "",
      age: 3,
      profileImageUrl: "",
    },
  });

  const createChildMutation = useMutation({
    mutationFn: async (data: Omit<InsertChild, 'parentId'>) => {
      return await apiRequest('POST', '/api/children', data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Çocuk profili oluşturuldu.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Profil oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Omit<InsertChild, 'parentId'>) => {
    createChildMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Çocuk Profili Ekle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Baby className="w-5 h-5 mr-2 text-primary" />
            Yeni Çocuk Profili
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Çocuğunuzun Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Ahmet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yaş</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Yaş seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 3).map((age) => (
                        <SelectItem key={age} value={age.toString()}>
                          {age} yaş
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={createChildMutation.isPending}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={createChildMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createChildMutation.isPending ? 'Oluşturuluyor...' : 'Profil Oluştur'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}