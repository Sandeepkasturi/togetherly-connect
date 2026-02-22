
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { User, Settings, Tv, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/watch', label: 'Watch', icon: Tv },
  { to: '/browser', label: 'Browser', icon: Globe },
];

const Header = () => {
  const { nickname } = useUser();
  const location = useLocation();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-50 w-full glass-strong border-b border-white/[0.06]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative">
              {/* Glow ring behind logo */}
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-md scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Logo className="h-9 w-9 relative z-10" />
            </div>
            <span className="text-xl font-bold text-gradient-primary font-display tracking-tight">
              Togetherly
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link key={to} to={to}>
                  <button
                    className={cn(
                      'relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="header-pill"
                        className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="h-4 w-4 relative z-10" />
                    <span className="hidden sm:inline relative z-10">{label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="flex items-center gap-2 shrink-0">
            {nickname && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-white/[0.08]">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]" />
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium text-foreground">{nickname}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>
    </motion.header>
  );
};

export default Header;
