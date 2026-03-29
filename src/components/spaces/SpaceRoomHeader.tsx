import { Space } from '@/types/spaces';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpaceRoomHeaderProps {
  space: Space;
  memberCount: number;
  isHost: boolean;
}

const SpaceRoomHeader = ({ space, memberCount, isHost }: SpaceRoomHeaderProps) => {
  const navigate = useNavigate();

  const typeLabel = {
    study: 'Study Room',
    interview: 'Interview',
    collab: 'Collab Space',
    lounge: 'Lounge',
  }[space.type];

  return (
    <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-white">{space.name}</h1>
          <p className="text-sm text-white/60">{typeLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isHost && (
          <span className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-xs font-medium text-blue-300">
            Host
          </span>
        )}

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <Users className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">{memberCount}</span>
        </div>
      </div>
    </div>
  );
};

export default SpaceRoomHeader;
