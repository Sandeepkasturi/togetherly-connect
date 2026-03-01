import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserMinus, UserPlus, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase, DBUser } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface NetworkModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    type: 'followers' | 'following';
    currentUserId: string;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({ isOpen, onClose, userId, type, currentUserId }) => {
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return;

        const loadUsers = async () => {
            setLoading(true);
            try {
                if (type === 'followers') {
                    const { data } = await supabase
                        .from('follows')
                        .select('followerUser:users!follower_id(*)')
                        .eq('following_id', userId)
                        .eq('status', 'accepted');
                    if (data) setUsers(data.map((item: any) => item.followerUser));
                } else {
                    const { data } = await supabase
                        .from('follows')
                        .select('followingUser:users!following_id(*)')
                        .eq('follower_id', userId)
                        .eq('status', 'accepted');
                    if (data) setUsers(data.map((item: any) => item.followingUser));
                }
            } catch (error) {
                console.error(`Failed to load ${type}:`, error);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [isOpen, userId, type]);

    const filteredUsers = users.filter(u =>
        u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.peer_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUserClick = (id: string) => {
        if (id === currentUserId) {
            navigate('/profile');
        } else {
            navigate(`/user/${id}`);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: '100%', opacity: 0.5 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        className="fixed bottom-0 left-0 right-0 z-[201] rounded-t-[32px] bg-[#121217] border-t border-white/10 flex flex-col max-h-[85vh] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-4 pb-2 shrink-0">
                            <div className="h-1.5 w-12 rounded-full bg-white/20" />
                        </div>

                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/5">
                            <div>
                                <h2 className="text-[20px] font-black text-white tracking-tight capitalize">
                                    {type}
                                </h2>
                                <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                                    {users.length} Users
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 shrink-0">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[#0A84FF] transition-colors" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-[16px] pl-11 pr-4 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-[#0A84FF]/40 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto px-2 pb-6 min-h-[300px]">
                            {loading ? (
                                <div className="flex justify-center items-center h-full pt-10">
                                    <Loader2 className="h-8 w-8 text-[#0A84FF] animate-spin opacity-40" />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full pt-16 px-6 text-center space-y-4">
                                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                        <Search className="h-8 w-8" />
                                    </div>
                                    <p className="text-[14px] text-white/40 font-medium">No users found</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredUsers.map((user, i) => (
                                        <motion.button
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => handleUserClick(user.id)}
                                            className="w-full flex items-center gap-4 p-3 rounded-[20px] hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left"
                                        >
                                            <div className="relative shrink-0">
                                                <div className="h-12 w-12 rounded-[16px] overflow-hidden bg-white/10">
                                                    {user.photo_url ? (
                                                        <img src={user.photo_url} alt={user.display_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white font-bold text-lg">
                                                            {user.display_name[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[16px] font-bold text-white truncate tracking-tight">{user.display_name}</span>
                                                    {user.id === currentUserId && (
                                                        <span className="text-[9px] font-black bg-[#0A84FF]/20 text-[#0A84FF] px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider">You</span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest truncate block mt-0.5">
                                                    ID: {user.peer_id}
                                                </span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
