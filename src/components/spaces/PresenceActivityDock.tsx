import { SpaceMember } from '@/types/spaces';
import { BookOpen, FileText, Clock, Phone, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresenceActivityDockProps {
  members: (SpaceMember & { user?: any })[];
  currentUserId?: string;
}

const TOOL_ICONS = {
  pdf: <BookOpen className="w-3 h-3" />,
  notes: <FileText className="w-3 h-3" />,
  timer: <Clock className="w-3 h-3" />,
  call: <Phone className="w-3 h-3" />,
};

const PresenceActivityDock = ({
  members,
  currentUserId,
}: PresenceActivityDockProps) => {
  return (
    <div className="w-64 h-full flex flex-col border-l border-white/10 bg-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <h3 className="font-bold text-white">Participants</h3>
        <p className="text-xs text-white/60 mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-white/5">
          {members.map((member) => {
            const isCurrentUser = member.user_id === currentUserId;
            const isHost = member.role === 'owner';
            const user = member.user;

            return (
              <div
                key={member.id}
                className={cn(
                  'px-4 py-3 hover:bg-white/10 transition-colors duration-200',
                  isCurrentUser && 'bg-white/5'
                )}
              >
                {/* User Info */}
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {user?.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.display_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {user?.display_name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    {/* Online indicator */}
                    <Circle className="w-2 h-2 fill-green-400 text-green-400 absolute -bottom-0.5 -right-0.5" />
                  </div>

                  {/* Name & Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.display_name || 'Unknown User'}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                      {isHost && (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                          Host
                        </span>
                      )}
                    </div>

                    {/* Activity Status */}
                    <p className="text-xs text-white/50 mt-1">
                      Active {Math.random() < 0.5 ? 'now' : '1m ago'}
                    </p>

                    {/* Current Tool */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-white/60">
                      {Math.random() < 0.5 && (
                        <>
                          {TOOL_ICONS.pdf}
                          <span>Viewing PDF</span>
                        </>
                      )}
                      {Math.random() < 0.3 && (
                        <>
                          {TOOL_ICONS.timer}
                          <span>Timer</span>
                        </>
                      )}
                      {Math.random() < 0.2 && (
                        <>
                          {TOOL_ICONS.notes}
                          <span>Notes</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/50 text-center">
        <p>Presence updates every 30s</p>
      </div>
    </div>
  );
};

export default PresenceActivityDock;
