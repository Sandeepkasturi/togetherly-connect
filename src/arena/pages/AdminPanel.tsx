/**
 * @file AdminPanel.tsx
 * @description Admin panel for challenge management, user oversight, and platform settings
 * @module arena/pages
 * @security Role: admin required
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Trophy, Settings, BarChart3, Plus, Search, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'users' | 'placements' | 'settings'>('overview');

  return (
    <div className="min-h-screen bg-arena-black p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-6 h-6 text-arena-orange" />
            <h1 className="font-display text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-8">Manage challenges, users, and platform settings</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Users', value: '1,247', icon: Users },
            { label: 'Active Challenges', value: '6', icon: Trophy },
            { label: 'Exams Today', value: '14', icon: BarChart3 },
            { label: 'Flagged Exams', value: '3', icon: AlertTriangle },
            { label: 'Revenue', value: '₹1.2L', icon: Settings },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="arena-card p-4">
              <s.icon className="w-4 h-4 text-muted-foreground mb-2" />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {(['overview', 'challenges', 'users', 'placements', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="arena-card p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Flagged Exam Sessions</h3>
              <div className="space-y-3">
                {[
                  { user: 'user_42', reason: 'Excessive tab switching (5)', challenge: 'React Mastery' },
                  { user: 'user_89', reason: 'Webcam disconnected', challenge: 'Python Full Stack' },
                  { user: 'user_156', reason: 'Suspicious answer similarity', challenge: 'DSA Mastery' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">{f.user}</p>
                      <p className="text-xs text-muted-foreground">{f.reason} — {f.challenge}</p>
                    </div>
                    <button className="text-xs text-primary hover:underline">Review</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="arena-card p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Recent Registrations</h3>
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">User #{1240 + i}</span>
                    <span className="text-muted-foreground">React Mastery</span>
                    <span className="text-xs text-arena-green">₹99 paid</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-foreground">All Challenges</h2>
              <button className="arena-btn-primary px-4 py-2 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Create Challenge</button>
            </div>
            {['React JS Mastery', 'Python Full Stack', 'UI/UX Design Sprint', 'DSA & Problem Solving'].map((c, i) => (
              <div key={c} className="arena-card p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-foreground">{c}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{100 + i * 30} registrations · {['active', 'active', 'draft', 'active'][i]}</p>
                </div>
                <div className="flex gap-2">
                  <button className="arena-btn-secondary px-3 py-1.5 text-xs">Edit</button>
                  <button className="arena-btn-secondary px-3 py-1.5 text-xs"><Eye className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'placements' || activeTab === 'settings') && (
          <div className="arena-card p-10 text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="font-display text-lg font-bold text-foreground">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h3>
            <p className="text-sm text-muted-foreground mt-2">This section will be fully functional once the database is connected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
