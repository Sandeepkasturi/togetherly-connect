
import { File as FileIcon, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileDisplayProps {
  fileName?: string;
  fileSize?: number;
  fileData?: string;
  isMe: boolean;
}

const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return '0 B';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileDisplay = ({ fileName, fileSize, fileData, isMe }: FileDisplayProps) => {
  const handleDownload = () => {
    if (!fileData) return;
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("flex items-center gap-3 p-2 rounded-md", isMe ? "bg-primary/90" : "bg-muted-foreground/20")}>
      <FileIcon className="h-8 w-8 text-primary-foreground/80 flex-shrink-0" />
      <div className="flex-grow overflow-hidden">
        <p className="font-medium truncate text-sm">{fileName}</p>
        <p className={cn("text-xs", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatFileSize(fileSize)}</p>
      </div>
      <Button size="icon" variant="ghost" onClick={handleDownload} className="flex-shrink-0 hover:bg-black/20">
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default FileDisplay;
