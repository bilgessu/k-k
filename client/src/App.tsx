import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import VoiceRecording from "@/pages/VoiceRecording";
import StoryLibrary from "@/pages/StoryLibrary";
import StoryPlayer from "@/pages/StoryPlayer";
import ChildMode from "@/pages/ChildMode";
import MultiAgentStory from "@/pages/MultiAgentStory";
import AIInsights from "@/pages/AIInsights";
import VoiceAnalytics from "@/pages/VoiceAnalytics";
import AIArchitecture from "@/pages/AIArchitecture";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/voice-recording" component={VoiceRecording} />
          <Route path="/story-library" component={StoryLibrary} />
          <Route path="/story-player/:id" component={StoryPlayer} />
          <Route path="/child-mode" component={ChildMode} />
          <Route path="/child-mode/:childId" component={ChildMode} />
          <Route path="/multi-agent-story" component={MultiAgentStory} />
          <Route path="/ai-insights" component={AIInsights} />
          <Route path="/voice-analytics" component={VoiceAnalytics} />
          <Route path="/ai-architecture" component={AIArchitecture} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
