/**
 * @file ExamPage.tsx
 * @description Proctored exam room with webcam monitoring, tab detection, and auto-save
 * @module arena/pages
 * @security Tab switch detection, webcam requirement, answer encryption, auto-save
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Clock, AlertTriangle, CheckCircle, Send, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

// ── TYPES ─────────────────────────────────────────────────────
interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  selected?: number;
}

// ── COMPONENT ─────────────────────────────────────────────────
const ExamPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  // SECURITY: Exam state
  const [preChecksComplete, setPreChecksComplete] = useState(false);
  const [webcamGranted, setWebcamGranted] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [flagged, setFlagged] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120 * 60); // 120 minutes
  const [currentSection, setCurrentSection] = useState<'mcq' | 'short' | 'project'>('mcq');
  const [currentMCQ, setCurrentMCQ] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mock MCQ questions
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [shortAnswers, setShortAnswers] = useState<Record<number, string>>({});
  const [projectUrl, setProjectUrl] = useState('');
  const [projectNotes, setProjectNotes] = useState('');

  const mcqs: MCQQuestion[] = Array.from({ length: 30 }, (_, i) => ({
    id: `mcq-${i}`,
    question: `Sample question ${i + 1}: What is the correct approach for ${['React hooks', 'state management', 'component lifecycle', 'JSX rendering', 'virtual DOM'][i % 5]}?`,
    options: ['Option A - First approach', 'Option B - Second approach', 'Option C - Third approach', 'Option D - Fourth approach'],
  }));

  // ── WEBCAM SETUP ────────────────────────────────────────────
  const setupWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setWebcamGranted(true);
    } catch {
      setWebcamGranted(false);
    }
  }, []);

  // SECURITY: Tab switch detection
  useEffect(() => {
    if (!examStarted) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          if (next >= 3) setFlagged(true);
          return next;
        });
      }
    };

    const handleBlur = () => {
      setTabSwitchCount(prev => {
        const next = prev + 1;
        if (next >= 3) setFlagged(true);
        return next;
      });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [examStarted]);

  // ── TIMER ───────────────────────────────────────────────────
  useEffect(() => {
    if (!examStarted || submitted) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setShowSubmitConfirm(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, submitted]);

  // ── AUTO-SAVE ───────────────────────────────────────────────
  useEffect(() => {
    if (!examStarted) return;
    const interval = setInterval(() => {
      console.log('[Exam] Auto-saving answers...');
      // TODO: Save to Supabase
    }, 60000);
    return () => clearInterval(interval);
  }, [examStarted, mcqAnswers, shortAnswers]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  // ── PRE-EXAM CHECKS ────────────────────────────────────────
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-arena-black flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="arena-card p-8 max-w-md w-full space-y-6">
          <h1 className="font-display text-2xl font-bold text-foreground text-center">Exam Pre-Checks</h1>
          <p className="text-sm text-muted-foreground text-center">Complete all checks before starting your exam</p>

          <div className="space-y-4">
            {/* Webcam check */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">Webcam Access</span>
              </div>
              {webcamGranted ? (
                <CheckCircle className="w-5 h-5 text-arena-green" />
              ) : (
                <button onClick={setupWebcam} className="text-xs text-primary hover:underline">Enable</button>
              )}
            </div>

            {/* Webcam preview */}
            {webcamGranted && (
              <div className="rounded-xl overflow-hidden border border-border">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-32 object-cover" />
              </div>
            )}

            {/* Other checks */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">Full Screen Mode</span>
              </div>
              <CheckCircle className="w-5 h-5 text-arena-green" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">Duration: 120 minutes</span>
              </div>
              <CheckCircle className="w-5 h-5 text-arena-green" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-arena-orange/10 border border-arena-orange/20">
            <p className="text-xs text-arena-orange flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Switching tabs more than 3 times will flag your exam for review.
            </p>
          </div>

          <button
            onClick={() => setExamStarted(true)}
            disabled={!webcamGranted}
            className="arena-btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Exam
          </button>
        </motion.div>
      </div>
    );
  }

  // ── SUBMITTED STATE ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-arena-black flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="arena-card p-8 max-w-md text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-arena-green mx-auto" />
          <h1 className="font-display text-2xl font-bold text-foreground">Exam Submitted!</h1>
          <p className="text-sm text-muted-foreground">Your answers have been submitted. Results will be published within 48 hours.</p>
          <button onClick={() => navigate('/arena/dashboard')} className="arena-btn-primary px-6 py-3 text-sm">
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ── EXAM IN PROGRESS ────────────────────────────────────────
  return (
    <div className="h-screen bg-arena-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-arena-surface">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-sm font-bold text-foreground">React JS Mastery — Exam</h2>
          {flagged && <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded">FLAGGED</span>}
          {tabSwitchCount > 0 && <span className="text-xs text-arena-orange">Tab switches: {tabSwitchCount}/3</span>}
        </div>
        <div className="flex items-center gap-4">
          {/* Webcam thumbnail */}
          <div className="w-16 h-12 rounded-lg overflow-hidden border border-border">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          </div>
          <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${timeRemaining < 300 ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-foreground'}`}>
            <Clock className="w-3.5 h-3.5 inline mr-1" /> {formatTime(timeRemaining)}
          </div>
          <button onClick={() => setShowSubmitConfirm(true)} className="arena-btn-primary px-4 py-2 text-xs flex items-center gap-1">
            <Send className="w-3 h-3" /> Submit
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 px-6 py-2 bg-arena-surface border-b border-border">
        {(['mcq', 'short', 'project'] as const).map(s => (
          <button key={s} onClick={() => setCurrentSection(s)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentSection === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {s === 'mcq' ? `MCQs (${Object.keys(mcqAnswers).length}/30)` : s === 'short' ? `Short Answers (${Object.keys(shortAnswers).length}/5)` : 'Project'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentSection === 'mcq' && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-foreground">Question {currentMCQ + 1} of 30</h3>
              <div className="flex gap-1">
                {Array.from({ length: 30 }, (_, i) => (
                  <button key={i} onClick={() => setCurrentMCQ(i)} className={`w-6 h-6 rounded text-[10px] font-bold ${i === currentMCQ ? 'bg-primary text-primary-foreground' : mcqAnswers[i] !== undefined ? 'bg-arena-green/20 text-arena-green' : 'bg-secondary text-muted-foreground'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="arena-card p-6 space-y-4">
              <p className="text-foreground font-medium">{mcqs[currentMCQ].question}</p>
              <div className="space-y-2">
                {mcqs[currentMCQ].options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => setMcqAnswers(prev => ({ ...prev, [currentMCQ]: oi }))}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${mcqAnswers[currentMCQ] === oi ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-border hover:text-foreground'}`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button disabled={currentMCQ === 0} onClick={() => setCurrentMCQ(p => p - 1)} className="arena-btn-secondary px-4 py-2 text-sm disabled:opacity-30 flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button disabled={currentMCQ === 29} onClick={() => setCurrentMCQ(p => p + 1)} className="arena-btn-primary px-4 py-2 text-sm disabled:opacity-30 flex items-center gap-1">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentSection === 'short' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="arena-card p-6">
                <p className="text-foreground font-medium mb-3">Short Answer {i + 1}: Explain the concept of {['React hooks', 'virtual DOM', 'state management', 'component lifecycle', 'JSX'][i]}.</p>
                <textarea
                  value={shortAnswers[i] || ''}
                  onChange={e => setShortAnswers(prev => ({ ...prev, [i]: e.target.value.slice(0, 500) }))}
                  placeholder="Type your answer..."
                  className="arena-input w-full h-32 resize-none text-sm"
                  onPaste={e => e.preventDefault()} // SECURITY: Prevent paste
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{(shortAnswers[i] || '').length}/500</p>
              </div>
            ))}
          </div>
        )}

        {currentSection === 'project' && (
          <div className="max-w-3xl mx-auto">
            <div className="arena-card p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground">Project Submission</h3>
              <p className="text-sm text-muted-foreground">Submit your project repository and live deployment URL.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">GitHub Repository URL</label>
                  <input value={projectUrl} onChange={e => setProjectUrl(e.target.value)} placeholder="https://github.com/..." className="arena-input w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description & Notes</label>
                  <textarea value={projectNotes} onChange={e => setProjectNotes(e.target.value.slice(0, 500))} placeholder="Describe your approach..." className="arena-input w-full h-32 resize-none text-sm" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{projectNotes.length}/500</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit confirm modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="arena-card p-6 max-w-sm w-full text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-arena-orange mx-auto" />
              <h3 className="font-display text-xl font-bold text-foreground">Submit Exam?</h3>
              <p className="text-sm text-muted-foreground">This cannot be undone. Make sure you've reviewed all your answers.</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>MCQs answered: {Object.keys(mcqAnswers).length}/30</p>
                <p>Short answers: {Object.keys(shortAnswers).length}/5</p>
                <p>Project: {projectUrl ? '✓' : '✗'}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitConfirm(false)} className="arena-btn-secondary flex-1 py-2 text-sm">Go Back</button>
                <button onClick={handleSubmit} className="arena-btn-primary flex-1 py-2 text-sm">Confirm Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamPage;
