import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../components/ui/resizable";
import { ChatPanel } from "../../components/ChatPanel";
import { DashboardPanel } from "../../components/DashboardPanel";

export function DashboardPage() {
  return (
    <div className="h-full p-4 md:p-6">
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
  );
}