import { useState } from 'react';
import { Plus, X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
    difficulty: 'easy',
    category: 'Array',
  },
  {
    id: '2',
    title: 'Binary Tree Traversal',
    description: 'Implement inorder, preorder, and postorder traversal of a binary tree.',
    difficulty: 'medium',
    category: 'Tree',
  },
  {
    id: '3',
    title: 'Longest Palindromic Substring',
    description: 'Given a string s, return the longest palindromic substring in s.',
    difficulty: 'medium',
    category: 'String',
  },
  {
    id: '4',
    title: 'Edit Distance (Levenshtein)',
    description: 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.',
    difficulty: 'hard',
    category: 'Dynamic Programming',
  },
  {
    id: '5',
    title: 'Median of Two Sorted Arrays',
    description: 'Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.',
    difficulty: 'hard',
    category: 'Array',
  },
];

interface QuestionPanelProps {
  selectedQuestion: string | null;
  onSelectQuestion: (id: string | null) => void;
  isHost: boolean;
}

const DIFFICULTY_COLORS = {
  easy: 'text-green-400 bg-green-500/10 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  hard: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const QuestionPanel = ({
  selectedQuestion,
  onSelectQuestion,
  isHost,
}: QuestionPanelProps) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const selected = SAMPLE_QUESTIONS.find((q) => q.id === selectedQuestion);

  const handleAddCustom = () => {
    if (customQuestion.trim()) {
      // In production, save to database
      setCustomQuestion('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Question List */}
      <div className="w-64 flex flex-col border-r border-white/10 bg-white/5 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="font-bold text-white mb-2">Questions</h3>
          {isHost && (
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium',
                'transition-colors duration-200',
                showCustomInput
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/80'
              )}
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          )}
        </div>

        {/* Custom Input */}
        {showCustomInput && isHost && (
          <div className="p-3 border-b border-white/10">
            <textarea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Paste or type a custom question..."
              className={cn(
                'w-full p-2 rounded text-xs resize-none',
                'bg-white/5 border border-white/10 text-white',
                'placeholder-white/40 focus:outline-none focus:border-blue-500'
              )}
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddCustom}
                className="flex-1 px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomQuestion('');
                }}
                className="flex-1 px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2 p-3">
            {SAMPLE_QUESTIONS.map((question) => (
              <button
                key={question.id}
                onClick={() => onSelectQuestion(question.id)}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-all duration-200',
                  'border hover:border-white/20 hover:bg-white/10',
                  selectedQuestion === question.id
                    ? 'bg-blue-600/20 border-blue-500/50'
                    : 'bg-white/5 border-white/10'
                )}
              >
                <p className="text-sm font-medium text-white truncate">
                  {question.title}
                </p>
                <p className="text-xs text-white/50 mt-1 truncate">
                  {question.category}
                </p>
                <div className={cn(
                  'text-xs mt-2 px-2 py-0.5 rounded w-fit border',
                  DIFFICULTY_COLORS[question.difficulty]
                )}>
                  {question.difficulty}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Header */}
            <div className="px-4 py-4 border-b border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selected.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'text-xs px-3 py-1 rounded-full border font-medium',
                      DIFFICULTY_COLORS[selected.difficulty]
                    )}>
                      {selected.difficulty}
                    </span>
                    <span className="text-xs text-white/60 bg-white/5 px-3 py-1 rounded-full">
                      {selected.category}
                    </span>
                  </div>
                </div>
                {isHost && (
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-white/80 leading-relaxed">
                  {selected.description}
                </p>
              </div>

              {/* Example (placeholder) */}
              <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-bold text-white mb-3">Example:</h4>
                <div className="bg-black/50 p-3 rounded font-mono text-sm text-white/70">
                  <pre>{`Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9`}</pre>
                </div>
              </div>

              {/* Constraints (placeholder) */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <h4 className="font-bold text-white mb-3">Constraints:</h4>
                <ul className="text-white/70 text-sm space-y-2 list-disc list-inside">
                  <li>2 &lt;= nums.length &lt;= 10^4</li>
                  <li>-10^9 &lt;= nums[i] &lt;= 10^9</li>
                  <li>-10^9 &lt;= target &lt;= 10^9</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/50">
            <div className="text-center">
              <p className="text-lg mb-2">Select a question to get started</p>
              <p className="text-sm">or add a custom question</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
