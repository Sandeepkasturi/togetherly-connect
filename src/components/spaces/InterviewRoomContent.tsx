import { useState } from 'react';
import CodeEditorPanel from './interview/CodeEditorPanel';
import QuestionPanel from './interview/QuestionPanel';
import ScorecardPanel from './interview/ScorecardPanel';
import { cn } from '@/lib/utils';

type ActiveTool = 'code' | 'questions' | 'score' | 'call' | null;

interface InterviewRoomContentProps {
  spaceId: string;
  activeTool: ActiveTool;
  isHost: boolean;
}

const InterviewRoomContent = ({
  spaceId,
  activeTool,
  isHost,
}: InterviewRoomContentProps) => {
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState<'javascript' | 'python' | 'java' | 'cpp' | 'go' | 'rust'>('javascript');
  const [executionResult, setExecutionResult] = useState<{ output: string; error?: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showScorecard, setShowScorecard] = useState(false);

  const renderContent = () => {
    switch (activeTool) {
      case 'code':
        return (
          <CodeEditorPanel
            code={code}
            onCodeChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            executionResult={executionResult}
            isExecuting={isExecuting}
            onExecute={async () => {
              setIsExecuting(true);
              // Judge0 integration would happen here
              setTimeout(() => {
                setExecutionResult({
                  output: 'Output will appear here after execution',
                });
                setIsExecuting(false);
              }, 2000);
            }}
          />
        );
      case 'questions':
        return (
          <QuestionPanel
            selectedQuestion={selectedQuestion}
            onSelectQuestion={setSelectedQuestion}
            isHost={isHost}
          />
        );
      case 'score':
        return (
          <ScorecardPanel
            isHost={isHost}
            onSubmitScorecard={() => setShowScorecard(false)}
          />
        );
      case 'call':
        return (
          <div className="flex items-center justify-center h-full text-white/50">
            Video call interface coming soon
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/50">
              <p className="text-lg mb-2">Select a tool from the toolbar</p>
              <p className="text-sm">Code Editor, Questions, Scorecard, or Call</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default InterviewRoomContent;
