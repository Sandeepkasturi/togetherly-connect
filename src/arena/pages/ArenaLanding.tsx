/**
 * @file ArenaLanding.tsx
 * @description 3D Three.js landing page with waitlist, challenge previews, and stats
 * @module arena/pages
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState, useRef, Suspense, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Trophy, Users, Code2, Palette, ChevronDown, ExternalLink, Github, Linkedin, Twitter, CheckCircle, Building2 } from 'lucide-react';

// ── THREE.JS SCENE COMPONENTS ─────────────────────────────────

const FloatingShape = ({ geometry, color, position, speed = 1 }: {
  geometry: 'icosahedron' | 'octahedron' | 'torus';
  color: string;
  position: [number, number, number];
  speed?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.003 * speed;
    meshRef.current.rotation.y += 0.005 * speed;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.3;
  });

  const getGeometry = () => {
    switch (geometry) {
      case 'icosahedron': return <icosahedronGeometry args={[1, 0]} />;
      case 'octahedron': return <octahedronGeometry args={[0.8, 0]} />;
      case 'torus': return <torusGeometry args={[0.7, 0.2, 8, 16]} />;
    }
  };

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        {getGeometry()}
        <meshBasicMaterial color={color} wireframe transparent opacity={0.6} />
      </mesh>
    </Float>
  );
};

const HeroScene = () => (
  <Canvas
    camera={{ position: [0, 0, 8], fov: 60 }}
    style={{ position: 'absolute', inset: 0 }}
    dpr={[1, 1.5]}
  >
    <Suspense fallback={null}>
      <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
      <FloatingShape geometry="icosahedron" color="#E8FF47" position={[-3, 1.5, -2]} speed={0.8} />
      <FloatingShape geometry="octahedron" color="#4A9EFF" position={[3.5, -0.5, -3]} speed={1.2} />
      <FloatingShape geometry="torus" color="#A78BFA" position={[-1.5, -2, -1.5]} speed={0.6} />
      <FloatingShape geometry="icosahedron" color="#4A9EFF" position={[2, 2.5, -4]} speed={0.9} />
      <FloatingShape geometry="octahedron" color="#E8FF47" position={[-4, -1, -5]} speed={0.7} />
      <ambientLight intensity={0.3} />
    </Suspense>
  </Canvas>
);

// ── WAITLIST FORM ─────────────────────────────────────────────

const WaitlistForm = () => {
  const [tab, setTab] = useState<'early' | 'company'>('early');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', skill: '', companyName: '', lookingFor: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase waitlist table + trigger email
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="arena-card p-8 text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-arena-green mx-auto" />
        <h3 className="font-display text-xl font-bold text-foreground">You're on the list!</h3>
        <p className="text-sm text-muted-foreground">Check your email for confirmation. We'll notify you when early access opens.</p>
      </motion.div>
    );
  }

  return (
    <div className="arena-card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button onClick={() => setTab('early')} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'early' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          Early Access
        </button>
        <button onClick={() => setTab('company')} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'company' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          <Building2 className="w-4 h-4 inline mr-1" /> Company Partner
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {tab === 'early' ? (
          <>
            <input placeholder="Your name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="arena-input w-full" required />
            <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="arena-input w-full" required />
            <select value={form.skill} onChange={e => setForm(p => ({ ...p, skill: e.target.value }))} className="arena-input w-full" required>
              <option value="">What skill do you want to master?</option>
              <option value="react">React JS</option>
              <option value="python">Python</option>
              <option value="uiux">UI/UX Design</option>
              <option value="node">Node.js</option>
              <option value="ml">Machine Learning</option>
              <option value="dsa">Data Structures & Algorithms</option>
            </select>
          </>
        ) : (
          <>
            <input placeholder="Company name" value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} className="arena-input w-full" required />
            <input type="email" placeholder="work@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="arena-input w-full" required />
            <textarea placeholder="We're looking for..." value={form.lookingFor} onChange={e => setForm(p => ({ ...p, lookingFor: e.target.value }))} className="arena-input w-full h-24 resize-none" required />
          </>
        )}
        <button type="submit" className="arena-btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2">
          {tab === 'early' ? 'Get Early Access' : 'Partner With Us'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

// ── CHALLENGE PREVIEW CARDS ───────────────────────────────────

const challengePreviews = [
  { title: 'React JS Mastery', icon: Code2, color: 'text-arena-blue', bgColor: 'bg-arena-blue/10', dates: 'Jul 1 – Aug 15', prize: '₹6,000', fee: '₹99' },
  { title: 'Python Full Stack', icon: Zap, color: 'text-arena-accent', bgColor: 'bg-arena-accent/10', dates: 'Jul 15 – Sep 1', prize: '₹6,000', fee: '₹99' },
  { title: 'UI/UX Design Sprint', icon: Palette, color: 'text-arena-purple', bgColor: 'bg-arena-purple/10', dates: 'Aug 1 – Sep 15', prize: '₹6,000', fee: '₹99' },
];

const ChallengePreviewCard = ({ challenge, index }: { challenge: typeof challengePreviews[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="arena-card p-6 relative overflow-hidden group"
  >
    {/* Coming soon overlay */}
    <div className="absolute inset-0 bg-arena-black/60 backdrop-blur-sm flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <span className="arena-btn-primary px-4 py-2 text-xs">Registration Opening Soon</span>
    </div>

    <div className={`w-10 h-10 rounded-xl ${challenge.bgColor} flex items-center justify-center mb-4`}>
      <challenge.icon className={`w-5 h-5 ${challenge.color}`} />
    </div>
    <h3 className="font-display text-lg font-bold text-foreground mb-1">{challenge.title}</h3>
    <p className="text-xs text-muted-foreground mb-4">{challenge.dates}</p>
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-arena-accent flex items-center gap-1"><Trophy className="w-3 h-3" /> {challenge.prize}</span>
      <span className="text-xs text-muted-foreground">Entry: {challenge.fee}</span>
    </div>
  </motion.div>
);

// ── STATS COUNTER ─────────────────────────────────────────────

const stats = [
  { label: 'Early Access Spots', value: '247', suffix: ' remaining' },
  { label: 'Challenges Planned', value: '12', suffix: '+' },
  { label: 'Prize Pool', value: '₹72K', suffix: '+' },
];

// ── MAIN LANDING PAGE ─────────────────────────────────────────

const ArenaLanding = () => {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);

  return (
    <div className="min-h-screen bg-arena-black text-foreground overflow-y-auto">
      {/* ── HERO SECTION ── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <HeroScene />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          {/* Parent brand */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6"
          >
            SKAV TECH
          </motion.p>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-display text-6xl md:text-8xl font-extrabold mb-4"
          >
            Togetherly{' '}
            <span className="text-gradient-primary">Arena</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground mb-6"
          >
            Prove it. Get placed.
          </motion.p>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-arena-green pulse-dot" />
            <span className="text-sm text-foreground">Coming Soon — Early Access Open</span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button onClick={() => setShowEarlyAccess(true)} className="arena-btn-primary px-8 py-3.5 text-base flex items-center gap-2">
              Get Early Access <ArrowRight className="w-4 h-4" />
            </button>
            <a href="#challenges" className="arena-btn-secondary px-8 py-3.5 text-base">
              View Challenges
            </a>
          </motion.div>

          {/* Live counter */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 text-sm text-arena-accent"
          >
            <Zap className="w-3.5 h-3.5 inline mr-1" />
            247 spots remaining
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
        </motion.div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-4xl font-bold text-primary">{stat.value}<span className="text-muted-foreground text-lg">{stat.suffix}</span></p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CHALLENGE PREVIEWS ── */}
      <section id="challenges" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-bold text-center mb-4"
          >
            Upcoming <span className="text-gradient-primary">Challenges</span>
          </motion.h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Master skills through structured learning, prove yourself in proctored exams, and get placed with top companies.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {challengePreviews.map((c, i) => (
              <ChallengePreviewCard key={c.title} challenge={c} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center mb-12">
            How It <span className="text-gradient-accent">Works</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register', desc: 'Pick a challenge and pay the entry fee. Get access to the full syllabus.' },
              { step: '02', title: 'Learn', desc: 'Follow the structured syllabus. Track your progress weekly.' },
              { step: '03', title: 'Prove', desc: 'Take the proctored exam. MCQs, coding, and project submission.' },
              { step: '04', title: 'Get Placed', desc: 'Top scorers get certificates, prizes, and placement opportunities.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <span className="text-5xl font-display font-bold text-primary/20">{item.step}</span>
                <h3 className="font-display text-lg font-bold mt-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST SECTION ── */}
      <section className="py-20 px-6">
        <div className="max-w-md mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-8">
            Join the <span className="text-gradient-primary">Waitlist</span>
          </h2>
          <WaitlistForm />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} SKAV TECH</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="mailto:support@togetherly.app" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>

      {/* ── EARLY ACCESS MODAL ── */}
      <AnimatePresence>
        {showEarlyAccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowEarlyAccess(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <WaitlistForm />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArenaLanding;
