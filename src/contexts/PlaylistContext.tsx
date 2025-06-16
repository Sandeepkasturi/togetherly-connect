
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Playlist, PlaylistVideo, PlaylistContextType } from '@/types/playlist';
import { useUser } from '@/contexts/UserContext';
import { nanoid } from 'nanoid';

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};

const PLAYLIST_STORAGE_KEY = 'togetherly_playlists';
const CURRENT_PLAYLIST_KEY = 'togetherly_current_playlist';

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { nickname } = useUser();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylistState] = useState<Playlist | null>(null);
  const [sendDataRef, setSendDataRef] = useState<((data: any) => void) | null>(null);

  // Load playlists from localStorage on mount
  useEffect(() => {
    const savedPlaylists = localStorage.getItem(PLAYLIST_STORAGE_KEY);
    const savedCurrentPlaylist = localStorage.getItem(CURRENT_PLAYLIST_KEY);
    
    if (savedPlaylists) {
      try {
        const parsedPlaylists = JSON.parse(savedPlaylists);
        setPlaylists(parsedPlaylists);
        
        if (savedCurrentPlaylist) {
          const currentId = JSON.parse(savedCurrentPlaylist);
          const current = parsedPlaylists.find((p: Playlist) => p.id === currentId);
          if (current) {
            setCurrentPlaylistState(current);
          }
        }
      } catch (error) {
        console.error('Failed to load playlists from localStorage:', error);
      }
    }
  }, []);

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists]);

  // Save current playlist to localStorage whenever it changes
  useEffect(() => {
    if (currentPlaylist) {
      localStorage.setItem(CURRENT_PLAYLIST_KEY, JSON.stringify(currentPlaylist.id));
    } else {
      localStorage.removeItem(CURRENT_PLAYLIST_KEY);
    }
  }, [currentPlaylist]);

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: nanoid(),
      name,
      videos: [],
      createdAt: new Date().toISOString(),
      createdBy: nickname,
      isPrivate: false,
      isEditable: true,
      lastModified: new Date().toISOString(),
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    setCurrentPlaylistState(newPlaylist);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (currentPlaylist?.id === id) {
      setCurrentPlaylistState(null);
    }
  };

  const addVideoToPlaylist = (playlistId: string, video: Omit<PlaylistVideo, 'id' | 'addedAt' | 'addedBy'>) => {
    const newVideo: PlaylistVideo = {
      ...video,
      id: nanoid(),
      addedAt: new Date().toISOString(),
      addedBy: nickname,
    };

    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId
        ? { ...playlist, videos: [...playlist.videos, newVideo], lastModified: new Date().toISOString() }
        : playlist
    ));

    // Update current playlist if it's the one being modified
    if (currentPlaylist?.id === playlistId) {
      setCurrentPlaylistState(prev => 
        prev ? { ...prev, videos: [...prev.videos, newVideo], lastModified: new Date().toISOString() } : null
      );
    }
  };

  const removeVideoFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId
        ? { ...playlist, videos: playlist.videos.filter(v => v.id !== videoId), lastModified: new Date().toISOString() }
        : playlist
    ));

    // Update current playlist if it's the one being modified
    if (currentPlaylist?.id === playlistId) {
      setCurrentPlaylistState(prev => 
        prev ? { ...prev, videos: prev.videos.filter(v => v.id !== videoId), lastModified: new Date().toISOString() } : null
      );
    }
  };

  const reorderPlaylistVideos = (playlistId: string, fromIndex: number, toIndex: number) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id !== playlistId) return playlist;
      
      const newVideos = [...playlist.videos];
      const [removed] = newVideos.splice(fromIndex, 1);
      newVideos.splice(toIndex, 0, removed);
      
      return { ...playlist, videos: newVideos, lastModified: new Date().toISOString() };
    }));

    // Update current playlist if it's the one being modified
    if (currentPlaylist?.id === playlistId) {
      setCurrentPlaylistState(prev => {
        if (!prev) return null;
        const newVideos = [...prev.videos];
        const [removed] = newVideos.splice(fromIndex, 1);
        newVideos.splice(toIndex, 0, removed);
        return { ...prev, videos: newVideos, lastModified: new Date().toISOString() };
      });
    }
  };

  const setCurrentPlaylist = (playlist: Playlist | null) => {
    setCurrentPlaylistState(playlist);
  };

  const sharePlaylist = (playlistId: string) => {
    const playlistToShare = playlists.find(p => p.id === playlistId);
    if (!playlistToShare || !sendDataRef) {
      console.log('Cannot share playlist: playlist not found or no connection');
      return;
    }

    // Send playlist data through peer connection
    sendDataRef({
      type: 'playlist_share',
      payload: {
        playlist: playlistToShare,
        sharedBy: nickname,
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleReceivedPlaylist = (playlistData: Playlist, sharedBy: string) => {
    // Create a new playlist with a new ID to avoid conflicts
    const receivedPlaylist: Playlist = {
      ...playlistData,
      id: nanoid(),
      name: `${playlistData.name} (from ${sharedBy})`,
      createdBy: sharedBy,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isPrivate: false,
      isEditable: false // Received playlists are read-only by default
    };

    setPlaylists(prev => [...prev, receivedPlaylist]);
  };

  const updatePlaylistSettings = (playlistId: string, settings: Partial<Pick<Playlist, 'isPrivate' | 'isEditable' | 'name'>>) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId
        ? { ...playlist, ...settings, lastModified: new Date().toISOString() }
        : playlist
    ));

    // Update current playlist if it's the one being modified
    if (currentPlaylist?.id === playlistId) {
      setCurrentPlaylistState(prev => 
        prev ? { ...prev, ...settings, lastModified: new Date().toISOString() } : null
      );
    }
  };

  const contextValue: PlaylistContextType = {
    playlists,
    currentPlaylist,
    createPlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    reorderPlaylistVideos,
    setCurrentPlaylist,
    sharePlaylist,
    updatePlaylistSettings,
    handleReceivedPlaylist,
    setSendDataRef
  };

  return (
    <PlaylistContext.Provider value={contextValue}>
      {children}
    </PlaylistContext.Provider>
  );
};
