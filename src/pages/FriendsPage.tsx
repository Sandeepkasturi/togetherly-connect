import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Check, X, Users, Clock, Wifi, MessageCircle, Phone, Video, Send, UserMinus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, DBUser, DBFollow } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppContextType } from '@/layouts/AppLayout';
import { getUnreadCounts } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

// ── Tab type ─────────────────────────────────────────────────
type Tab = 'friends' | 'requests' | 'discover';

// ── User card ─────────────────────────────────────────────────
const UserCard = ({
    user,
    action,
}: {
    user: DBUser;
    action: React.ReactNode;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.05)' }}
        className="group relative flex items-center gap-4 px-4 py-4 rounded-[28px] transition-all duration-300 border border-white/5 shadow-lg overflow-hidden"
        style={{
            background: 'rgba(255,255,255,0.03)',
        }}
    >
        {/* Subtle Background Glow */}
        <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#0A84FF]/5 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Avatar */}
        <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-[20px] p-0.5 bg-gradient-to-tr from-white/10 to-transparent border border-white/10 overflow-hidden relative z-10 shadow-md">
                {user.photo_url
                    ? <img src={user.photo_url} alt={user.display_name} className="w-full h-full rounded-[18px] object-cover" />
                    : (
                        <div className="w-full h-full rounded-[18px] bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                            {user.display_name[0].toUpperCase()}
                        </div>
                    )
                }
            </div>

            {/* Live Status Badge */}
            <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 z-20 h-5 w-5 rounded-full bg-black border-2 border-[#0A0A0F] flex items-center justify-center shadow-lg"
            >
                <div className={cn(
                    "h-2 w-2 rounded-full",
                    user.is_online ? "bg-[#30D158] animate-pulse glow-green" : "bg-white/20"
                )} />
            </motion.div>
        </div>

        <div className="flex-1 min-w-0 pr-2">
            <button
                onClick={() => window.location.href = `/profile/${user.id}`}
                className="text-[16px] font-bold text-white tracking-tight leading-tight truncate hover:underline hover:text-[#0A84FF] transition-colors text-left w-full"
            >
                {user.display_name}
            </button>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                    user.is_online ? "text-[#30D158] bg-[#30D158]/10" : "text-white/30 bg-white/5"
                )}>
                    {user.is_online ? 'Online' : 'Offline'}
                </span>
                <span className="text-[10px] text-white/20 font-medium truncate">
                    ID: {user.peer_id.slice(0, 8)}...
                </span>
            </div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
            {action}
        </div>
    </motion.div>
);

// ── FriendsPage ───────────────────────────────────────────────
const FriendsPage = () => {
    const { userProfile, isGuest, permanentPeerId } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<Tab>('friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<DBUser[]>([]);
    const [pendingRequests, setPendingRequests] = useState<DBUser[]>([]); // incoming
    const [discoverUsers, setDiscoverUsers] = useState<DBUser[]>([]);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter');

    // Share Intent State
    const [shareIntent, setShareIntent] = useState<string | null>(null);
    const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
    const [isSharing, setIsSharing] = useState(false);

    const { initiateCall } = useOutletContext<AppContextType>();

    // Guests can't use this page
    useEffect(() => {
        if (isGuest) navigate('/app', { replace: true });
    }, [isGuest, navigate]);

    useEffect(() => {
        const intent = localStorage.getItem('share_intent');
        if (intent) {
            setShareIntent(intent);
        }
    }, [location.pathname]);

    // ── Load friends (accepted follows) ──────────────────────
    const loadFriends = useCallback(async () => {
        if (!userProfile) return;
        setLoading(true);
        try {
            // People this user follows AND they follow back (accepted)
            const { data: followingData } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', userProfile.id)
                .eq('status', 'accepted');

            if (!followingData?.length) { setFriends([]); setLoading(false); return; }

            const ids = followingData.map(f => f.following_id);
            const { data: users } = await supabase
                .from('users').select('*').in('id', ids);
            setFriends(users ?? []);

            // Also load unread counts
            const counts = await getUnreadCounts(userProfile.id);
            setUnreadCounts(counts);
        } finally { setLoading(false); }
    }, [userProfile]);

    // ── Load incoming pending requests ────────────────────────
    const loadRequests = useCallback(async () => {
        if (!userProfile) return;
        setLoading(true);
        try {
            const { data: req } = await supabase
                .from('follows')
                .select('follower_id')
                .eq('following_id', userProfile.id)
                .eq('status', 'pending');

            if (!req?.length) { setPendingRequests([]); setLoading(false); return; }
            const ids = req.map(r => r.follower_id);
            const { data: users } = await supabase.from('users').select('*').in('id', ids);
            setPendingRequests(users ?? []);
        } finally { setLoading(false); }
    }, [userProfile]);

    // ── Discover all users ────────────────────────────────────
    const loadDiscover = useCallback(async () => {
        if (!userProfile) return;
        setLoading(true);
        try {
            let query = supabase
                .from('users')
                .select('*')
                .neq('id', userProfile.id)
                .order('is_online', { ascending: false })
                .limit(50);

            if (searchQuery.trim()) {
                query = query.ilike('display_name', `%${searchQuery.trim()}%`);
            }

            const { data } = await query;

            // Mark already-sent requests
            const { data: sent } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', userProfile.id);

            setSentRequests(new Set(sent?.map(s => s.following_id) ?? []));
            setDiscoverUsers(data ?? []);
        } finally { setLoading(false); }
    }, [userProfile, searchQuery]);

    useEffect(() => { if (activeTab === 'friends') loadFriends(); }, [activeTab, loadFriends]);
    useEffect(() => { if (activeTab === 'requests') loadRequests(); }, [activeTab, loadRequests]);
    useEffect(() => { if (activeTab === 'discover') loadDiscover(); }, [activeTab, loadDiscover, searchQuery]);

    // ── Actions ───────────────────────────────────────────────
    const sendFollowRequest = async (targetId: string) => {
        if (!userProfile) return;
        await supabase.from('follows').upsert({
            follower_id: userProfile.id,
            following_id: targetId,
            status: 'pending',
        }, { onConflict: 'follower_id,following_id' });
        setSentRequests(prev => new Set([...prev, targetId]));
    };

    const acceptRequest = async (user: DBUser) => {
        if (!userProfile) return;
        // Update their follow to accepted
        await supabase.from('follows')
            .update({ status: 'accepted' })
            .eq('follower_id', user.id)
            .eq('following_id', userProfile.id);
        // Create reverse follow so they appear in each other's friends
        await supabase.from('follows').upsert({
            follower_id: userProfile.id,
            following_id: user.id,
            status: 'accepted',
        }, { onConflict: 'follower_id,following_id' });

        loadRequests();
        loadFriends();

        // Automatically connect
        connectToFriend(user.peer_id);
    };

    const declineRequest = async (fromUserId: string) => {
        if (!userProfile) return;
        await supabase.from('follows')
            .delete()
            .eq('follower_id', fromUserId)
            .eq('following_id', userProfile.id);
        loadRequests();
    };

    const withdrawRequest = async (targetId: string) => {
        if (!userProfile) return;
        await supabase.from('follows')
            .delete()
            .eq('follower_id', userProfile.id)
            .eq('following_id', targetId)
            .eq('status', 'pending');
        setSentRequests(prev => {
            const next = new Set(prev);
            next.delete(targetId);
            return next;
        });
    };

    const unfriendUser = async (targetId: string) => {
        if (!userProfile) return;
        if (!window.confirm("Are you sure you want to unfriend this user?")) return;

        await supabase.from('follows').delete().or(`and(follower_id.eq.${userProfile.id},following_id.eq.${targetId}),and(follower_id.eq.${targetId},following_id.eq.${userProfile.id})`);
        loadFriends();
    };

    const connectToWatch = async (friend: DBUser) => {
        if (!userProfile) return;

        // 1. Send chat message
        const inviteMsg = {
            sender_id: userProfile.id,
            receiver_id: friend.id,
            content: `🎥 I'm inviting you to watch together!`,
            type: 'watch_invite',
            payload: { peer_id: permanentPeerId }
        };

        await supabase.from('messages').insert(inviteMsg);

        // 2. Send push notification (fire and forget)
        import('@/lib/push').then(({ sendPushNotification }) => {
            sendPushNotification({
                userId: friend.id,
                title: 'Watch Party Invite 🎥',
                body: `${userProfile.display_name} invited you to watch together!`,
                url: `/chat/${userProfile.id}`
            });
        }).catch(e => console.error('Push fail:', e));

        // 3. Connect and Navigate
        localStorage.setItem('peerIdToConnect', friend.peer_id);
        navigate('/watch');
    };

    const connectToFriend = (peerId: string) => {
        localStorage.setItem('peerIdToConnect', peerId);
        navigate('/watch');
    };

    // ── Share Integration ──
    const handleShare = async () => {
        if (!shareIntent || selectedFriends.size === 0 || !userProfile) return;
        setIsSharing(true);
        try {
            const inserts = Array.from(selectedFriends).map(friendId => ({
                sender_id: userProfile.id,
                receiver_id: friendId,
                content: shareIntent,
                type: 'text',
            }));
            const { error } = await supabase.from('messages').insert(inserts);
            if (error) throw error;

            localStorage.removeItem('share_intent');
            setShareIntent(null);
            setSelectedFriends(new Set());
            toast({ title: 'Shared successfully', description: `Sent to ${selectedFriends.size} friends` });

            if (selectedFriends.size === 1) {
                navigate(`/chat/${Array.from(selectedFriends)[0]}`);
            } else {
                navigate('/chat');
            }
        } catch (e) {
            console.error(e);
            toast({ title: 'Share failed', description: 'Could not send', variant: 'destructive' });
        } finally {
            setIsSharing(false);
        }
    };

    const cancelShare = () => {
        localStorage.removeItem('share_intent');
        setShareIntent(null);
        setSelectedFriends(new Set());
    };

    // ── Tab config ────────────────────────────────────────────
    const TABS: { key: Tab; label: string; badge?: number }[] = [
        { key: 'friends', label: 'Friends', badge: undefined },
        { key: 'requests', label: 'Requests', badge: pendingRequests.length || undefined },
        { key: 'discover', label: 'Discover' },
    ];

    const spring = { type: 'spring' as const, stiffness: 500, damping: 32 };

    return (
        <div className="flex flex-col px-4 py-4 gap-4 pb-12">

            {/* Tab bar (Modern Liquid Glass) */}
            <div className="relative p-1.5 rounded-[24px] bg-white/[0.04] border border-white/[0.05] flex items-center gap-1 shadow-2xl backdrop-blur-md">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => {
                            setActiveTab(t.key as Tab);
                            if (searchParams.has('filter')) {
                                searchParams.delete('filter');
                                setSearchParams(searchParams);
                            }
                        }}
                        className={cn(
                            "relative flex-1 py-2.5 rounded-[18px] text-[13px] font-black uppercase tracking-wider transition-all duration-300",
                            activeTab === t.key ? "text-white" : "text-white/40 hover:text-white/60"
                        )}
                    >
                        {activeTab === t.key && (
                            <motion.div
                                layoutId="friends-tab-glow"
                                className="absolute inset-0 bg-white/[0.08] rounded-[18px] border border-white/10"
                                style={{ boxShadow: '0 0 15px rgba(255,255,255,0.05)' }}
                                transition={spring}
                            />
                        )}
                        <span className="relative z-10">{t.label}</span>
                        {!!t.badge && (
                            <motion.span
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#FF3B30] text-white text-[10px] font-black flex items-center justify-center px-1 shadow-lg ring-2 ring-[#0A0A0F] z-20"
                            >
                                {t.badge}
                            </motion.span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search (Modern Glass) */}
            {activeTab === 'discover' && (
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#0A84FF] transition-colors" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Discovery People..."
                        className="w-full rounded-[20px] pl-11 pr-5 py-3.5 text-[14px] text-white outline-none bg-white/[0.03] border border-white/[0.05] focus:border-[#0A84FF]/30 transition-all placeholder:text-white/20 font-semibold"
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 space-y-2">
                {loading && (
                    <p className="text-center text-white/30 text-[13px] pt-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Loading…
                    </p>
                )}

                {/* Friends */}
                {activeTab === 'friends' && !loading && (() => {
                    const online = friends.filter(f => f.is_online);
                    const offline = friends.filter(f => !f.is_online);
                    const list = [...online, ...offline];

                    if (list.length === 0) {
                        return <EmptyState icon={<Users className="h-8 w-8 text-white/20" />} text="No friends yet" />;
                    }

                    return list.map(u => {
                        const isSelected = selectedFriends.has(u.id);

                        return (
                            <UserCard key={u.id} user={u} action={
                                shareIntent ? (
                                    <button
                                        onClick={() => {
                                            const next = new Set(selectedFriends);
                                            if (isSelected) next.delete(u.id);
                                            else next.add(u.id);
                                            setSelectedFriends(next);
                                        }}
                                        className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-[#0A84FF] border-[#0A84FF]' : 'border-white/20'}`}
                                    >
                                        {isSelected && <Check className="h-4 w-4 text-white" />}
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        {/* Message Action */}
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => navigate(`/chat/${u.id}`)}
                                            className="h-10 w-10 relative rounded-2xl flex items-center justify-center bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all shadow-sm"
                                            title="Message"
                                        >
                                            <MessageCircle className="h-4.5 w-4.5" />
                                            {/* Unread Badge */}
                                            {unreadCounts[u.id] > 0 && (
                                                <motion.span
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-[#FF3B30] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0A0A0F] shadow-lg"
                                                >
                                                    {unreadCounts[u.id]}
                                                </motion.span>
                                            )}
                                        </motion.button>

                                        {/* Audio Action */}
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => initiateCall(u.id, 'audio')}
                                            className="h-10 w-10 rounded-2xl flex items-center justify-center bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 hover:bg-[#30D158]/20 transition-all shadow-sm"
                                            title="Voice Call"
                                        >
                                            <Phone className="h-4.5 w-4.5" />
                                        </motion.button>

                                        {/* Video Action */}
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => initiateCall(u.id, 'video')}
                                            className="h-10 w-10 rounded-2xl flex items-center justify-center bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20 hover:bg-[#0A84FF]/20 transition-all shadow-sm"
                                            title="Video Call"
                                        >
                                            <Video className="h-4.5 w-4.5" />
                                        </motion.button>

                                        {/* Watch party — only when online */}
                                        {u.is_online && (
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => connectToWatch(u)}
                                                className="px-4 h-10 rounded-2xl flex items-center justify-center gap-2 bg-[#FF375F]/10 text-[#FF375F] border border-[#FF375F]/20 hover:bg-[#FF375F]/20 transition-all text-[12px] font-black uppercase tracking-tight shadow-sm"
                                            >
                                                <Wifi className="h-4 w-4" />
                                                <span>Watch</span>
                                            </motion.button>
                                        )}

                                        {/* Unfriend Action */}
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => unfriendUser(u.id)}
                                            className="h-10 w-10 ml-1 rounded-2xl flex items-center justify-center bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 hover:bg-[#FF453A]/20 transition-all shadow-sm"
                                            title="Unfriend"
                                        >
                                            <UserMinus className="h-4 w-4" />
                                        </motion.button>
                                    </div>
                                )}
                            />
                        );
                    });
                })()}

                {/* Requests */}
                {activeTab === 'requests' && !loading && (
                    pendingRequests.length === 0
                        ? <EmptyState icon={<Clock className="h-8 w-8 text-white/20" />} text="No pending requests" />
                        : pendingRequests.map(u => (
                            <UserCard key={u.id} user={u} action={
                                <div className="flex gap-2">
                                    <button onClick={() => acceptRequest(u)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{ background: 'rgba(52,200,90,0.2)' }}>
                                        <Check className="h-4 w-4 text-[#34C85A]" />
                                    </button>
                                    <button onClick={() => declineRequest(u.id)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{ background: 'rgba(255,69,58,0.2)' }}>
                                        <X className="h-4 w-4 text-[#FF453A]" />
                                    </button>
                                </div>
                            } />
                        ))
                )}

                {/* Discover */}
                {activeTab === 'discover' && !loading && (
                    discoverUsers.length === 0
                        ? <EmptyState icon={<Search className="h-8 w-8 text-white/20" />} text="No users found" />
                        : discoverUsers.map(u => (
                            <UserCard key={u.id} user={u} action={
                                sentRequests.has(u.id)
                                    ? (
                                        <div className="flex gap-2">
                                            <span className="text-[11px] text-white/30 px-2 py-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>Sent</span>
                                            <button onClick={() => withdrawRequest(u.id)}
                                                className="h-8 px-3 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-colors bg-white/5 hover:bg-white/10 text-white/50 border border-white/10">
                                                Withdraw
                                            </button>
                                        </div>
                                    )
                                    : (
                                        <button onClick={() => sendFollowRequest(u.id)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{ background: 'rgba(10,132,255,0.2)' }}>
                                            <UserPlus className="h-4 w-4 text-[#0A84FF]" />
                                        </button>
                                    )
                            } />
                        ))
                )}
            </div>

            {/* Share Intent Bottom Bar */}
            <AnimatePresence>
                {shareIntent && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-[80px] left-0 right-0 p-4 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-[#1C1C1E]/90 border border-white/10 rounded-full px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center gap-4 w-full max-w-sm backdrop-blur-xl pointer-events-auto shadow-2xl">
                            <button onClick={cancelShare} className="px-3 py-2 text-sm font-bold text-white/50 hover:text-white transition-colors">Cancel</button>
                            <button
                                onClick={handleShare}
                                disabled={selectedFriends.size === 0 || isSharing}
                                className={`flex-1 rounded-full py-2.5 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectedFriends.size > 0 && !isSharing ? 'bg-[#0A84FF] text-white shadow-[0_0_15px_rgba(10,132,255,0.4)]' : 'bg-white/10 text-white/30'
                                    }`}
                            >
                                {isSharing ? 'Sending...' : (
                                    <>
                                        <Send className="h-4 w-4" /> Send ({selectedFriends.size})
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

// ── Empty state ───────────────────────────────────────────────
const EmptyState = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex flex-col items-center gap-3 pt-16 text-center">
        {icon}
        <p className="text-[13px] text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>{text}</p>
    </div>
);

export default FriendsPage;
