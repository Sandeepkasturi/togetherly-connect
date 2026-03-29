import { FileText, BookOpen, Clock, Phone } from 'lucide-react';
import { SpaceType } from '@/types/spaces';
import { cn } from '@/lib/utils';

type ActiveTool = 'pdf' | 'notes' | 'timer' | 'call' | null;

interface ToolbarButton {
  id: ActiveTool;
  label: string;
  icon: React.ReactNode;
  available: boolean;
  description?: string;
}

interface SpaceRoomToolbarProps {
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
  isHost: boolean;
  spaceType: SpaceType;
}

const SpaceRoomToolbar = ({
  activeTool,
  onToolChange,
  isHost,
  spaceType,
}: SpaceRoomToolbarProps) => {
  const getAvailableTools = (): ToolbarButton[] => {
    if (spaceType === 'study') {
      return [
        {
          id: 'pdf',
          label: 'PDF',
          icon: <BookOpen className="w-5 h-5" />,
          available: true,
          description: 'Synchronized PDF viewer',
        },
        {
          id: 'notes',
          label: 'Notes',
          icon: <FileText className="w-5 h-5" />,
          available: true,
          description: 'Shared session notes',
        },
        {
          id: 'timer',
          label: 'Timer',
          icon: <Clock className="w-5 h-5" />,
          available: true,
          description: 'Pomodoro timer',
        },
        {
          id: 'call',
          label: 'Call',
          icon: <Phone className="w-5 h-5" />,
          available: true,
          description: 'Voice/video call',
        },
      ];
    }

    if (spaceType === 'interview') {
      return [
        {
          id: 'pdf',
          label: 'Questions',
          icon: <FileText className="w-5 h-5" />,
          available: true,
          description: 'Interview questions',
        },
        {
          id: 'notes',
          label: 'Code',
          icon: <FileText className="w-5 h-5" />,
          available: true,
          description: 'Code editor',
        },
        {
          id: 'timer',
          label: 'Score',
          icon: <Clock className="w-5 h-5" />,
          available: true,
          description: 'Scorecard',
        },
        {
          id: 'call',
          label: 'Call',
          icon: <Phone className="w-5 h-5" />,
          available: true,
          description: 'Voice/video call',
        },
      ];
    }

    return [
      {
        id: 'call',
        label: 'Call',
        icon: <Phone className="w-5 h-5" />,
        available: true,
        description: 'Voice/video call',
      },
    ];
  };

  const tools = getAvailableTools();

  return (
    <div className="flex gap-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(activeTool === tool.id ? null : tool.id)}
          disabled={!tool.available}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg font-medium',
            'transition-all duration-200 relative group',
            activeTool === tool.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10',
            !tool.available && 'opacity-50 cursor-not-allowed'
          )}
          title={tool.description}
        >
          {tool.icon}
          <span className="hidden sm:inline">{tool.label}</span>
          
          {/* Tooltip */}
          {tool.description && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-white/10 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm">
              {tool.description}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default SpaceRoomToolbar;
