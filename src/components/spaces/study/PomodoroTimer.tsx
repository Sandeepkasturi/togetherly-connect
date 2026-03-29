import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

const WORK_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

interface PomodoroTimerProps {
  spaceId: string;
  isHost: boolean;
}

type TimerState = 'work' | 'break' | 'paused';

const PomodoroTimer = ({ spaceId, isHost }: PomodoroTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Auto timer effect
  useEffect(() => {
    if (!isRunning || !isHost) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
          if (soundEnabled) {
            playSound();
          }
          // Switch to next state
          if (timerState === 'work') {
            setTimerState('break');
            return BREAK_DURATION;
          } else {
            setTimerState('work');
            setSessionsCompleted((s) => s + 1);
            return WORK_DURATION;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timerState, isHost, soundEnabled]);

  const playSound = () => {
    // Simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isHost) {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    if (isHost) {
      setIsRunning(false);
      setTimeLeft(timerState === 'work' ? WORK_DURATION : BREAK_DURATION);
    }
  };

  const handleSwitchState = (newState: TimerState) => {
    if (isHost) {
      setIsRunning(false);
      setTimerState(newState);
      setTimeLeft(newState === 'work' ? WORK_DURATION : BREAK_DURATION);
    }
  };

  const progress = (timerState === 'work' ? WORK_DURATION - timeLeft : BREAK_DURATION - timeLeft) / 
                   (timerState === 'work' ? WORK_DURATION : BREAK_DURATION);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      {/* Timer Display */}
      <div className="relative w-64 h-64">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/10"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${progress * 283} 283`}
            strokeLinecap="round"
            className={cn(
              'text-white transition-all duration-300',
              timerState === 'work' ? 'text-blue-500' : 'text-green-500'
            )}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn(
            'text-6xl font-bold font-mono',
            timerState === 'work' ? 'text-blue-400' : 'text-green-400'
          )}>
            {formatTime(timeLeft)}
          </div>
          <div className={cn(
            'text-sm font-medium mt-2',
            timerState === 'work' ? 'text-blue-300' : 'text-green-300'
          )}>
            {timerState === 'work' ? 'Focus Time' : 'Break Time'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          disabled={!isHost}
          className={cn(
            'p-4 rounded-full transition-all duration-200',
            isHost
              ? isRunning
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-blue-600 hover:bg-blue-700'
              : 'bg-white/5 opacity-50 cursor-not-allowed',
            'text-white'
          )}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={handleReset}
          disabled={!isHost}
          className={cn(
            'p-4 rounded-full transition-all duration-200',
            isHost
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-white/5 opacity-50 cursor-not-allowed',
            'text-white'
          )}
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            'p-4 rounded-full transition-all duration-200',
            soundEnabled ? 'bg-white/10 text-white' : 'bg-white/5 text-white/50'
          )}
        >
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      {/* Quick Switch */}
      <div className="flex gap-4">
        <button
          onClick={() => handleSwitchState('work')}
          disabled={!isHost}
          className={cn(
            'px-6 py-3 rounded-lg font-medium transition-all duration-200',
            timerState === 'work' && isHost
              ? 'bg-blue-600 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10',
            !isHost && 'opacity-50 cursor-not-allowed'
          )}
        >
          Work
        </button>
        <button
          onClick={() => handleSwitchState('break')}
          disabled={!isHost}
          className={cn(
            'px-6 py-3 rounded-lg font-medium transition-all duration-200',
            timerState === 'break' && isHost
              ? 'bg-green-600 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10',
            !isHost && 'opacity-50 cursor-not-allowed'
          )}
        >
          Break
        </button>
      </div>

      {/* Sessions Count */}
      <div className="text-center">
        <p className="text-white/60 text-sm mb-2">Sessions Completed</p>
        <p className="text-4xl font-bold text-white">{sessionsCompleted}</p>
      </div>

      {/* Info */}
      <div className="text-center text-xs text-white/50 max-w-xs">
        <p>Host controls the timer. All participants see the same countdown.</p>
      </div>
    </div>
  );
};

export default PomodoroTimer;
