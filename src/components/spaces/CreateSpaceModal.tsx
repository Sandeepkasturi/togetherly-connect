import { useState } from 'react';
import { X, BookOpen, FileCode, Users, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Space, SpaceType } from '@/types/spaces';
import { cn } from '@/lib/utils';

const SPACE_TYPES: { type: SpaceType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'study',
    label: 'Study Room',
    description: 'Synchronized PDF viewer, notes, and Pomodoro',
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    type: 'interview',
    label: 'Interview Room',
    description: 'Code editor, judge for execution, scorecard',
    icon: <FileCode className="w-6 h-6" />,
  },
  {
    type: 'collab',
    label: 'Collab Space',
    description: 'Flexible collaborative workspace',
    icon: <Users className="w-6 h-6" />,
  },
  {
    type: 'lounge',
    label: 'Lounge',
    description: 'Casual hangout and networking',
    icon: <MessageCircle className="w-6 h-6" />,
  },
];

interface CreateSpaceModalProps {
  onClose: () => void;
  onSpaceCreated: (space: Space) => void;
}

const CreateSpaceModal = ({ onClose, onSpaceCreated }: CreateSpaceModalProps) => {
  const { userProfile } = useAuth();
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<SpaceType>('study');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSpace = async () => {
    if (!userProfile?.id) return;
    if (!name.trim()) {
      setError('Space name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate a unique slug
      const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

      const { data, error: createError } = await supabase
        .from('spaces')
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            type: selectedType,
            slug,
            owner_id: userProfile.id,
            is_public: isPublic,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      // Add creator as owner in space_members
      const { error: memberError } = await supabase
        .from('space_members')
        .insert([
          {
            space_id: data.id,
            user_id: userProfile.id,
            role: 'owner',
            joined_at: new Date().toISOString(),
          },
        ]);

      if (memberError) throw memberError;

      onSpaceCreated(data as Space);
    } catch (err) {
      console.error('Failed to create space:', err);
      setError(err instanceof Error ? err.message : 'Failed to create space');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-b from-slate-900 to-transparent">
          <h2 className="text-xl font-bold text-white">
            {step === 'type' ? 'Create Space' : 'Space Details'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          {step === 'type' ? (
            // Step 1: Select Space Type
            <div className="space-y-3">
              {SPACE_TYPES.map((spaceType) => (
                <button
                  key={spaceType.type}
                  onClick={() => {
                    setSelectedType(spaceType.type);
                    setStep('details');
                  }}
                  className={cn(
                    'w-full p-4 rounded-xl text-left border transition-all duration-200',
                    'hover:border-white/20 hover:bg-white/5',
                    'group cursor-pointer'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors mt-1">
                      {spaceType.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{spaceType.label}</h3>
                      <p className="text-sm text-white/60">{spaceType.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Step 2: Space Details
            <div className="space-y-4">
              {/* Space Name */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Space Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., CS101 Study Group"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-white/40',
                    'focus:outline-none focus:border-blue-500/50 focus:bg-white/10',
                    'transition-all duration-200'
                  )}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this space for?"
                  rows={3}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg resize-none',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-white/40',
                    'focus:outline-none focus:border-blue-500/50 focus:bg-white/10',
                    'transition-all duration-200'
                  )}
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="font-medium text-white">Public Space</p>
                  <p className="text-xs text-white/60">Anyone can discover and join</p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors duration-200',
                    isPublic ? 'bg-blue-600' : 'bg-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-1 left-1 w-4 h-4 rounded-full bg-white',
                      'transition-transform duration-200',
                      isPublic ? 'translate-x-6' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('type')}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg font-medium',
                    'bg-white/5 hover:bg-white/10 text-white',
                    'transition-colors duration-200'
                  )}
                >
                  Back
                </button>
                <button
                  onClick={handleCreateSpace}
                  disabled={loading || !name.trim()}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg font-medium',
                    'bg-blue-600 hover:bg-blue-700 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors duration-200'
                  )}
                >
                  {loading ? 'Creating...' : 'Create Space'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceModal;
