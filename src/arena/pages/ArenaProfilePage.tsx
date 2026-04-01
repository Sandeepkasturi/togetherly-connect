/**
 * @file ArenaProfilePage.tsx
 * @description User profile page for Arena
 * @module arena/pages
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { motion } from 'framer-motion';
import { User, Award, Trophy, BookOpen, Calendar, Edit, ExternalLink } from 'lucide-react';

const ArenaProfilePage = () => {
  return (
    <div className="min-h-screen bg-arena-black p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile header */}
          <div className="arena-card p-8 flex items-start gap-6 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">Arena User</h1>
                  <p className="text-sm text-muted-foreground">user@example.com</p>
                </div>
                <button className="arena-btn-secondary px-4 py-2 text-sm flex items-center gap-1">
                  <Edit className="w-3 h-3" /> Edit Profile
                </button>
              </div>
              <div className="flex gap-6 mt-4">
                <div><span className="text-lg font-bold text-foreground">2</span><span className="text-xs text-muted-foreground ml-1">Challenges</span></div>
                <div><span className="text-lg font-bold text-foreground">1</span><span className="text-xs text-muted-foreground ml-1">Certificates</span></div>
                <div><span className="text-lg font-bold text-foreground">#12</span><span className="text-xs text-muted-foreground ml-1">Best Rank</span></div>
              </div>
            </div>
          </div>

          {/* Certificates */}
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Certificates
          </h2>
          <div className="arena-card p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">DSA & Problem Solving</p>
                <p className="text-xs text-muted-foreground mt-1">Score: 87/100 · Grade: A · Rank #12</p>
              </div>
              <button className="arena-btn-primary px-4 py-2 text-xs flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View Certificate
              </button>
            </div>
          </div>

          {/* Activity */}
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { icon: BookOpen, text: 'Completed Week 3 of React JS Mastery', date: '2 days ago' },
              { icon: Trophy, text: 'Ranked #12 in DSA Challenge', date: '1 week ago' },
              { icon: Calendar, text: 'Registered for Python Full Stack', date: '2 weeks ago' },
            ].map((a, i) => (
              <div key={i} className="arena-card p-4 flex items-center gap-3">
                <a.icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ArenaProfilePage;
