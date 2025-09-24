import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Phone, Video, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

interface ChatAreaProps {
  selectedChatId: string | null;
}

export function ChatArea({ selectedChatId }: ChatAreaProps) {
  const { user } = useAuth();
  const { socket, sendMessage } = useWebSocket();
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/chats", selectedChatId, "messages"],
    enabled: !!selectedChatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      if (socket) {
        sendMessage({
          type: "message",
          data: messageData,
        });
      }
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chats", selectedChatId, "messages"] 
      });
    },
  });

  // WebSocket message handler
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case "message":
          if (data.data.chatId === selectedChatId) {
            queryClient.invalidateQueries({ 
              queryKey: ["/api/chats", selectedChatId, "messages"] 
            });
          }
          break;
          
        case "typing":
          if (data.data.chatId === selectedChatId) {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              if (data.data.isTyping) {
                newSet.add(data.data.userId);
              } else {
                newSet.delete(data.data.userId);
              }
              return newSet;
            });
          }
          break;
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, selectedChatId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedChatId) return;

    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: messageInput.trim(),
      messageType: "text",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator
    if (socket && selectedChatId) {
      sendMessage({
        type: "typing",
        data: {
          chatId: selectedChatId,
          isTyping: true,
        },
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendMessage({
          type: "typing",
          data: {
            chatId: selectedChatId,
            isTyping: false,
          },
        });
      }, 3000);
    }
  };

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Pilih Chat</h3>
          <p className="text-muted-foreground">Pilih percakapan untuk mulai chat</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {/* Chat Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground" data-testid="text-current-chat">
                Chat
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" data-testid="button-voice-call">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-video-call">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-chat-info">
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex",
                message.senderId === user?.id ? "justify-end" : "justify-start"
              )}
              data-testid={`message-${message.id}`}
            >
              <div className={cn(
                "max-w-xs lg:max-w-md",
                message.senderId === user?.id ? "order-2" : "order-1"
              )}>
                <Card className={cn(
                  message.senderId === user?.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card"
                )}>
                  <CardContent className="p-3">
                    <p className="text-sm" data-testid={`text-message-content-${message.id}`}>
                      {message.content}
                    </p>
                  </CardContent>
                </Card>
                <div className={cn(
                  "flex items-center mt-1 text-xs text-muted-foreground",
                  message.senderId === user?.id ? "justify-end" : "justify-start"
                )}>
                  <span data-testid={`text-message-time-${message.id}`}>
                    {format(new Date(message.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div className="flex items-start space-x-2" data-testid="typing-indicator">
              <Avatar className="w-8 h-8">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <Card className="bg-card">
                <CardContent className="p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <footer className="bg-card border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            data-testid="button-attach-file"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={handleInputChange}
              placeholder="Ketik pesan..."
              data-testid="input-message"
              className="pr-10"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              data-testid="button-emoji"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            type="submit" 
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </main>
  );
}
