
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { User, Settings, Sparkles, Tv } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Header = () => {
  const { nickname } = useUser();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
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
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Togetherly
              </span>
            </div>
          </Link>

          {/* User Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{nickname || 'Guest'}</span>
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
