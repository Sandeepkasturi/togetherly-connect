/**
 * @file DashboardPage.tsx
 * @description User dashboard — progress, exams, results, certificates
 * @module arena/pages
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Calendar, Award, Clock, ArrowRight, CheckCircle, ChevronRight, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();

  // Mock data
  const activeRegistrations = [
    { id: '1', title: 'React JS Mastery', progress: 65, weeksCompleted: 3, totalWeeks: 4, examDate: 'Jul 28', status: 'active' },
    { id: '2', title: 'Python Full Stack', progress: 30, weeksCompleted: 1, totalWeeks: 4, examDate: 'Aug 15', status: 'active' },
  ];

  const recentResults = [
    { id: '1', title: 'DSA & Problem Solving', score: 87, rank: 12, totalParticipants: 203, grade: 'A', certificate: true },
  ];

  const upcomingExams = [
    { id: '1', title: 'React JS Mastery', date: 'Jul 28, 2025', time: '10:00 AM', duration: '120 min' },
  ];

  return (
    <div className="min-h-screen bg-arena-black p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm mb-8">Track your progress and upcoming events</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Challenges', value: '2', icon: BookOpen, color: 'text-arena-blue' },
            { label: 'Exams Taken', value: '1', icon: BarChart3, color: 'text-arena-accent' },
            { label: 'Certificates', value: '1', icon: Award, color: 'text-arena-green' },
            { label: 'Best Rank', value: '#12', icon: Trophy, color: 'text-arena-orange' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="arena-card p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Challenges */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display text-lg font-bold text-foreground">Active Challenges</h2>
            {activeRegistrations.map(reg => (
              <motion.div key={reg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="arena-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-foreground">{reg.title}</h3>
                  <span className="text-xs text-arena-accent flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Exam: {reg.examDate}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Week {reg.weeksCompleted}/{reg.totalWeeks}</span>
                    <span>{reg.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${reg.progress}%` }} />
                  </div>
                </div>
                <button className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                  Continue Learning <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            ))}

            {/* Recent Results */}
            <h2 className="font-display text-lg font-bold text-foreground pt-4">Recent Results</h2>
            {recentResults.map(result => (
              <motion.div key={result.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="arena-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-foreground">{result.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">Score: <span className="text-primary font-bold">{result.score}/100</span></span>
                      <span className="text-sm text-muted-foreground">Rank: <span className="text-arena-accent font-bold">#{result.rank}</span>/{result.totalParticipants}</span>
                      <span className="px-2 py-0.5 rounded bg-arena-green/10 text-arena-green text-xs font-bold">{result.grade}</span>
                    </div>
                  </div>
                  {result.certificate && (
                    <button className="arena-btn-secondary px-4 py-2 text-xs flex items-center gap-1">
                      <Award className="w-3 h-3" /> Certificate
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-foreground">Upcoming Exams</h2>
            {upcomingExams.map(exam => (
              <div key={exam.id} className="arena-card p-5">
                <h3 className="font-display text-sm font-bold text-foreground mb-2">{exam.title}</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exam.date}</p>
                  <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.time} · {exam.duration}</p>
                </div>
                <button className="arena-btn-primary w-full py-2 text-xs mt-4">Book Exam Slot</button>
              </div>
            ))}

            <button onClick={() => navigate('/arena/challenges')} className="w-full arena-btn-secondary py-3 text-sm flex items-center justify-center gap-2">
              Browse More Challenges <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
