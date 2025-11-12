import { ChatPanel } from "../../components/ChatPanel";

export function ChatPage() {
  return (
    <div className="h-full p-4 md:p-6">
      <div className="h-full">
        <ChatPanel />
      </div>
    </div>
  );
}