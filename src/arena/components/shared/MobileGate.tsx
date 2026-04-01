/**
 * @file MobileGate.tsx
 * @description Blocks mobile users — shows waitlist form instead of application
 * @module arena/shared
 * @author SKAV TECH
 * @product Togetherly Arena
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';

const MobileGate = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    // TODO: Save to Supabase waitlist table
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-arena-black flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-arena-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full space-y-8"
      >
        {/* Logo */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">SKAV TECH</p>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Togetherly <span className="text-primary">Arena</span>
          </h1>
          <p className="text-sm text-muted-foreground">Prove it. Get placed.</p>
        </div>

        {/* Desktop illustration */}
        <div className="flex items-center justify-center gap-4 py-6">
          <Smartphone className="w-8 h-8 text-destructive opacity-50" />
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <Monitor className="w-10 h-10 text-primary" />
        </div>

        <div className="arena-card p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">Designed for Desktop</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Togetherly Arena features code editors, live interviews, and proctored exams 
            that require a desktop browser for the best experience.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="arena-input w-full text-sm"
                required
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="arena-input w-full text-sm"
                required
              />
              <button type="submit" className="arena-btn-primary w-full py-3 text-sm">
                Get notified when mobile launches
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 justify-center text-arena-green py-4"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">You're on the list!</span>
            </motion.div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} SKAV TECH. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default MobileGate;
