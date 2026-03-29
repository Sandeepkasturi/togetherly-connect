import { useState } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'go' | 'rust';

interface CodeEditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  executionResult: { output: string; error?: string } | null;
  isExecuting: boolean;
  onExecute: () => void;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

const CodeEditorPanel = ({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  executionResult,
  isExecuting,
  onExecute,
}: CodeEditorPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Code Editor Side */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-white/60">Language:</label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className={cn(
                'px-3 py-1.5 rounded text-sm',
                'bg-white/5 border border-white/10 text-white',
                'focus:outline-none focus:border-blue-500'
              )}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onExecute}
              disabled={isExecuting}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                'transition-all duration-200',
                isExecuting
                  ? 'bg-blue-600/50 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              )}
            >
              <Play className="w-4 h-4" />
              {isExecuting ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>

        {/* Code Editor Area (Placeholder) */}
        <div className="flex-1 overflow-hidden flex flex-col bg-black/50">
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className={cn(
              'flex-1 w-full p-4 resize-none font-mono text-sm',
              'bg-transparent text-white placeholder-white/40',
              'focus:outline-none',
              'border-none'
            )}
            spellCheck="false"
          />
          <div className="text-xs text-white/40 px-4 py-2 border-t border-white/10">
            Using Monaco Editor (integration ready for Phase 3b)
          </div>
        </div>
      </div>

      {/* Execution Result Side */}
      <div className="w-80 flex flex-col border-l border-white/10 bg-white/5 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="font-bold text-white">Output</h3>
        </div>

        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
          {isExecuting ? (
            <div className="text-white/50">Executing code...</div>
          ) : executionResult ? (
            <div>
              {executionResult.error ? (
                <div className="text-red-400">
                  <p className="font-bold mb-2">Error:</p>
                  <pre className="whitespace-pre-wrap text-xs">{executionResult.error}</pre>
                </div>
              ) : (
                <div className="text-green-400">
                  <pre className="whitespace-pre-wrap text-xs">{executionResult.output}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-white/40">Click "Run Code" to execute</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 text-xs text-white/50 text-center">
          Judge0 API integration ready
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPanel;
