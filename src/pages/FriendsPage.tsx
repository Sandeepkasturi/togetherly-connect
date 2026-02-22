import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Check, X, Users, Clock, Wifi, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, DBUser, DBFollow } from '@/lib/supabase';

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
    <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
        }}
    >
        {/* Avatar */}
        <div className="relative shrink-0">
            {user.photo_url
                ? <img src={user.photo_url} alt={user.display_name} className="w-10 h-10 rounded-full object-cover" />
                : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white font-bold text-base">
                        {user.display_name[0].toUpperCase()}
                    </div>
                )
            }
            {/* Online dot */}
            <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${user.is_online ? 'bg-[#34C85A]' : 'bg-white/20'}`}
            />
        </div>

        <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-white truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {user.display_name}
            </p>
            <p className="text-[11px] text-white/35 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                ID: {user.peer_id} · {user.is_online ? 'Online' : 'Offline'}
            </p>
        </div>

        {action}
    </div>
);

// ── FriendsPage ───────────────────────────────────────────────
const FriendsPage = () => {
    const { userProfile, isGuest } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<DBUser[]>([]);
    const [pendingRequests, setPendingRequests] = useState<DBUser[]>([]); // incoming
    const [discoverUsers, setDiscoverUsers] = useState<DBUser[]>([]);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    // Guests can't use this page
    useEffect(() => {
        if (isGuest) navigate('/app', { replace: true });
    }, [isGuest, navigate]);

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

    const acceptRequest = async (fromUserId: string) => {
        if (!userProfile) return;
        // Update their follow to accepted
        await supabase.from('follows')
            .update({ status: 'accepted' })
            .eq('follower_id', fromUserId)
            .eq('following_id', userProfile.id);
        // Create reverse follow so they appear in each other's friends
        await supabase.from('follows').upsert({
            follower_id: userProfile.id,
            following_id: fromUserId,
            status: 'accepted',
        }, { onConflict: 'follower_id,following_id' });
        loadRequests();
        loadFriends();
    };

    const declineRequest = async (fromUserId: string) => {
        if (!userProfile) return;
        await supabase.from('follows')
            .delete()
            .eq('follower_id', fromUserId)
            .eq('following_id', userProfile.id);
        loadRequests();
    };

    const connectToFriend = (peerId: string) => {
        // Copy peer ID to clipboard so user can paste into Watch tab
        navigator.clipboard.writeText(peerId);
        navigate('/watch');
    };

    // ── Tab config ────────────────────────────────────────────
    const TABS: { key: Tab; label: string; badge?: number }[] = [
        { key: 'friends', label: 'Friends', badge: undefined },
        { key: 'requests', label: 'Requests', badge: pendingRequests.length || undefined },
        { key: 'discover', label: 'Discover' },
    ];

    const spring = { type: 'spring' as const, stiffness: 500, damping: 32 };

    return (
        <div className="flex flex-col h-full px-4 py-4 gap-4">

            {/* Tab bar */}
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className="relative flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors"
                        style={{
                            fontFamily: "'Outfit', sans-serif",
                            color: activeTab === t.key ? '#fff' : 'rgba(255,255,255,0.4)',
                            background: activeTab === t.key ? 'rgba(10,132,255,0.25)' : 'transparent',
                        }}
                    >
                        {t.label}
                        {!!t.badge && (
                            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-[#FF453A] text-white text-[10px] font-bold flex items-center justify-center px-1">
                                {t.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search (discover only) */}
            {activeTab === 'discover' && (
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by name…"
                        className="w-full rounded-2xl pl-10 pr-4 py-3 text-[14px] text-white outline-none"
                        style={{
                            fontFamily: "'Outfit', sans-serif",
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {loading && (
                    <p className="text-center text-white/30 text-[13px] pt-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Loading…
                    </p>
                )}

                {/* Friends */}
                {activeTab === 'friends' && !loading && (
                    friends.length === 0
                        ? <EmptyState icon={<Users className="h-8 w-8 text-white/20" />} text="No friends yet — find people in Discover" />
                        : friends.map(u => (
                            <div key={u.id} className="ios-card overflow-hidden">
                                <UserCard user={u} action={
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                localStorage.setItem('peerIdToConnect', u.peer_id);
                                                navigate('/chat');
                                            }}
                                            className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#BF5AF2]/10 text-[#BF5AF2] border border-[#BF5AF2]/20 hover:bg-[#BF5AF2]/20 transition-colors"
                                            title="Direct Chat"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                localStorage.setItem('peerIdToConnect', u.peer_id);
                                                navigate('/watch');
                                            }}
                                            className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20 hover:bg-[#0A84FF]/20 transition-colors"
                                            title="Call & Watch"
                                        >
                                            <Wifi className="h-4 w-4" />
                                        </button>
                                    </div>
                                } />
                            </div>
                        ))
                )}

                {/* Requests */}
                {activeTab === 'requests' && !loading && (
                    pendingRequests.length === 0
                        ? <EmptyState icon={<Clock className="h-8 w-8 text-white/20" />} text="No pending requests" />
                        : pendingRequests.map(u => (
                            <UserCard key={u.id} user={u} action={
                                <div className="flex gap-2">
                                    <button onClick={() => acceptRequest(u.id)}
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
                                    ? <span className="text-[11px] text-white/30 px-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Sent</span>
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
        </div>
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
