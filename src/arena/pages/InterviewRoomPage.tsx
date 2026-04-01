/**
 * @file InterviewRoomPage.tsx
 * @description WebRTC interview room with code editor, whiteboard, and AI assistant
 * @module arena/pages
 * @dependencies usePeer, Monaco Editor, Judge0
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, Phone, MessageSquare, 
  Code2, PenTool, FileText, Play, Clock, Send, Bot, ChevronDown,
  Settings, Copy, Download
} from 'lucide-react';

// Lazy load Monaco Editor for performance
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

// ── TYPES ─────────────────────────────────────────────────────
const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', judge0Id: 63 },
  { id: 'typescript', label: 'TypeScript', judge0Id: 74 },
  { id: 'python', label: 'Python', judge0Id: 71 },
  { id: 'java', label: 'Java', judge0Id: 62 },
  { id: 'cpp', label: 'C++', judge0Id: 54 },
  { id: 'go', label: 'Go', judge0Id: 60 },
  { id: 'rust', label: 'Rust', judge0Id: 73 },
];

const InterviewRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // ── STATE ───────────────────────────────────────────────────
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activePanel, setActivePanel] = useState<'code' | 'whiteboard' | 'notes' | 'questions'>('code');
  const [showChat, setShowChat] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Start coding here\n\nfunction solution() {\n  \n}\n');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ from: string; text: string; isAI?: boolean }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [notes, setNotes] = useState('');
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // ── HANDLERS ────────────────────────────────────────────────
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    // TODO: Proxy through Supabase Edge Function to Judge0
    setTimeout(() => {
      setOutput('> Hello World!\n\nExecution time: 23ms | Memory: 3.2MB');
      setIsRunning(false);
    }, 1500);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMsg = { from: 'You', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);

    // Check for @togetherly command
    if (chatInput.startsWith('@togetherly')) {
      const command = chatInput.replace('@togetherly', '').trim();
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          from: 'Togetherly AI',
          text: `Processing: "${command}"\n\nThis feature connects to AI services for interview assistance. Configure your API keys to enable.`,
          isAI: true,
        }]);
      }, 1000);
    }

    setChatInput('');
  };

  const handleEndSession = () => {
    if (confirm('End this interview session?')) {
      navigate('/arena/dashboard');
    }
  };

  return (
    <div className="h-screen bg-arena-black flex flex-col overflow-hidden">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-arena-surface">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-sm font-bold text-foreground">Interview Room</h2>
          <span className="text-xs text-muted-foreground">#{roomId}</span>
          {isRecording && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Recording
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </span>
          <button onClick={handleEndSession} className="px-3 py-1.5 bg-destructive/20 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/30 transition-colors flex items-center gap-1">
            <Phone className="w-3 h-3" /> End
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video feeds + controls */}
        <div className="w-72 border-r border-border flex flex-col bg-arena-surface">
          {/* Video feeds */}
          <div className="flex-1 p-3 space-y-3">
            {/* Interviewer video */}
            <div className="aspect-video bg-secondary rounded-xl border border-border flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-arena-blue/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-arena-blue">I</span>
                </div>
                <p className="text-xs text-muted-foreground">Interviewer</p>
              </div>
            </div>
            {/* Candidate video */}
            <div className="aspect-video bg-secondary rounded-xl border border-border flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-arena-purple/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-arena-purple">C</span>
                </div>
                <p className="text-xs text-muted-foreground">Candidate</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className={`p-2.5 rounded-xl transition-colors ${isMuted ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-foreground'}`}>
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-2.5 rounded-xl transition-colors ${isVideoOff ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-foreground'}`}>
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsScreenSharing(!isScreenSharing)} className={`p-2.5 rounded-xl transition-colors ${isScreenSharing ? 'bg-arena-green/20 text-arena-green' : 'bg-secondary text-foreground'}`}>
                <Monitor className="w-4 h-4" />
              </button>
              <button onClick={() => setShowChat(!showChat)} className={`p-2.5 rounded-xl transition-colors ${showChat ? 'bg-primary/20 text-primary' : 'bg-secondary text-foreground'}`}>
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Center: Code editor / Whiteboard / Notes */}
        <div className="flex-1 flex flex-col">
          {/* Panel tabs */}
          <div className="flex gap-1 px-4 py-2 bg-arena-surface border-b border-border">
            {[
              { id: 'code' as const, icon: Code2, label: 'Code' },
              { id: 'whiteboard' as const, icon: PenTool, label: 'Whiteboard' },
              { id: 'notes' as const, icon: FileText, label: 'Notes' },
              { id: 'questions' as const, icon: MessageSquare, label: 'Questions' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActivePanel(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${activePanel === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activePanel === 'code' && (
              <>
                {/* Language selector + Run */}
                <div className="flex items-center justify-between px-4 py-2 bg-arena-card border-b border-border">
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="arena-input text-xs py-1 px-2">
                    {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(code)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <button onClick={handleRunCode} disabled={isRunning} className="arena-btn-primary px-3 py-1 text-xs flex items-center gap-1 disabled:opacity-50">
                      <Play className="w-3 h-3" /> {isRunning ? 'Running...' : 'Run'}
                    </button>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1">
                  <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading editor...</div>}>
                    <MonacoEditor
                      height="100%"
                      language={language}
                      value={code}
                      onChange={(v) => setCode(v || '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, monospace',
                        minimap: { enabled: false },
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        renderLineHighlight: 'line',
                        lineNumbers: 'on',
                      }}
                    />
                  </Suspense>
                </div>

                {/* Output panel */}
                <div className="h-32 border-t border-border bg-arena-surface p-3 overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Output</p>
                  <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">{output || 'No output yet. Click Run to execute code.'}</pre>
                </div>
              </>
            )}

            {activePanel === 'whiteboard' && (
              <div className="flex-1 flex items-center justify-center bg-arena-surface">
                <div className="text-center text-muted-foreground">
                  <PenTool className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Collaborative Whiteboard</p>
                  <p className="text-xs mt-1">Canvas drawing with real-time sync coming soon</p>
                </div>
              </div>
            )}

            {activePanel === 'notes' && (
              <div className="flex-1 p-4">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Session notes — visible to both participants..."
                  className="w-full h-full arena-input resize-none text-sm"
                />
              </div>
            )}

            {activePanel === 'questions' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <h3 className="font-display text-sm font-bold text-foreground">Question Bank</h3>
                {[
                  'Explain the difference between useState and useReducer.',
                  'How does React reconciliation work?',
                  'Design a rate limiter system.',
                  'Implement a debounce function from scratch.',
                  'What are the SOLID principles?',
                ].map((q, i) => (
                  <div key={i} className="arena-card p-3 cursor-pointer hover:border-primary/30 transition-colors">
                    <p className="text-sm text-foreground">{q}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat panel (collapsible) */}
        {showChat && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-l border-border flex flex-col bg-arena-surface">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Chat
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Type @togetherly for AI commands</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`text-sm ${msg.isAI ? 'bg-arena-purple/10 border border-arena-purple/20 rounded-xl p-3' : ''}`}>
                  <span className={`font-bold text-xs ${msg.isAI ? 'text-arena-purple' : 'text-primary'}`}>
                    {msg.isAI && <Bot className="w-3 h-3 inline mr-1" />}
                    {msg.from}
                  </span>
                  <p className="text-foreground mt-0.5 whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
              {chatMessages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">No messages yet</p>
              )}
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  placeholder="Message or @togetherly..."
                  className="arena-input flex-1 text-sm py-2"
                />
                <button onClick={handleSendChat} className="arena-btn-primary p-2">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterviewRoomPage;
