import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Space, SpaceMember } from '@/types/spaces';
import SpaceRoomHeader from '@/components/spaces/SpaceRoomHeader';
import SpaceRoomToolbar from '@/components/spaces/SpaceRoomToolbar';
import StudyRoomContent from '@/components/spaces/StudyRoomContent';
import InterviewRoomContent from '@/components/spaces/InterviewRoomContent';
import PresenceActivityDock from '@/components/spaces/PresenceActivityDock';
import { cn } from '@/lib/utils';

type ActiveTool = 'pdf' | 'notes' | 'timer' | 'call' | null;

const SpaceRoomPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [space, setSpace] = useState<Space | null>(null);
  const [members, setMembers] = useState<(SpaceMember & { user?: any })[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);

  useEffect(() => {
    if (!id || !userProfile?.id) return;
    loadSpaceData();
  }, [id, userProfile?.id]);

  const loadSpaceData = async () => {
    if (!id || !userProfile?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Load space
      const { data: spaceData, error: spaceError } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', id)
        .single();

      if (spaceError) throw spaceError;
      setSpace(spaceData);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('space_members')
        .select('*, user:users(*)')
        .eq('space_id', id);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Check if current user is host
      const userMember = membersData?.find((m) => m.user_id === userProfile.id);
      setIsHost(userMember?.role === 'owner' || false);

      // If user not a member, add them
      if (!userMember) {
        const { error: joinError } = await supabase
          .from('space_members')
          .insert([
            {
              space_id: id,
              user_id: userProfile.id,
              role: 'member',
              joined_at: new Date().toISOString(),
            },
          ]);

        if (joinError) throw joinError;
        // Reload members
        loadSpaceData();
      }
    } catch (err) {
      console.error('Failed to load space:', err);
      setError(err instanceof Error ? err.message : 'Failed to load space');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white/50">Loading space...</div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-white/50">Failed to load space</div>
        <button
          onClick={() => navigate('/app')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Spaces
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <SpaceRoomHeader space={space} memberCount={members.length} isHost={isHost} />

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 overflow-hidden p-4">
        {/* Left: Main Tool Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Toolbar */}
          <SpaceRoomToolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            isHost={isHost}
            spaceType={space.type}
          />

          {/* Content Area */}
          <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            {space.type === 'study' && (
              <StudyRoomContent
                spaceId={space.id}
                activeTool={activeTool}
                isHost={isHost}
              />
            )}
            {space.type === 'interview' && (
              <InterviewRoomContent
                spaceId={space.id}
                activeTool={activeTool}
                isHost={isHost}
              />
            )}
            {space.type === 'collab' && (
              <div className="flex items-center justify-center h-full text-white/50">
                Collaboration space coming soon
              </div>
            )}
            {space.type === 'lounge' && (
              <div className="flex items-center justify-center h-full text-white/50">
                Lounge features coming soon
              </div>
            )}
          </div>
        </div>

        {/* Right: Presence Activity Dock */}
        <PresenceActivityDock members={members} currentUserId={userProfile?.id} />
      </div>
    </div>
  );
};

export default SpaceRoomPage;
