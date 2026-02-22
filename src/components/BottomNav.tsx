import { Home, Monitor, Globe2, MessageCircle, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const BASE_TABS = [
  { key: 'home', label: 'Home', icon: Home, to: '/app' },
  { key: 'watch', label: 'Watch', icon: Monitor, to: '/watch' },
  { key: 'browser', label: 'Share', icon: Globe2, to: '/browser' },
  { key: 'chat', label: 'Chat', icon: MessageCircle, to: '/chat' },
];

const FRIENDS_TAB = { key: 'friends', label: 'Friends', icon: Users, to: '/friends' };

const spring = { type: 'spring' as const, stiffness: 500, damping: 32, mass: 0.65 };

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, isGuest } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  // Build tab list — include Friends only for registered users
  const TABS = isGuest ? BASE_TABS : [...BASE_TABS, FRIENDS_TAB];

  // Poll for pending follow requests badge
  useEffect(() => {
    if (!userProfile) return;
    const loadBadge = async () => {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userProfile.id)
        .eq('status', 'pending');
      setPendingCount(count ?? 0);
    };
    loadBadge();
    const interval = setInterval(loadBadge, 30_000);
    return () => clearInterval(interval);
  }, [userProfile]);

  return (
    <nav
      className="liquid-glass-nav fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
    >
      <div className="flex items-center justify-around px-2 pt-2.5 pb-1.5">
        {TABS.map((tab) => {
          const isActive =
            tab.to === '/app'
              ? location.pathname === '/app'
              : location.pathname.startsWith(tab.to);
          const Icon = tab.icon;
          const isFriends = tab.key === 'friends';

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.to)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-[3px]',
                'px-4 py-1 min-w-[48px] rounded-2xl select-none',
                'transition-colors duration-150',
                isActive ? 'text-[#0A84FF]' : 'text-white/38 hover:text-white/65',
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label={tab.label}
            >
              {/* Icon */}
              <motion.span
                animate={isActive ? { scale: [1, 1.28, 1] } : { scale: 1 }}
                transition={spring}
                key={`icon-${tab.key}-${isActive}`}
                className="relative z-10"
              >
                <Icon
                  className="h-[25px] w-[25px]"
                  strokeWidth={isActive ? 2.2 : 1.6}
                  fill={isActive ? 'currentColor' : 'none'}
                  fillOpacity={isActive ? 0.18 : 0}
                />
                {/* Pending badge on Friends tab */}
                {isFriends && pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-[#FF453A] text-white text-[9px] font-bold flex items-center justify-center px-0.5 z-20">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </motion.span>

              {/* Label */}
              <span
                className={cn('text-[10px] tracking-tight relative z-10', isActive ? 'font-semibold' : 'font-normal')}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {tab.label}
              </span>

              {/* Active underline pill */}
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute -bottom-0 h-[2px] w-5 rounded-full bg-[#0A84FF]"
                  transition={spring}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
