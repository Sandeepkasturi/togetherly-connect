
import { useUser } from '@/contexts/UserContext';
import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, Tv, LayoutDashboard, FileText, Menu, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const AppHeader = () => {
  const { nickname, setNickname } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setNickname('');
    setIsOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    );

  const NavItems = () => (
    <>
      <NavLink to="/app" className={navLinkClass} onClick={() => setIsOpen(false)}>
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </NavLink>
      <NavLink to="/watch" className={navLinkClass} onClick={() => setIsOpen(false)}>
        <Tv className="h-4 w-4" />
        Watch
      </NavLink>
      <NavLink to="/browser" className={navLinkClass} onClick={() => setIsOpen(false)}>
        <Globe className="h-4 w-4" />
        Browser
      </NavLink>
      <NavLink to="/documentation" className={navLinkClass} onClick={() => setIsOpen(false)}>
        <FileText className="h-4 w-4" />
        Documentation
      </NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full glass-ios">
      <div className="container flex h-14 items-center px-4">
        {/* Logo */}
        <div className="mr-4 flex items-center">
          <NavLink to="/" className="flex items-center space-x-2">
            <Tv className="h-6 w-6" />
            <span className="font-bold text-lg sm:inline-block">
              Togetherly
            </span>
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 flex-1">
          <NavItems />
        </nav>

        {/* User Info and Actions */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline truncate max-w-32">
            Hi, {nickname}
          </span>

          {/* Desktop Logout */}
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:flex">
            <LogOut className="h-4 w-4" />
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="text-sm font-medium text-muted-foreground border-b pb-2">
                  Hi, {nickname}
                </div>
                <nav className="flex flex-col space-y-2">
                  <NavItems />
                </nav>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start mt-4"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
