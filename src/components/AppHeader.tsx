import { useUser } from '@/contexts/UserContext';
import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, Tv, LayoutDashboard, FileText, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';

const AppHeader = () => {
  const { nickname, setNickname } = useUser();

  const handleLogout = () => {
    setNickname('');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
    );

  return (
    <header className="sticky top-0 z-40 w-full glass-ios hidden lg:block">
      <div className="container flex h-14 items-center px-4">
        <div className="mr-6 flex items-center">
          <NavLink to="/" className="flex items-center space-x-2">
            <Logo className="h-7 w-7" />
            <span className="font-bold text-lg">Togetherly</span>
          </NavLink>
        </div>

        <nav className="flex items-center space-x-1 flex-1">
          <NavLink to="/app" className={navLinkClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/watch" className={navLinkClass}>
            <Tv className="h-4 w-4" />
            Watch
          </NavLink>
          <NavLink to="/browser" className={navLinkClass}>
            <Globe className="h-4 w-4" />
            Screen Share
          </NavLink>
          <NavLink to="/documentation" className={navLinkClass}>
            <FileText className="h-4 w-4" />
            Docs
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground truncate max-w-32">
            {nickname}
          </span>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9 rounded-full hover:bg-white/5">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
