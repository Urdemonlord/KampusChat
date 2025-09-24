import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Image } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File | null;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = "",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize) {
      alert(`File terlalu besar. Maksimal ${formatFileSize(maxSize)}`);
      return;
    }
    
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  if (selectedFile) {
    return (
      <Card className={`${className} bg-muted`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="text-sm font-medium text-foreground" data-testid="text-filename">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-filesize">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
              data-testid="button-remove-file"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${className} border-2 border-dashed transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-6 text-center">
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-medium mb-2">
          Drag & drop file atau klik untuk upload
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Maksimal {formatFileSize(maxSize)}
        </p>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          data-testid="button-select-file"
        >
          Pilih File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
