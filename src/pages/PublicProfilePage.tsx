import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, DBUser } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Calendar, ShieldCheck, Mail, Fingerprint, Users } from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: d, ease: [0.32, 0.72, 0, 1] },
});

const PublicProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState<DBUser | null>(null);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        // If trying to view own profile, redirect to the actual profile page
        if (userProfile?.id === userId) {
            navigate('/profile', { replace: true });
            return;
        }

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (userError || !user) throw new Error('User not found');
                setProfileUser(user);

                // Fetch follower count
                const { count: followers } = await supabase
                    .from('follows')
                    .select('id', { count: 'exact', head: true })
                    .eq('following_id', userId)
                    .eq('status', 'accepted');

                if (followers !== null) setFollowersCount(followers);

                // Fetch following count
                const { count: following } = await supabase
                    .from('follows')
                    .select('id', { count: 'exact', head: true })
                    .eq('follower_id', userId)
                    .eq('status', 'accepted');

                if (following !== null) setFollowingCount(following);

            } catch (e: any) {
                console.error('Error fetching public profile:', e);
                setError(e.message || 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId, userProfile, navigate]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center pt-20">
                <div className="w-8 h-8 rounded-full border-t-2 border-[#0A84FF] animate-spin mb-4" />
                <p className="text-white/50 text-sm font-bold tracking-widest uppercase">Loading Profile...</p>
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center pt-20 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-white/20" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
                <p className="text-white/50 text-sm mb-6">{error || 'This user does not exist or has been removed.'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const joinDate = new Date(profileUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col px-4 pt-4 pb-12 space-y-6">
            {/* Nav */}
            <div className="flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
            </div>

            {/* Hero Section */}
            <motion.div {...fadeUp(0)} className="relative flex flex-col items-center text-center pt-2 pb-4">
                <div className="relative group mb-6">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] rounded-[48px] blur-2xl opacity-20 duration-700 pointer-events-none" />
                    <div className="relative h-32 w-32 rounded-[42px] p-1 bg-gradient-to-tr from-white/20 to-transparent border border-white/20 shadow-2xl overflow-hidden backdrop-blur-md">
                        {profileUser.photo_url ? (
                            <img
                                src={profileUser.photo_url}
                                alt={profileUser.display_name}
                                className="h-full w-full object-cover rounded-[38px]"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] rounded-[38px] flex items-center justify-center text-white font-bold text-4xl">
                                {profileUser.display_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2 z-10 w-full px-6 flex flex-col items-center">
                    <h1 className="text-[32px] font-black text-white tracking-tight drop-shadow-2xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {profileUser.display_name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#30D158]" />
                            <span className="text-[11px] font-black text-[#30D158] uppercase tracking-[0.1em]">Verified</span>
                        </div>
                        <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.1em]">Joined {joinDate}</span>
                    </div>
                </div>
            </motion.div>

            {/* Network & Bio */}
            <motion.div {...fadeUp(0.1)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="px-4 py-5 rounded-[24px] bg-white/[0.03] border border-white/[0.05] shadow-xl backdrop-blur-md flex flex-col items-center justify-center">
                        <p className="text-[22px] font-black text-white">{followersCount}</p>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Followers</p>
                    </div>
                    <div className="px-4 py-5 rounded-[24px] bg-white/[0.03] border border-white/[0.05] shadow-xl backdrop-blur-md flex flex-col items-center justify-center">
                        <p className="text-[22px] font-black text-white">{followingCount}</p>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Following</p>
                    </div>
                </div>

                <div className="px-5 py-5 rounded-[24px] bg-white/[0.03] border border-white/[0.05] shadow-xl backdrop-blur-md relative overflow-hidden">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 relative z-10">Bio</p>
                    <p className="text-[14px] text-white/80 leading-relaxed font-medium relative z-10">
                        {profileUser.bio || <span className="text-white/20 italic">No bio written yet.</span>}
                    </p>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-5 pointer-events-none">
                        <User className="w-32 h-32 text-white" />
                    </div>
                </div>
            </motion.div>

            {/* Details */}
            <motion.div {...fadeUp(0.15)} className="space-y-4">
                <h2 className="text-[12px] font-black text-white/30 uppercase tracking-[0.2em] px-2">Account Details</h2>
                <div className="space-y-0.5 rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/[0.05] backdrop-blur-3xl shadow-2xl">
                    <div className="flex items-center gap-4 px-5 py-5">
                        <div className="h-12 w-12 rounded-[18px] bg-[#BF5AF2]/10 flex items-center justify-center shrink-0 border border-[#BF5AF2]/20">
                            <Fingerprint className="h-6 w-6 text-[#BF5AF2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-black font-mono text-white tracking-[0.1em] uppercase select-all truncate">
                                {profileUser.peer_id}
                            </p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.15em] mt-0.5">Peer ID</p>
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-white/[0.05]" />

                    <div className="flex items-center gap-4 px-5 py-5">
                        <div className="h-12 w-12 rounded-[18px] bg-[#30D158]/10 flex items-center justify-center shrink-0 border border-[#30D158]/20">
                            <Calendar className="h-6 w-6 text-[#30D158]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[16px] font-bold text-white tracking-tight">{joinDate}</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.15em] mt-0.5">Joined</p>
                        </div>
                    </div>
                </div>
            </motion.div>

        </div>
    );
};

export default PublicProfilePage;
