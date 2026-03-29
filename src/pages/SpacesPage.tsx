import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Space } from '@/types/spaces';
import SpaceCard from '@/components/spaces/SpaceCard';
import CreateSpaceModal from '@/components/spaces/CreateSpaceModal';
import { cn } from '@/lib/utils';

const SpacesPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'owned' | 'joined'>('all');

  useEffect(() => {
    if (!userProfile?.id) return;
    loadSpaces();
  }, [userProfile?.id, filter]);

  const loadSpaces = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      let query = supabase
        .from('spaces')
        .select('*')
        .order('updated_at', { ascending: false });

      if (filter === 'owned') {
        query = query.eq('owner_id', userProfile.id);
      } else if (filter === 'joined') {
        // Fetch spaces where user is a member
        const { data: membershipData } = await supabase
          .from('space_members')
          .select('space_id')
          .eq('user_id', userProfile.id);

        const spaceIds = membershipData?.map((m) => m.space_id) || [];
        if (spaceIds.length === 0) {
          setSpaces([]);
          return;
        }
        query = query.in('id', spaceIds);
      } else {
        // All spaces (public + owned)
        query = query.or(
          `owner_id.eq.${userProfile.id},is_public.eq.true`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setSpaces(data || []);
    } catch (error) {
      console.error('Failed to load spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpaces = spaces.filter((space) =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (space.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-black/80 backdrop-blur-md p-4 -mx-4 mb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Spaces</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full',
              'bg-blue-600 hover:bg-blue-700 text-white font-medium',
              'transition-colors duration-200'
            )}
          >
            <Plus className="w-5 h-5" />
            New
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search spaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-lg',
              'bg-white/5 border border-white/10',
              'text-white placeholder-white/40',
              'focus:outline-none focus:border-blue-500/50 focus:bg-white/10',
              'transition-all duration-200'
            )}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {(['all', 'owned', 'joined'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap',
                'transition-colors duration-200',
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-white/50">Loading spaces...</div>
        </div>
      ) : filteredSpaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="text-white/50 text-center">
            <p className="text-lg font-medium">No spaces yet</p>
            <p className="text-sm mt-1">
              {filter === 'joined' ? 'Join a space to get started' : 'Create or discover spaces'}
            </p>
          </div>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                'bg-blue-600 hover:bg-blue-700 text-white font-medium',
                'transition-colors duration-200'
              )}
            >
              <Plus className="w-4 h-4" />
              Create Space
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
          {filteredSpaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onClick={() => navigate(`/spaces/${space.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Space Modal */}
      {showCreateModal && (
        <CreateSpaceModal
          onClose={() => setShowCreateModal(false)}
          onSpaceCreated={(newSpace) => {
            setSpaces((prev) => [newSpace, ...prev]);
            setShowCreateModal(false);
            navigate(`/spaces/${newSpace.id}`);
          }}
        />
      )}
    </div>
  );
};

export default SpacesPage;
