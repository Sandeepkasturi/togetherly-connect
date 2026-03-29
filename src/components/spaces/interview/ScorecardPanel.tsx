import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScorecardData {
  problemSolving: number; // 1-5
  communication: number;  // 1-5
  codeQuality: number;    // 1-5
  notes: string;
}

interface ScorecardPanelProps {
  isHost: boolean;
  onSubmitScorecard: (data: ScorecardData) => void;
}

const CRITERIA = [
  {
    id: 'problemSolving',
    label: 'Problem Solving',
    description: 'Ability to understand and approach the problem',
  },
  {
    id: 'communication',
    label: 'Communication',
    description: 'Clarity in explaining thought process and solutions',
  },
  {
    id: 'codeQuality',
    label: 'Code Quality',
    description: 'Efficiency, readability, and correctness of code',
  },
];

const ScorecardPanel = ({ isHost, onSubmitScorecard }: ScorecardPanelProps) => {
  const [scorecard, setScorecard] = useState<ScorecardData>({
    problemSolving: 0,
    communication: 0,
    codeQuality: 0,
    notes: '',
  });

  const handleRatingChange = (criterion: keyof Omit<ScorecardData, 'notes'>, value: number) => {
    if (isHost) {
      setScorecard((prev) => ({
        ...prev,
        [criterion]: value,
      }));
    }
  };

  const handleNotesChange = (text: string) => {
    if (isHost) {
      setScorecard((prev) => ({
        ...prev,
        notes: text,
      }));
    }
  };

  const avgScore =
    (scorecard.problemSolving + scorecard.communication + scorecard.codeQuality) / 3;

  const handleSubmit = () => {
    if (isHost && scorecard.problemSolving > 0) {
      onSubmitScorecard(scorecard);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white mb-2">Interview Scorecard</h2>
        <p className="text-white/60 text-sm">
          {isHost ? 'Rate the candidate on each criterion' : 'Waiting for host to complete scorecard'}
        </p>
      </div>

      {/* Overall Score */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-2">Overall Score</p>
          <div className="text-5xl font-bold text-white mb-2">
            {avgScore.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  'w-5 h-5',
                  i <= Math.round(avgScore)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-white/20'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Rating Criteria */}
      <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
        {CRITERIA.map((criterion) => {
          const value = scorecard[criterion.id as keyof Omit<ScorecardData, 'notes'>];

          return (
            <div key={criterion.id}>
              <div className="mb-4">
                <h3 className="font-bold text-white mb-1">{criterion.label}</h3>
                <p className="text-sm text-white/60">{criterion.description}</p>
              </div>

              {/* Star Rating */}
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      handleRatingChange(criterion.id as keyof Omit<ScorecardData, 'notes'>, rating)
                    }
                    disabled={!isHost}
                    className={cn(
                      'relative group transition-all duration-200',
                      !isHost && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <Star
                      className={cn(
                        'w-8 h-8 transition-all duration-200',
                        rating <= value
                          ? 'fill-yellow-400 text-yellow-400 scale-110'
                          : 'text-white/30 hover:text-yellow-400 hover:scale-110'
                      )}
                    />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-white/10 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm">
                      {rating}/5
                    </span>
                  </button>
                ))}
              </div>

              {value > 0 && (
                <p className="text-sm text-yellow-400 mt-2">{value} / 5</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="px-6 py-6 border-t border-white/10">
        <label className="block text-white font-bold mb-3">Feedback Notes</label>
        <textarea
          value={scorecard.notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          disabled={!isHost}
          placeholder={isHost ? 'Add detailed feedback for the candidate...' : 'Waiting for host...'}
          className={cn(
            'w-full p-4 rounded-lg resize-none h-24',
            'bg-white/5 border border-white/10 text-white placeholder-white/40',
            'focus:outline-none focus:border-blue-500',
            !isHost && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>

      {/* Actions */}
      {isHost && (
        <div className="px-6 py-6 border-t border-white/10">
          <button
            onClick={handleSubmit}
            disabled={scorecard.problemSolving === 0}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium',
              'transition-all duration-200',
              scorecard.problemSolving > 0
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-white/5 text-white/50 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
            Submit Scorecard
          </button>

          <p className="text-xs text-white/50 text-center mt-3">
            This will be saved and shared with the candidate
          </p>
        </div>
      )}
    </div>
  );
};

export default ScorecardPanel;
