
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { PlaylistVideo } from '@/types/playlist';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlaylistVideoItem } from './PlaylistVideoItem';
import { 
  ListMusic, 
  Plus, 
  Settings, 
  Share2, 
  Trash2, 
  Play,
  X,
  Search,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlaylistSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoSelect: (videoId: string) => void;
  currentVideoId?: string;
}

export const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
  isOpen,
  onOpenChange,
  onVideoSelect,
  currentVideoId
}) => {
  const {
    playlists,
    currentPlaylist,
    createPlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    reorderPlaylistVideos,
    setCurrentPlaylist,
    updatePlaylistSettings
  } = usePlaylist();
  const { toast } = useToast();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewPlaylistDialog, setShowNewPlaylistDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowNewPlaylistDialog(false);
      toast({
        title: 'Success',
        description: 'Playlist created successfully!'
      });
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    deletePlaylist(playlistId);
    toast({
      title: 'Success',
      description: 'Playlist deleted successfully!'
    });
  };

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleAddVideo = async () => {
    if (!currentPlaylist || !newVideoUrl.trim()) return;

    const videoId = extractVideoId(newVideoUrl);
    if (!videoId) {
      toast({
        title: 'Error',
        description: 'Please enter a valid YouTube URL',
        variant: 'destructive'
      });
      return;
    }

    // For now, we'll create a basic video object
    // In a real app, you'd fetch this data from YouTube API
    const video = {
      youtubeId: videoId,
      title: `Video ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      duration: '0:00'
    };

    addVideoToPlaylist(currentPlaylist.id, video);
    setNewVideoUrl('');
    toast({
      title: 'Success',
      description: 'Video added to playlist!'
    });
  };

  const handleVideoReorder = (fromIndex: number, toIndex: number) => {
    if (currentPlaylist) {
      reorderPlaylistVideos(currentPlaylist.id, fromIndex, toIndex);
    }
  };

  const filteredVideos = currentPlaylist?.videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListMusic className="h-5 w-5" />
                  <SheetTitle>Playlists</SheetTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewPlaylistDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <SheetDescription>
                Manage your video playlists and share them with friends
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Playlist Selector */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <select
                    className="flex-1 bg-background border rounded px-3 py-2 text-sm"
                    value={currentPlaylist?.id || ''}
                    onChange={(e) => {
                      const playlist = playlists.find(p => p.id === e.target.value);
                      setCurrentPlaylist(playlist || null);
                    }}
                  >
                    <option value="">Select a playlist</option>
                    {playlists.map(playlist => (
                      <option key={playlist.id} value={playlist.id}>
                        {playlist.name} ({playlist.videos.length})
                      </option>
                    ))}
                  </select>
                  {currentPlaylist && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeletePlaylist(currentPlaylist.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {currentPlaylist && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add YouTube URL..."
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddVideo()}
                    />
                    <Button onClick={handleAddVideo} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Search */}
              {currentPlaylist && currentPlaylist.videos.length > 0 && (
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Video List */}
              <ScrollArea className="flex-1">
                {currentPlaylist ? (
                  filteredVideos.length > 0 ? (
                    <div className="p-4 space-y-2">
                      <AnimatePresence>
                        {filteredVideos.map((video, index) => (
                          <PlaylistVideoItem
                            key={video.id}
                            video={video}
                            index={index}
                            isActive={video.youtubeId === currentVideoId}
                            onPlay={() => onVideoSelect(video.youtubeId)}
                            onRemove={() => removeVideoFromPlaylist(currentPlaylist.id, video.id)}
                            onReorder={handleVideoReorder}
                            canEdit={currentPlaylist.isEditable}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                      <div className="text-center text-muted-foreground">
                        <ListMusic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No videos in this playlist</p>
                        <p className="text-sm">Add some videos to get started</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center text-muted-foreground">
                      <ListMusic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No playlist selected</p>
                      <p className="text-sm">Create or select a playlist to get started</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* New Playlist Dialog */}
      <Dialog open={showNewPlaylistDialog} onOpenChange={setShowNewPlaylistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Give your playlist a name to get started
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlaylistDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlaylist}>
              Create Playlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      {currentPlaylist && (
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Playlist Settings</DialogTitle>
              <DialogDescription>
                Configure your playlist preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input
                  id="playlist-name"
                  value={currentPlaylist.name}
                  onChange={(e) => updatePlaylistSettings(currentPlaylist.id, { name: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Private Playlist</Label>
                  <p className="text-sm text-muted-foreground">
                    Only you can see this playlist
                  </p>
                </div>
                <Switch
                  checked={currentPlaylist.isPrivate}
                  onCheckedChange={(checked) => updatePlaylistSettings(currentPlaylist.id, { isPrivate: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Collaborative Editing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow connected peers to edit this playlist
                  </p>
                </div>
                <Switch
                  checked={currentPlaylist.isEditable}
                  onCheckedChange={(checked) => updatePlaylistSettings(currentPlaylist.id, { isEditable: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSettingsDialog(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
