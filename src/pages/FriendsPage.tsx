import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Users, Wifi, MessageCircle, Phone, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, DBUser } from '@/lib/supabase';
import { AppContextType } from '@/layouts/AppLayout';

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

// ── CommunityPage (replaces FriendsPage) ──────────────────────
const FriendsPage = () => {
    const { userProfile, isGuest } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(false);

    const { initiateCall } = useOutletContext<AppContextType>();

    // Guests can't use this page
    useEffect(() => {
        if (isGuest) navigate('/app', { replace: true });
    }, [isGuest, navigate]);

    // ── Load all users (Global Directory) ─────────────────────
    const loadUsers = useCallback(async () => {
        if (!userProfile) return;
        setLoading(true);
        try {
            let query = supabase
                .from('users')
                .select('*')
                .neq('id', userProfile.id)
                .order('is_online', { ascending: false })
                .limit(100);

            if (searchQuery.trim()) {
                query = query.ilike('display_name', `%${searchQuery.trim()}%`);
            }

            const { data } = await query;
            setUsers(data ?? []);
        } finally {
            setLoading(false);
        }
    }, [userProfile, searchQuery]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers, searchQuery]);

    return (
        <div className="flex flex-col h-full px-4 py-4 gap-4">

            <div className="px-1">
                <h1 className="text-2xl font-bold text-white mb-1">Community</h1>
                <p className="text-sm text-white/50">Find anyone and instantly connect.</p>
            </div>

            {/* Search */}
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-2 pb-32">
                {loading && users.length === 0 && (
                    <p className="text-center text-white/30 text-[13px] pt-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Loading users…
                    </p>
                )}

                {!loading && users.length === 0 && (
                    <div className="flex flex-col items-center gap-3 pt-16 text-center">
                        <Users className="h-8 w-8 text-white/20" />
                        <p className="text-[13px] text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>No users found</p>
                    </div>
                )}

                {users.map(u => (
                    <div key={u.id} className="ios-card overflow-hidden">
                        <UserCard user={u} action={
                            <div className="flex gap-2">
                                {/* Chat — always available */}
                                <button
                                    onClick={() => navigate(`/chat/${u.id}`)}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#BF5AF2]/10 text-[#BF5AF2] border border-[#BF5AF2]/20 hover:bg-[#BF5AF2]/20 transition-colors"
                                    title="Message"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                </button>

                                {/* Audio call */}
                                <button
                                    onClick={() => initiateCall(u.id, 'audio')}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 hover:bg-[#30D158]/20 transition-colors"
                                    title="Voice Call"
                                >
                                    <Phone className="h-4 w-4" />
                                </button>

                                {/* Video call */}
                                <button
                                    onClick={() => initiateCall(u.id, 'video')}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20 hover:bg-[#0A84FF]/20 transition-colors"
                                    title="Video Call"
                                >
                                    <Video className="h-4 w-4" />
                                </button>

                                {/* Watch party */}
                                {u.is_online && (
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('peerIdToConnect', u.peer_id);
                                            navigate('/watch');
                                        }}
                                        className="px-3 h-9 rounded-xl flex items-center justify-center gap-1.5 bg-[#34C85A]/10 text-[#34C85A] border border-[#34C85A]/20 hover:bg-[#34C85A]/20 transition-colors text-[12px] font-bold"
                                    >
                                        <Wifi className="h-3.5 w-3.5" />
                                        <span>Watch</span>
                                    </button>
                                )}
                            </div>
                        } />
                    </div>
                ))}
            </div>
        </div >
    );
};

export default FriendsPage;
