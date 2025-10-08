
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { User, Settings, Sparkles, Tv, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { nickname } = useUser();
  const location = useLocation();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 glass-strong"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Tv className="h-8 w-8 text-primary" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-pulse" />
              </div>
              <span className="text-xl font-bold text-gradient-primary font-display">
                Togetherly
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2">
            <Link to="/watch">
              <Button 
                variant={location.pathname === '/watch' ? 'default' : 'ghost'} 
                size="sm"
                className="gap-2"
              >
                <Tv className="h-4 w-4" />
                <span className="hidden sm:inline">Watch</span>
              </Button>
            </Link>
            <Link to="/browser">
              <Button 
                variant={location.pathname === '/browser' ? 'default' : 'ghost'} 
                size="sm"
                className="gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Browser</span>
              </Button>
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass border border-border/50">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{nickname || 'Guest'}</span>
            </div>
            
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary transition-colors rounded-xl">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
