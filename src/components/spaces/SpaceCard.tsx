import { Space, SpaceType } from '@/types/spaces';
import { Users, BookOpen, FileCode, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SPACE_ICONS: Record<SpaceType, React.ReactNode> = {
  study: <BookOpen className="w-6 h-6" />,
  interview: <FileCode className="w-6 h-6" />,
  collab: <Users className="w-6 h-6" />,
  lounge: <MessageCircle className="w-6 h-6" />,
};

const SPACE_COLORS: Record<SpaceType, string> = {
  study: 'from-purple-600/20 to-purple-900/20 border-purple-500/20',
  interview: 'from-blue-600/20 to-blue-900/20 border-blue-500/20',
  collab: 'from-green-600/20 to-green-900/20 border-green-500/20',
  lounge: 'from-pink-600/20 to-pink-900/20 border-pink-500/20',
};

const SPACE_LABELS: Record<SpaceType, string> = {
  study: 'Study Room',
  interview: 'Interview',
  collab: 'Collab',
  lounge: 'Lounge',
};

interface SpaceCardProps {
  space: Space;
  onClick: () => void;
  memberCount?: number;
}

const SpaceCard = ({ space, onClick, memberCount }: SpaceCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border',
        'bg-gradient-to-br',
        SPACE_COLORS[space.type],
        'p-6 text-left transition-all duration-300',
        'hover:shadow-lg hover:shadow-white/5 hover:scale-105',
        'group cursor-pointer'
      )}
    >
      {/* Background accent */}
      <div
        className={cn(
          'absolute -top-8 -right-8 w-32 h-32 rounded-full',
          'opacity-0 group-hover:opacity-10 transition-opacity duration-300'
        )}
        style={{
          background:
            space.type === 'study'
              ? 'rgb(147, 51, 234)'
              : space.type === 'interview'
                ? 'rgb(59, 130, 246)'
                : space.type === 'collab'
                  ? 'rgb(34, 197, 94)'
                  : 'rgb(236, 72, 153)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Icon and Title Row */}
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'p-3 rounded-lg backdrop-blur-sm',
              'bg-white/5 group-hover:bg-white/10',
              'transition-all duration-300'
            )}
          >
            {SPACE_ICONS[space.type]}
          </div>
          <span className="text-xs font-medium text-white/60 bg-white/5 px-2 py-1 rounded-full">
            {SPACE_LABELS[space.type]}
          </span>
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="font-bold text-lg text-white line-clamp-2 mb-1">
            {space.name}
          </h3>
          {space.description && (
            <p className="text-sm text-white/60 line-clamp-2">
              {space.description}
            </p>
          )}
        </div>

        {/* Footer: Member count */}
        {memberCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-white/50 pt-2 border-t border-white/10">
            <Users className="w-4 h-4" />
            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Visibility badge */}
      {space.is_public && (
        <div className="absolute top-3 right-3 text-[10px] font-bold text-white/40 uppercase tracking-wider">
          Public
        </div>
      )}
    </button>
  );
};

export default SpaceCard;
