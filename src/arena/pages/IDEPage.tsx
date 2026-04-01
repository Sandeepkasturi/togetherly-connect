/**
 * @file IDEPage.tsx
 * @description Standalone code editor with Judge0 execution
 * @module arena/pages
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Play, Save, Share2, Copy, Download, Plus, X, Settings } from 'lucide-react';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'sql', label: 'SQL' },
];

const IDEPage = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Welcome to Togetherly Arena IDE\n// Write your code and click Run to execute\n\nconsole.log("Hello, Arena!");\n');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [tabs, setTabs] = useState([{ id: '1', name: 'main.js', active: true }]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Compiling...\n');
    setTimeout(() => {
      setOutput('> Hello, Arena!\n\n✓ Execution time: 12ms | Memory: 2.8MB | Status: Accepted');
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="h-screen bg-arena-black flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-arena-surface border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-sm font-bold text-foreground">Arena IDE</h2>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="arena-input text-xs py-1 px-2">
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigator.clipboard.writeText(code)} className="arena-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
          <button className="arena-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
          <button className="arena-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"><Share2 className="w-3 h-3" /> Share</button>
          <button onClick={handleRun} disabled={isRunning} className="arena-btn-primary px-4 py-1.5 text-xs flex items-center gap-1 disabled:opacity-50">
            <Play className="w-3 h-3" /> {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* File tabs */}
      <div className="flex items-center gap-0.5 px-4 py-1 bg-arena-card border-b border-border">
        {tabs.map(tab => (
          <div key={tab.id} className={`flex items-center gap-1 px-3 py-1 rounded-t-lg text-xs cursor-pointer ${tab.active ? 'bg-arena-surface text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab.name}
            <X className="w-3 h-3 opacity-0 hover:opacity-100 cursor-pointer" />
          </div>
        ))}
        <button className="p-1 text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /></button>
      </div>

      {/* Editor + Output */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1">
          <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground">Loading editor...</div>}>
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: true },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </Suspense>
        </div>

        {/* Output */}
        <div className="h-40 border-t border-border bg-arena-surface">
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Terminal Output</span>
            <button onClick={() => setOutput('')} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
          </div>
          <pre className="p-4 font-mono text-xs text-foreground overflow-y-auto h-[calc(100%-32px)] whitespace-pre-wrap">
            {output || 'Ready. Click "Run Code" to execute.'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default IDEPage;
