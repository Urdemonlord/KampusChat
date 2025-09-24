import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Plus, Clock, RefreshCw, Radio, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface StatusUpdate {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  expiresAt: string;
  user?: {
    name: string;
    pin: string;
    avatar?: string;
  };
}

export function StatusPanel() {
  const { user } = useAuth();
  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [statusContent, setStatusContent] = useState("");
  const [statusImage, setStatusImage] = useState<File | null>(null);

  const { data: statuses = [], refetch } = useQuery<StatusUpdate[]>({
    queryKey: ["/api/status"],
    enabled: !!user,
  });

  const addStatusMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/status", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to create status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      setIsAddStatusOpen(false);
      setStatusContent("");
      setStatusImage(null);
    },
  });

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!statusContent.trim()) return;

    const formData = new FormData();
    formData.append("content", statusContent.trim());
    if (statusImage) {
      formData.append("image", statusImage);
    }

    addStatusMutation.mutate(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatusImage(file);
    }
  };

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Status & Info</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            data-testid="button-refresh-status"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Status Updates Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">Status Terkini</h4>
            <Dialog open={isAddStatusOpen} onOpenChange={setIsAddStatusOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  data-testid="button-add-status"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Status</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddStatus} className="space-y-4">
                  <div>
                    <Label htmlFor="status-content">Konten Status</Label>
                    <Textarea
                      id="status-content"
                      placeholder="Apa yang kamu lakukan hari ini?"
                      value={statusContent}
                      onChange={(e) => setStatusContent(e.target.value)}
                      maxLength={280}
                      data-testid="textarea-status-content"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Status akan hilang otomatis dalam 24 jam ({280 - statusContent.length} karakter tersisa)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="status-image">Tambah Gambar (opsional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {statusImage ? statusImage.name : "Klik untuk upload gambar"}
                      </p>
                      <Input
                        id="status-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        data-testid="input-status-image"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById("status-image")?.click()}
                      >
                        Pilih File
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsAddStatusOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={!statusContent.trim() || addStatusMutation.isPending}
                      data-testid="button-submit-status"
                    >
                      {addStatusMutation.isPending ? "Posting..." : "Posting"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {statuses.map((status) => (
              <Card key={status.id} className="bg-muted/30 border-border" data-testid={`status-${status.id}`}>
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={status.user?.avatar || undefined} />
                      <AvatarFallback>
                        {status.user?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm text-foreground" data-testid={`text-status-author-${status.id}`}>
                          {status.user?.name || "Unknown User"}
                        </h5>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span data-testid={`text-status-time-${status.id}`}>
                            {formatDistanceToNow(new Date(status.expiresAt), { 
                              addSuffix: true, 
                              locale: id 
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1" data-testid={`text-status-pin-${status.id}`}>
                        {status.user?.pin}
                      </p>
                      
                      <p className="text-sm text-foreground" data-testid={`text-status-content-${status.id}`}>
                        {status.content}
                      </p>
                      
                      {status.imageUrl && (
                        <img 
                          src={status.imageUrl} 
                          alt="Status" 
                          className="mt-2 rounded w-full h-auto max-h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          data-testid={`img-status-image-${status.id}`}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {statuses.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Belum ada status terbaru</p>
              </div>
            )}
          </div>
        </div>

        {/* Broadcast Messages Section */}
        <div className="border-t border-border p-4">
          <h4 className="font-medium text-foreground mb-3">Pengumuman Kampus</h4>
          
          <div className="space-y-3">
            {/* Mock broadcast for demo */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Radio className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-sm text-primary">BEM UNIMUS</h5>
                      <span className="text-xs text-muted-foreground">2h lalu</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Pendaftaran beasiswa PPA dibuka hingga 15 Desember 2024. Info lengkap di website kampus.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Radio className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-sm text-accent">Admin Akademik</h5>
                      <span className="text-xs text-muted-foreground">5h lalu</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Jadwal ujian akhir semester telah dipublikasi. Silahkan cek portal akademik.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
