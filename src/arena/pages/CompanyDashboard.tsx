/**
 * @file CompanyDashboard.tsx
 * @description Placement partner portal — manage opportunities and candidates
 * @module arena/pages
 * @security Role: company required
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, TrendingUp, Plus, Search, ExternalLink, Eye } from 'lucide-react';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'candidates'>('overview');

  const mockOpportunities = [
    { id: '1', title: 'React Frontend Intern', type: 'internship', applicants: 45, status: 'active', stipend: 15000 },
    { id: '2', title: 'Full Stack Developer', type: 'full_time', applicants: 23, status: 'active', ctc: 800000 },
    { id: '3', title: 'UI/UX Design Intern', type: 'internship', applicants: 31, status: 'closed', stipend: 12000 },
  ];

  const mockCandidates = [
    { name: 'Arjun Kumar', challenge: 'React JS Mastery', score: 92, rank: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun' },
    { name: 'Priya Sharma', challenge: 'Python Full Stack', score: 88, rank: 7, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya' },
    { name: 'Rahul Dev', challenge: 'DSA Mastery', score: 95, rank: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul' },
  ];

  return (
    <div className="min-h-screen bg-arena-black p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Company Portal</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-8">Manage hiring opportunities and browse top talent</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Opportunities', value: '2', icon: Briefcase, color: 'text-arena-blue' },
            { label: 'Total Applicants', value: '99', icon: Users, color: 'text-arena-accent' },
            { label: 'Interviews Done', value: '12', icon: TrendingUp, color: 'text-arena-green' },
            { label: 'Hires Made', value: '3', icon: Building2, color: 'text-arena-orange' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="arena-card p-5">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {(['overview', 'opportunities', 'candidates'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-foreground">Your Opportunities</h2>
              <button className="arena-btn-primary px-4 py-2 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Post New</button>
            </div>
            {mockOpportunities.map(op => (
              <div key={op.id} className="arena-card p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-foreground">{op.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground capitalize">{op.type.replace('_', ' ')}</span>
                    <span className="text-xs text-muted-foreground">{op.applicants} applicants</span>
                    <span className="text-xs text-muted-foreground">{op.stipend ? `₹${op.stipend.toLocaleString()}/mo` : `₹${(op.ctc! / 100000).toFixed(1)}L CTC`}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${op.status === 'active' ? 'bg-arena-green/10 text-arena-green' : 'bg-secondary text-muted-foreground'}`}>
                    {op.status}
                  </span>
                  <button className="arena-btn-secondary px-3 py-1.5 text-xs"><Eye className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-foreground">Top Candidates</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input placeholder="Search..." className="arena-input pl-9 text-sm py-1.5" />
              </div>
            </div>
            {mockCandidates.map((c, i) => (
              <div key={i} className="arena-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={c.avatar} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-foreground text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.challenge} · Score: {c.score} · Rank #{c.rank}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="arena-btn-secondary px-3 py-1.5 text-xs">View Profile</button>
                  <button className="arena-btn-primary px-3 py-1.5 text-xs">Schedule Interview</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="arena-card p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {['New application for React Intern', 'Interview completed with Priya S.', 'Arjun K. hired as Frontend Dev'].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-foreground">{a}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="arena-card p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Hiring Pipeline</h3>
              <div className="space-y-3">
                {[
                  { stage: 'Applied', count: 99 },
                  { stage: 'Shortlisted', count: 24 },
                  { stage: 'Interviewing', count: 8 },
                  { stage: 'Hired', count: 3 },
                ].map(s => (
                  <div key={s.stage} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.stage}</span>
                    <span className="text-sm font-bold text-foreground">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
