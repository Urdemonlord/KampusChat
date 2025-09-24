import { WebSocketProvider } from "@/hooks/use-websocket";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { StatusPanel } from "@/components/chat/status-panel";
import { useState } from "react";

export default function HomePage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <WebSocketProvider>
      <div className="flex h-screen bg-background">
        <ChatSidebar 
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
        
        <ChatArea 
          selectedChatId={selectedChatId}
        />
        
        <StatusPanel />
      </div>
    </WebSocketProvider>
  );
}
