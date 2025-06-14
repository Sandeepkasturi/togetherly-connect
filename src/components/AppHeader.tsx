
import { useUser } from '@/contexts/UserContext';
import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, Tv, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppHeader = () => {
  const { nickname, setNickname } = useUser();

  const handleLogout = () => {
    setNickname('');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <NavLink to="/" className="mr-6 flex items-center space-x-2">
            <Tv className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Togetherly
            </span>
          </NavLink>
          <nav className="flex items-center space-x-2">
            <NavLink to="/app" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/watch" className={navLinkClass}>
               <Tv className="h-4 w-4" />
              Watch
            </NavLink>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add search here if needed later */}
          </div>
          <nav className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Hi, {nickname}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
