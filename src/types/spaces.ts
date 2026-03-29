// Phase 1: Spaces primitive types for co-presence collaboration

export type SpaceType = 'study' | 'interview' | 'collab' | 'lounge';

export interface Space {
  id: string;
  name: string;
  description?: string;
  type: SpaceType;
  slug: string; // Unique URL-safe identifier for join links
  owner_id: string;
  is_public: boolean;
  max_members?: number;
  created_at: string;
  updated_at: string;
  cover_image_url?: string;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  role: 'owner' | 'moderator' | 'member';
  joined_at: string;
  left_at?: string; // For archived members
}

export interface SpaceSession {
  id: string;
  space_id: string;
  started_at: string;
  ended_at?: string;
  participant_count: number;
  description?: string; // Auto-filled with study/interview context
}

export interface PresenceActivity {
  user_id: string;
  status: 'active' | 'idle' | 'away';
  last_activity_at: string;
  current_tool?: 'pdf' | 'code' | 'notes' | 'timer' | 'call';
}

export interface SpaceWithMembers extends Space {
  members?: Array<{
    user: any; // Will be populated from users table via join
    role: string;
  }>;
  member_count?: number;
}
