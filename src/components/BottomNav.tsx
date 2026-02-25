import { Home, Monitor, MessageCircle, Users, UserCircle, Clapperboard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const BASE_TABS = [
  { key: 'home', label: 'Home', icon: Home, to: '/app' },
  { key: 'watch', label: 'Watch', icon: Monitor, to: '/watch' },
  { key: 'share', label: 'Shots', icon: Clapperboard, to: '/share' },
  { key: 'chat', label: 'Chat', icon: MessageCircle, to: '/chat' },
];

const FRIENDS_TAB = { key: 'friends', label: 'Friends', icon: Users, to: '/friends' };
const PROFILE_TAB = { key: 'profile', label: 'Profile', icon: UserCircle, to: '/profile' };

const spring = { type: 'spring' as const, stiffness: 480, damping: 30, mass: 0.6 };

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, isGuest } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const TABS = isGuest ? BASE_TABS : [...BASE_TABS, FRIENDS_TAB, PROFILE_TAB];

  // Poll pending follow-request badge
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
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        background: 'rgba(10,10,14,0.88)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.45)',
      }}
    >
      <div
        className="flex items-center justify-around"
        style={{ paddingTop: 8, paddingBottom: 6, paddingLeft: 4, paddingRight: 4 }}
      >
        {TABS.map((tab) => {
          const isActive =
            tab.to === '/app'
              ? location.pathname === '/app'
              : location.pathname.startsWith(tab.to);
          const Icon = tab.icon;
          const isFriends = tab.key === 'friends';
          const isProfile = tab.key === 'profile';

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.to)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-[2px]',
                'rounded-2xl select-none transition-colors duration-150',
                isActive ? 'text-[#0A84FF]' : 'text-white/35 hover:text-white/60',
              )}
              style={{
                flex: 1,
                paddingTop: 6,
                paddingBottom: 4,
                WebkitTapHighlightColor: 'transparent',
                minWidth: 44,
              }}
              aria-label={tab.label}
            >
              {/* Glass pill background for active state */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={spring}
                    style={{
                      background: 'rgba(10,132,255,0.12)',
                      border: '1px solid rgba(10,132,255,0.22)',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon / Avatar */}
              <motion.span
                animate={isActive ? { scale: [1, 1.22, 1] } : { scale: 1 }}
                transition={spring}
                key={`icon-${tab.key}-${isActive}`}
                className="relative z-10"
              >
                {isProfile && userProfile?.photo_url ? (
                  <span className="block relative">
                    <img
                      src={userProfile.photo_url}
                      alt="Profile"
                      className={cn(
                        'h-[25px] w-[25px] rounded-full object-cover',
                        isActive
                          ? 'ring-2 ring-[#0A84FF] ring-offset-1 ring-offset-black'
                          : 'ring-1 ring-white/15 ring-offset-1 ring-offset-black',
                      )}
                    />
                  </span>
                ) : (
                  <Icon
                    className="h-[24px] w-[24px]"
                    strokeWidth={isActive ? 2.2 : 1.6}
                    fill={isActive ? 'currentColor' : 'none'}
                    fillOpacity={isActive ? 0.15 : 0}
                  />
                )}

                {/* Pending badge on Friends */}
                {isFriends && pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-[#FF453A] text-white text-[9px] font-bold flex items-center justify-center px-0.5 z-20">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </motion.span>

              {/* Label */}
              <span
                className={cn('text-[10px] relative z-10 transition-all duration-150',
                  isActive ? 'font-bold' : 'font-normal'
                )}
                style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.01em' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
