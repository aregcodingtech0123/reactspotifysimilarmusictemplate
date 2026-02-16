/**
 * Playlist module: request/response and domain types.
 */
export interface CreatePlaylistBody {
  name: string;
}

export interface AddTrackBody {
  title: string;
  artist: string;
}

export interface PlaylistResponse {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  tracks?: TrackResponse[];
}

export interface TrackResponse {
  id: string;
  title: string;
  artist: string;
  playlistId: string;
}
