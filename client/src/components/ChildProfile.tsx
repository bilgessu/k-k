import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { type Child } from "@shared/schema";

interface ChildProfileProps {
  child: Child;
  weeklyProgress?: number;
  lastActivity?: string;
}

export default function ChildProfile({ 
  child, 
  weeklyProgress = 0, 
  lastActivity = "Henüz aktivite yok" 
}: ChildProfileProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="w-12 h-12 mr-4">
              <AvatarImage src={child.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary text-white">
                {child.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-textDark">
                {child.name} ({child.age} yaş)
              </h4>
              <p className="text-sm text-gray-500">{lastActivity}</p>
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
            <span className="text-primary font-medium">{weeklyProgress}%</span>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
