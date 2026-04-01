/**
 * @file ChallengesPage.tsx
 * @description Browse all active skill challenges with filters
 * @module arena/pages
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, Zap, Code2, Palette, Brain, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── TYPES ─────────────────────────────────────────────────────
interface Challenge {
  id: string;
  slug: string;
  title: string;
  skillCategory: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  durationOptions: number[];
  registrationFee: number;
  premiumFee: number;
  prizePool: { first: number; second: number };
  totalRegistrations: number;
  registrationDeadline: number;
  status: string;
}

// ── MOCK DATA ─────────────────────────────────────────────────
const mockChallenges: Challenge[] = [
  { id: '1', slug: 'react-mastery', title: 'React JS Mastery', skillCategory: 'Frontend', difficultyLevel: 'intermediate', durationOptions: [30, 60, 90], registrationFee: 99, premiumFee: 299, prizePool: { first: 4000, second: 2000 }, totalRegistrations: 156, registrationDeadline: Date.now() + 7 * 86400000, status: 'active' },
  { id: '2', slug: 'python-fullstack', title: 'Python Full Stack', skillCategory: 'Backend', difficultyLevel: 'intermediate', durationOptions: [30, 60, 90], registrationFee: 99, premiumFee: 299, prizePool: { first: 4000, second: 2000 }, totalRegistrations: 89, registrationDeadline: Date.now() + 14 * 86400000, status: 'active' },
  { id: '3', slug: 'uiux-design', title: 'UI/UX Design Sprint', skillCategory: 'Design', difficultyLevel: 'beginner', durationOptions: [30, 60], registrationFee: 99, premiumFee: 299, prizePool: { first: 4000, second: 2000 }, totalRegistrations: 67, registrationDeadline: Date.now() + 21 * 86400000, status: 'active' },
  { id: '4', slug: 'dsa-mastery', title: 'DSA & Problem Solving', skillCategory: 'Algorithms', difficultyLevel: 'advanced', durationOptions: [60, 90], registrationFee: 99, premiumFee: 299, prizePool: { first: 4000, second: 2000 }, totalRegistrations: 203, registrationDeadline: Date.now() + 5 * 86400000, status: 'active' },
  { id: '5', slug: 'node-backend', title: 'Node.js Backend Pro', skillCategory: 'Backend', difficultyLevel: 'intermediate', durationOptions: [30, 60, 90], registrationFee: 99, premiumFee: 299, prizePool: { first: 4000, second: 2000 }, totalRegistrations: 112, registrationDeadline: Date.now() + 10 * 86400000, status: 'active' },
  { id: '6', slug: 'ml-fundamentals', title: 'Machine Learning Fundamentals', skillCategory: 'AI/ML', difficultyLevel: 'advanced', durationOptions: [60, 90], registrationFee: 149, premiumFee: 399, prizePool: { first: 5000, second: 3000 }, totalRegistrations: 78, registrationDeadline: Date.now() + 18 * 86400000, status: 'active' },
];

const difficultyColors = {
  beginner: 'text-arena-green bg-arena-green/10 border-arena-green/20',
  intermediate: 'text-arena-blue bg-arena-blue/10 border-arena-blue/20',
  advanced: 'text-arena-orange bg-arena-orange/10 border-arena-orange/20',
};

const categoryIcons: Record<string, any> = {
  Frontend: Code2, Backend: Code2, Design: Palette, Algorithms: Brain, 'AI/ML': Zap,
};

const ChallengesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = mockChallenges.filter(c => {
    if (filter !== 'all' && c.difficultyLevel !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getTimeLeft = (deadline: number) => {
    const diff = deadline - Date.now();
    const days = Math.floor(diff / 86400000);
    return days > 0 ? `${days}d left` : 'Closing soon';
  };

  return (
    <div className="min-h-screen bg-arena-black p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Skill <span className="text-gradient-primary">Challenges</span></h1>
          <p className="text-muted-foreground">Pick a challenge, learn the syllabus, prove yourself in the exam.</p>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search challenges..." className="arena-input w-full pl-10 text-sm" />
          </div>
          <div className="flex gap-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c, i) => {
            const Icon = categoryIcons[c.skillCategory] || Code2;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="arena-card p-6 cursor-pointer"
                onClick={() => navigate(`/arena/challenges/${c.slug}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${difficultyColors[c.difficultyLevel]}`}>
                    {c.difficultyLevel}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground mb-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{c.skillCategory}</p>

                {/* Duration pills */}
                <div className="flex gap-2 mb-4">
                  {c.durationOptions.map(d => (
                    <span key={d} className="px-2.5 py-1 bg-secondary rounded-md text-xs text-muted-foreground">
                      {d}d
                    </span>
                  ))}
                </div>

                {/* Prize + fee */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-primary flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> ₹{(c.prizePool.first + c.prizePool.second).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">₹{c.registrationFee} / ₹{c.premiumFee}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {c.totalRegistrations} registered
                  </span>
                  <span className="text-xs text-arena-accent flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {getTimeLeft(c.registrationDeadline)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;
