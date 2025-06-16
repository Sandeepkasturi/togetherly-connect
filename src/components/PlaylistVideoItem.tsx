
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlaylistVideo } from '@/types/playlist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Trash2, 
  GripVertical,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaylistVideoItemProps {
  video: PlaylistVideo;
  index: number;
  isActive: boolean;
  onPlay: () => void;
  onRemove: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  canEdit: boolean;
}

export const PlaylistVideoItem: React.FC<PlaylistVideoItemProps> = ({
  video,
  index,
  isActive,
  onPlay,
  onRemove,
  onReorder,
  canEdit
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== index) {
      onReorder(fromIndex, index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "p-3 transition-all duration-200 hover:shadow-md",
          isActive && "ring-2 ring-primary",
          isDragging && "opacity-50 rotate-2"
        )}
        draggable={canEdit}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          {canEdit && (
            <div className="flex-shrink-0 pt-1 cursor-move">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {/* Thumbnail */}
          <div className="flex-shrink-0 relative">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-16 h-12 object-cover rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            {isActive && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate mb-1">
              {video.title}
            </h4>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {video.duration}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {video.addedBy}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={onPlay}
                className="h-7 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                {isActive ? 'Playing' : 'Play'}
              </Button>

              {canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRemove}
                  className="h-7 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}

              {isActive && (
                <Badge variant="secondary" className="text-xs">
                  Now Playing
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
