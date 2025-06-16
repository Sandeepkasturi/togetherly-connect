
export interface PlaylistVideo {
  id: string;
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration: string;
  addedAt: string;
  addedBy: string;
}

export interface Playlist {
  id: string;
  name: string;
  videos: PlaylistVideo[];
  createdAt: string;
  createdBy: string;
  isPrivate: boolean;
  isEditable: boolean;
  lastModified: string;
}

export interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addVideoToPlaylist: (playlistId: string, video: Omit<PlaylistVideo, 'id' | 'addedAt' | 'addedBy'>) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  reorderPlaylistVideos: (playlistId: string, fromIndex: number, toIndex: number) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  sharePlaylist: (playlistId: string) => void;
  updatePlaylistSettings: (playlistId: string, settings: Partial<Pick<Playlist, 'isPrivate' | 'isEditable' | 'name'>>) => void;
  handleReceivedPlaylist: (playlist: Playlist, sharedBy: string) => void;
  setSendDataRef: (sendData: ((data: any) => void) | null) => void;
}
