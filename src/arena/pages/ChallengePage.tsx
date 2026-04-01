/**
 * @file ChallengePage.tsx
 * @description Single challenge detail page with registration flow
 * @module arena/pages
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, CheckCircle, BookOpen, Calendar, ArrowLeft, Star, Zap } from 'lucide-react';

const ChallengePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedTier, setSelectedTier] = useState<'standard' | 'premium'>('standard');

  // Mock challenge data
  const challenge = {
    title: 'React JS Mastery',
    description: 'Master React from fundamentals to advanced patterns. Build production-grade applications, learn state management, testing, and deployment.',
    skillCategory: 'Frontend Development',
    difficultyLevel: 'intermediate',
    durationOptions: [30, 60, 90],
    registrationFee: 99,
    premiumFee: 299,
    prizePool: { first: 4000, second: 2000 },
    totalRegistrations: 156,
    registrationDeadline: Date.now() + 7 * 86400000,
    syllabus: [
      { week: 1, topics: ['React Fundamentals', 'JSX & Components', 'Props & State'], resources: ['Official Docs', 'Video Course'] },
      { week: 2, topics: ['Hooks Deep Dive', 'useEffect Patterns', 'Custom Hooks'], resources: ['React.dev', 'Practice Problems'] },
      { week: 3, topics: ['State Management', 'Context API', 'React Query'], resources: ['TanStack Docs', 'Mini Project'] },
      { week: 4, topics: ['Testing', 'Performance', 'Final Project'], resources: ['Testing Library Docs', 'Project Template'] },
    ],
    examConfig: { mcqCount: 30, shortAnswerCount: 5, projectMarks: 40, passMark: 50, durationMinutes: 120 },
  };

  return (
    <div className="min-h-screen bg-arena-black p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate('/arena/challenges')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Challenges
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="px-3 py-1 rounded-full text-xs font-medium text-arena-blue bg-arena-blue/10 border border-arena-blue/20">
                {challenge.difficultyLevel}
              </span>
              <h1 className="font-display text-4xl font-bold text-foreground mt-4 mb-2">{challenge.title}</h1>
              <p className="text-muted-foreground">{challenge.description}</p>
            </motion.div>

            {/* Syllabus */}
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Syllabus
              </h2>
              {challenge.syllabus.map((week) => (
                <div key={week.week} className="arena-card p-5">
                  <h3 className="font-display text-sm font-bold text-primary mb-3">Week {week.week}</h3>
                  <div className="space-y-2">
                    {week.topics.map(topic => (
                      <div key={topic} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-arena-green" /> {topic}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {week.resources.map(r => (
                      <span key={r} className="px-2 py-0.5 bg-secondary rounded text-xs text-muted-foreground">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Exam info */}
            <div className="arena-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Exam Structure</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{challenge.examConfig.mcqCount}</p>
                  <p className="text-xs text-muted-foreground">MCQ Questions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{challenge.examConfig.shortAnswerCount}</p>
                  <p className="text-xs text-muted-foreground">Short Answers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{challenge.examConfig.projectMarks}</p>
                  <p className="text-xs text-muted-foreground">Project Marks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{challenge.examConfig.durationMinutes}m</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Registration */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="arena-card p-6 sticky top-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Register Now</h3>

              {/* Prize pool */}
              <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-primary">₹{(challenge.prizePool.first + challenge.prizePool.second).toLocaleString()} Prize Pool</p>
                  <p className="text-xs text-muted-foreground">1st: ₹{challenge.prizePool.first.toLocaleString()} | 2nd: ₹{challenge.prizePool.second.toLocaleString()}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">Duration</label>
                <div className="flex gap-2">
                  {challenge.durationOptions.map(d => (
                    <button key={d} onClick={() => setSelectedDuration(d)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDuration === d ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier */}
              <div className="mb-6 space-y-2">
                <label className="text-xs text-muted-foreground mb-2 block">Plan</label>
                <button onClick={() => setSelectedTier('standard')} className={`w-full p-3 rounded-xl text-left border transition-colors ${selectedTier === 'standard' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Standard</span>
                    <span className="text-sm font-bold text-primary">₹{challenge.registrationFee}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Syllabus access + exam + certificate</p>
                </button>
                <button onClick={() => setSelectedTier('premium')} className={`w-full p-3 rounded-xl text-left border transition-colors ${selectedTier === 'premium' ? 'border-arena-orange bg-arena-orange/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground flex items-center gap-1"><Star className="w-3 h-3 text-arena-orange" /> Premium</span>
                    <span className="text-sm font-bold text-arena-orange">₹{challenge.premiumFee}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Everything + mentor support + placement priority</p>
                </button>
              </div>

              <button className="arena-btn-primary w-full py-3 text-sm font-bold">
                Register — ₹{selectedTier === 'standard' ? challenge.registrationFee : challenge.premiumFee}
              </button>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Users className="w-3 h-3" /> {challenge.totalRegistrations} already registered
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
