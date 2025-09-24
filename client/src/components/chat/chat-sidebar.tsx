import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Users, UserPlus, MessageCircle, Radio, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  name: string | null;
  type: string;
  description: string | null;
  createdAt: string;
}

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatSidebar({ selectedChatId, onSelectChat }: ChatSidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"chats" | "broadcast" | "status">("chats");
  const [addContactPin, setAddContactPin] = useState("");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
    enabled: !!user,
  });

  const searchUserMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await fetch(`/api/users/search?pin=${pin}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    onSuccess: (foundUser) => {
      // Create direct chat with found user
      createChatMutation.mutate({
        name: foundUser.name,
        type: "direct",
        userPin: foundUser.pin,
      });
    },
  });

  const createChatMutation = useMutation({
    mutationFn: async ({ name, type, userPin }: { name: string; type: string; userPin?: string }) => {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, type }),
      });
      if (!res.ok) throw new Error("Failed to create chat");
      const chat = await res.json();
      
      if (userPin) {
        await fetch(`/api/chats/${chat.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userPin }),
        });
      }
      
      return chat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setIsAddContactOpen(false);
      setAddContactPin("");
    },
  });

  const handleAddContact = () => {
    if (addContactPin.trim()) {
      searchUserMutation.mutate(addContactPin.trim());
    }
  };

  if (!user) return null;

  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col">
      {/* User Profile Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground" data-testid="text-user-name">
                {user.name}
              </h3>
              <div className="w-2 h-2 bg-accent rounded-full"></div>
            </div>
            <p className="text-sm text-muted-foreground font-mono" data-testid="text-user-pin">
              {user.pin}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="text-user-role">
              {user.role === "mahasiswa" ? "Mahasiswa" : user.role === "alumni" ? "Alumni" : "Dosen"} 
              {user.program && ` - ${user.program}`}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <Users className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex">
          <Button
            variant={activeTab === "chats" ? "default" : "ghost"}
            size="sm"
            className={cn("flex-1 rounded-none", activeTab === "chats" && "bg-primary/10")}
            onClick={() => setActiveTab("chats")}
            data-testid="tab-chats"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            variant={activeTab === "broadcast" ? "default" : "ghost"}
            size="sm"
            className={cn("flex-1 rounded-none", activeTab === "broadcast" && "bg-primary/10")}
            onClick={() => setActiveTab("broadcast")}
            data-testid="tab-broadcast"
          >
            <Radio className="w-4 h-4 mr-2" />
            Broadcast
          </Button>
          <Button
            variant={activeTab === "status" ? "default" : "ghost"}
            size="sm"
            className={cn("flex-1 rounded-none", activeTab === "status" && "bg-primary/10")}
            onClick={() => setActiveTab("status")}
            data-testid="tab-status"
          >
            <Clock className="w-4 h-4 mr-2" />
            Status
          </Button>
        </nav>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <Card 
            key={chat.id}
            className={cn(
              "m-2 cursor-pointer transition-colors hover:bg-muted/50",
              selectedChatId === chat.id && "ring-2 ring-primary"
            )}
            onClick={() => onSelectChat(chat.id)}
            data-testid={`chat-item-${chat.id}`}
          >
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  {chat.type === "group" ? (
                    <Users className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <MessageCircle className="w-6 h-6 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate" data-testid={`text-chat-name-${chat.id}`}>
                    {chat.name || "Unnamed Chat"}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.type === "group" ? "Group Chat" : "Direct Message"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Contact Button */}
      <div className="p-4 border-t border-border">
        <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" data-testid="button-add-contact">
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah Kontak dengan PIN
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kontak Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-pin">PIN Kontak</Label>
                <Input
                  id="contact-pin"
                  placeholder="Masukkan PIN (UNIMUS-XXXX)"
                  value={addContactPin}
                  onChange={(e) => setAddContactPin(e.target.value)}
                  data-testid="input-contact-pin"
                />
              </div>
              <Button 
                onClick={handleAddContact} 
                disabled={!addContactPin.trim() || searchUserMutation.isPending}
                className="w-full"
                data-testid="button-search-contact"
              >
                {searchUserMutation.isPending ? "Mencari..." : "Cari Kontak"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
