import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NotesEntry {
  id: string;
  space_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_name?: string;
}

interface NotesPanelProps {
  spaceId: string;
}

const NotesPanel = ({ spaceId }: NotesPanelProps) => {
  const { userProfile } = useAuth();
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadNotes();
  }, [spaceId]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('space_notes')
        .select('*')
        .eq('space_id', spaceId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        console.error('Failed to load notes:', error);
        return;
      }

      if (data) {
        setNotes(data.content || '');
        setLastSaved(new Date(data.updated_at));
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const handleNotesChange = (content: string) => {
    setNotes(content);

    // Clear existing timeout
    if (saveTimeout) clearTimeout(saveTimeout);

    // Set new auto-save timeout (2 seconds after last change)
    const timeout = setTimeout(() => {
      saveNotes(content);
    }, 2000);

    setSaveTimeout(timeout);
  };

  const saveNotes = async (content: string) => {
    if (!userProfile?.id || !spaceId) return;

    try {
      setIsSaving(true);

      // Check if notes exist
      const { data: existing } = await supabase
        .from('space_notes')
        .select('id')
        .eq('space_id', spaceId)
        .single();

      if (existing) {
        // Update existing
        await supabase
          .from('space_notes')
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq('space_id', spaceId);
      } else {
        // Insert new
        await supabase
          .from('space_notes')
          .insert([
            {
              space_id: spaceId,
              content,
              created_by: userProfile.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="font-medium text-white">Session Notes</h3>
        <div className="flex items-center gap-2">
          {isSaving && <span className="text-xs text-yellow-400">Saving...</span>}
          {lastSaved && !isSaving && (
            <span className="text-xs text-white/50">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Notes Editor */}
      <textarea
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        placeholder="Start typing your notes... They'll be saved automatically and shared with your study partners."
        className={cn(
          'flex-1 w-full p-4 resize-none',
          'bg-transparent text-white placeholder-white/40',
          'focus:outline-none',
          'font-mono text-sm leading-relaxed'
        )}
      />

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/10 text-xs text-white/50 text-center">
        Notes are synchronized across all participants
      </div>
    </div>
  );
};

export default NotesPanel;
