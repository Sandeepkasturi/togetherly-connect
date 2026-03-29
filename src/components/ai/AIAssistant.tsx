import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  spaceId: string;
  context?: 'study' | 'interview';
  onClose?: () => void;
  isOpen?: boolean;
}

const AIAssistant = ({
  spaceId,
  context = 'study',
  onClose,
  isOpen = true,
}: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm @together AI. I can help you with ${context === 'interview' ? 'interview prep, code review, and performance feedback.' : 'studying, explaining concepts, and summarizing notes.'}`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response - will integrate with Gemini API in Phase 5b
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${input}". In a production environment, I would analyze your ${context} context and provide personalized feedback using Gemini 2.5 Flash API.

For now, this is a placeholder response. Features coming in Phase 5:
- Real-time AI feedback on interview performance
- Code quality analysis and suggestions
- Study notes summarization
- Personalized learning recommendations`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-white">@together AI</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' && 'flex-row-reverse'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={cn(
                'max-w-xs px-4 py-2 rounded-lg',
                message.role === 'assistant'
                  ? 'bg-white/10 text-white/90'
                  : 'bg-blue-600/30 text-white border border-blue-500/30'
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className="text-xs text-white/40 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Loader className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-white/10 text-white/90 px-4 py-2 rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-white/10 space-y-2">
          <p className="text-xs text-white/60">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {context === 'interview'
              ? [
                  { label: 'Review my code', action: 'review_code' },
                  { label: 'Interview tips', action: 'tips' },
                ]
              : [
                  { label: 'Explain concept', action: 'explain' },
                  { label: 'Summarize notes', action: 'summarize' },
                ]
            }
            .map((action) => (
              <button
                key={action.action}
                onClick={() => setInput(action.label)}
                className="text-xs px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-sm',
              'bg-white/5 border border-white/10 text-white placeholder-white/40',
              'focus:outline-none focus:border-blue-500/50 focus:bg-white/10',
              'transition-all duration-200',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              isLoading || !input.trim()
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-white/40 mt-2">
          Premium feature. Powered by Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
