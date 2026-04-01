/**
 * @file LeaderboardPage.tsx
 * @description Public leaderboard per challenge
 * @module arena/pages
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, ExternalLink } from 'lucide-react';

const mockLeaderboard = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  name: ['Arjun Kumar', 'Priya Sharma', 'Rahul Dev', 'Sneha Patel', 'Vikram Singh'][i % 5],
  score: 98 - i * 2 + Math.floor(Math.random() * 3),
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
  internshipEligible: i < 5,
}));

const LeaderboardPage = () => {
  const { challengeId } = useParams();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-arena-black p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Trophy className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-4xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground mt-2">React JS Mastery Challenge</p>
        </motion.div>

        {/* Top 3 podium */}
        <div className="flex items-end justify-center gap-4 mb-10">
          {[1, 0, 2].map(idx => {
            const entry = mockLeaderboard[idx];
            const isFirst = idx === 0;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className={`arena-card p-5 text-center ${isFirst ? 'w-40 pb-8' : 'w-36'} ${isFirst ? 'border-primary/30' : ''}`}>
                <div className="relative inline-block mb-3">
                  <img src={entry.avatar} alt="" className="w-14 h-14 rounded-full border-2 border-border" />
                  <div className="absolute -top-1 -right-1">{getRankIcon(entry.rank)}</div>
                </div>
                <p className="text-sm font-bold text-foreground truncate">{entry.name}</p>
                <p className="text-2xl font-display font-bold text-primary mt-1">{entry.score}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </motion.div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="arena-card overflow-hidden">
          <div className="grid grid-cols-[50px_1fr_100px_100px] gap-4 px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium">
            <span>Rank</span><span>Participant</span><span className="text-right">Score</span><span className="text-right">Status</span>
          </div>
          {mockLeaderboard.map((entry, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="grid grid-cols-[50px_1fr_100px_100px] gap-4 px-5 py-3 border-b border-border last:border-0 items-center hover:bg-secondary/50 transition-colors">
              <div>{getRankIcon(entry.rank)}</div>
              <div className="flex items-center gap-3">
                <img src={entry.avatar} alt="" className="w-8 h-8 rounded-full" />
                <span className="text-sm text-foreground font-medium">{entry.name}</span>
              </div>
              <span className="text-sm font-bold text-primary text-right">{entry.score}</span>
              <div className="text-right">
                {entry.internshipEligible && (
                  <span className="px-2 py-0.5 bg-arena-green/10 text-arena-green text-xs rounded-full">Eligible</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
