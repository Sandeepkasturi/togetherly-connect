import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import {
    LogOut,
    Mail,
    Fingerprint,
    Calendar,
    User,
    ExternalLink,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: d, ease: [0.32, 0.72, 0, 1] },
});

const ProfilePage = () => {
    const { userProfile, logout, isGuest } = useAuth();
    const context = useOutletContext<AppContextType>();
    const navigate = useNavigate();
    const [recentConnections, setRecentConnections] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    useEffect(() => {
        if (userProfile?.id) {
            setIsLoadingHistory(true);
            import('@/lib/supabase').then(({ supabase }) => {
                supabase
                    .from('recent_connections')
                    .select('*')
                    .eq('user_id', userProfile.id)
                    .order('last_connected_at', { ascending: false })
                    .limit(5)
                    .then(({ data }) => {
                        if (data) setRecentConnections(data);
                        setIsLoadingHistory(false);
                    });
            });
        }
    }, [userProfile?.id]);

    if (isGuest) {
        // ... return guest UI (unchanged)
        return (
            <div className="min-h-full px-4 pt-6 pb-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                    <User className="h-10 w-10 text-white/20" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white leading-tight">Guest Profile</h1>
                    <p className="text-white/40 text-[15px] max-w-[260px] mx-auto">
                        Sign in with Google to enable friends, permanent IDs, and a personalized profile.
                    </p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/auth')}
                    className="px-8 h-12 rounded-2xl bg-white text-black font-bold text-[15px] tap-effect"
                >
                    Sign In Now
                </motion.button>
            </div>
        );
    }

    if (!userProfile) return null;

    const joinDate = new Date(userProfile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const handleReconnect = (peerId: string) => {
        localStorage.setItem('peerIdToConnect', peerId);
        navigate('/app');
    };

    return (
        <div className="min-h-full px-4 pt-4 pb-20 space-y-6 overflow-y-auto">

            {/* ── Header Area ── */}
            <motion.div {...fadeUp(0)} className="flex flex-col items-center text-center space-y-4 pt-4">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] rounded-[40px] blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative h-28 w-28 rounded-[38px] overflow-hidden border-2 border-white/10 p-1 bg-black">
                        <img
                            src={userProfile.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.email}`}
                            alt={userProfile.display_name}
                            className="h-full w-full object-cover rounded-[32px]"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <h1 className="text-[26px] font-bold text-white tracking-tight">
                        {userProfile.display_name}
                    </h1>
                    <p className="text-[14px] text-white/40 font-medium tracking-wide flex items-center justify-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-[#30D158]" /> Verified Member
                    </p>
                </div>
            </motion.div>

            {/* ── Recent Connections Section ── */}
            <motion.div {...fadeUp(0.1)} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                    <h2 className="text-[13px] font-bold text-white/30 uppercase tracking-widest">Recent Connections</h2>
                </div>

                <div className="ios-card divide-y divide-white/[0.06]">
                    {recentConnections.length > 0 ? (
                        recentConnections.map((conn) => (
                            <div key={conn.id} className="flex items-center gap-4 px-4 py-3 group">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-white/30" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-semibold text-white truncate">{conn.nickname}</p>
                                    <p className="text-[11px] text-white/30 truncate font-mono">{conn.peer_id}</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReconnect(conn.peer_id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#0A84FF]/10 text-[#0A84FF] text-[12px] font-bold border border-[#0A84FF]/20"
                                >
                                    Connect
                                </motion.button>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-8 text-center space-y-2">
                            <p className="text-[14px] text-white/30 italic">No recent connections found.</p>
                            <p className="text-[11px] text-white/20">Go to Jump In to connect with peers!</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── Account Details Card ── */}
            <motion.div {...fadeUp(0.15)} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                    <h2 className="text-[13px] font-bold text-white/30 uppercase tracking-widest">Account Info</h2>
                </div>

                <div className="ios-card divide-y divide-white/[0.06]">
                    {/* Email */}
                    <div className="flex items-center gap-4 px-4 py-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <Mail className="h-5 w-5 text-[#0A84FF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-white truncate">{userProfile.email}</p>
                            <p className="text-[12px] text-white/40">Email Address</p>
                        </div>
                    </div>

                    {/* Peer ID */}
                    <div className="flex items-center gap-4 px-4 py-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <Fingerprint className="h-5 w-5 text-[#BF5AF2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-mono font-bold text-white tracking-wider uppercase select-all">
                                {userProfile.peer_id}
                            </p>
                            <p className="text-[12px] text-white/40">Permanent Peer ID</p>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(userProfile.peer_id);
                            }}
                            className="p-2 text-white/30 hover:text-white/60 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center gap-4 px-4 py-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5 text-[#30D158]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-white">{joinDate}</p>
                            <p className="text-[12px] text-white/40">Member Since</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Actions ── */}
            <motion.div {...fadeUp(0.25)} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                    <h2 className="text-[13px] font-bold text-white/30 uppercase tracking-widest">System</h2>
                </div>

                <div className="ios-card overflow-hidden divide-y divide-white/[0.06]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-4 px-4 py-4 text-left hover:bg-[#FF453A]/5 transition-colors group"
                    >
                        <div className="h-10 w-10 rounded-xl bg-[#FF453A]/10 flex items-center justify-center shrink-0">
                            <LogOut className="h-5 w-5 text-[#FF453A]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-semibold text-[#FF453A]">Sign Out</p>
                            <p className="text-[12px] text-[#FF453A]/40">Log out of your account</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#FF453A]/20" />
                    </button>
                </div>
            </motion.div>

            <motion.p {...fadeUp(0.35)} className="text-center text-[12px] text-white/20 pt-4">
                Togetherly Connect v1.0.0
            </motion.p>

        </div>
    );
};

export default ProfilePage;
