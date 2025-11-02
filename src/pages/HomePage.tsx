import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatPanel } from "@/components/ChatPanel";
import { DashboardPanel } from "@/components/DashboardPanel";
import { Disclaimer } from "@/components/Disclaimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bot, LineChart } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
export function HomePage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');
  if (isMobile) {
    return (
      <div className="relative flex h-screen flex-col bg-gray-950 text-white">
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <main className="flex-1 overflow-hidden">
          {activeTab === 'dashboard' && <DashboardPanel />}
          {activeTab === 'chat' && <ChatPanel />}
        </main>
        <nav className="flex flex-shrink-0 border-t border-white/10 bg-gray-900">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 p-3 text-xs transition-colors",
              activeTab === 'dashboard' ? "text-indigo-400" : "text-gray-400 hover:text-white"
            )}
          >
            <LineChart className="h-5 w-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 p-3 text-xs transition-colors",
              activeTab === 'chat' ? "text-indigo-400" : "text-gray-400 hover:text-white"
            )}
          >
            <Bot className="h-5 w-5" />
            AI Chat
          </button>
        </nav>
        <Disclaimer />
      </div>
    );
  }
  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-950 text-white">
      <div className="relative mx-auto h-full max-w-screen-2xl p-4 md:p-6">
        <div className="absolute right-6 top-6 z-50 md:right-8 md:top-8">
          <ThemeToggle />
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full rounded-lg border border-white/10"
        >
          <ResizablePanel defaultSize={40} minSize={30}>
            <ChatPanel />
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-gray-800" />
          <ResizablePanel defaultSize={60} minSize={40}>
            <DashboardPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Disclaimer />
    </main>
  );
}