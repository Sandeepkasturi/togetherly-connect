import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import {
    LogOut, Mail, Fingerprint, Calendar, User, ExternalLink,
    ChevronRight, ShieldCheck, Pencil, Camera, Trash2, X, Check, Loader2, Copy, Download, Bell, BellRing, Youtube, Heart, Play
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: d, ease: [0.32, 0.72, 0, 1] },
});

const ProfilePage = () => {
    const { userProfile, logout, isGuest, updateProfile } = useAuth();
    const { setNickname } = useUser();
    const navigate = useNavigate();
    const { permission, requestPermission, subscribeToPush } = usePushNotifications();

    const [bio, setBio] = useState('');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [editedBio, setEditedBio] = useState('');
    const [isSavingBio, setIsSavingBio] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    // YouTube Shorts data
    const [likedShorts, setLikedShorts] = useState<any[]>([]);
    const [skippedShorts, setSkippedShorts] = useState<any[]>([]);
    const [viewedShorts, setViewedShorts] = useState<any[]>([]);

    // Edit name state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    // Photo upload state
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Name save success flash
    const [nameSaved, setNameSaved] = useState(false);

    // Delete account dialog
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Copy peer ID feedback
    const [copiedPeerId, setCopiedPeerId] = useState(false);

    useEffect(() => {
        if (userProfile?.id) {
            import('@/lib/supabase').then(({ supabase }) => {
                // Fetch Bio
                supabase
                    .from('users')
                    .select('bio')
                    .eq('id', userProfile.id)
                    .single()
                    .then(({ data }) => { if (data) setBio(data.bio || ''); });

                // Followers
                supabase
                    .from('follows')
                    .select('id', { count: 'exact', head: true })
                    .eq('following_id', userProfile.id)
                    .eq('status', 'accepted')
                    .then(({ count }) => { if (count !== null) setFollowersCount(count); });

                // Following
                supabase
                    .from('follows')
                    .select('id', { count: 'exact', head: true })
                    .eq('follower_id', userProfile.id)
                    .eq('status', 'accepted')
                    .then(({ count }) => { if (count !== null) setFollowingCount(count); });

                // Fetch YouTube Shorts Interactions
                supabase
                    .from('youtube_shorts_interactions')
                    .select('*')
                    .eq('user_id', userProfile.id)
                    .order('created_at', { ascending: false })
                    .then(({ data }) => {
                        if (data) {
                            const likes = data.filter(d => d.liked);
                            const skips = data.filter(d => d.skipped);

                            // Get unique views by video_id
                            const viewsMap = new Map();
                            data.forEach(d => {
                                if (!viewsMap.has(d.video_id)) viewsMap.set(d.video_id, d);
                            });

                            setLikedShorts(likes);
                            setSkippedShorts(skips);
                            setViewedShorts(Array.from(viewsMap.values()));
                        }
                    });
            });
        }
    }, [userProfile?.id]);

    // ── Actions ──

    const handleLogout = () => { logout(); navigate('/auth'); };

    const handleStartEditName = () => {
        setEditedName(userProfile?.display_name ?? '');
        setIsEditingName(true);
    };

    const handleSaveName = async () => {
        if (!editedName.trim() || !userProfile) return;
        if (editedName.trim() === userProfile.display_name) {
            setIsEditingName(false);
            return;
        }
        setIsSavingName(true);
        try {
            const { error } = await supabase.from('users')
                .update({ display_name: editedName.trim() })
                .eq('id', userProfile.id);
            if (error) throw error;
            // Update both contexts so name reflects everywhere immediately
            updateProfile({ display_name: editedName.trim() });
            setNickname(editedName.trim());
            setNameSaved(true);
            setTimeout(() => setNameSaved(false), 2500);
        } catch (e) {
            console.error('[Profile] Failed to save name:', e);
        } finally {
            setIsSavingName(false);
            setIsEditingName(false);
        }
    };

    const handleStartEditBio = () => {
        setEditedBio(bio);
        setIsEditingBio(true);
    };

    const handleSaveBio = async () => {
        if (!userProfile) return;
        setIsSavingBio(true);
        try {
            const { error } = await supabase.from('users')
                .update({ bio: editedBio.trim() })
                .eq('id', userProfile.id);
            if (error) throw error;
            setBio(editedBio.trim());
            setNameSaved(true); // Re-use the success toast for bio update as well
            setTimeout(() => setNameSaved(false), 2500);
        } catch (e) {
            console.error('[Profile] Failed to save bio:', e);
        } finally {
            setIsSavingBio(false);
            setIsEditingBio(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Reset input so same file can be re-selected
        e.target.value = '';
        if (!file || !userProfile) return;
        if (file.size > 5 * 1024 * 1024) { setPhotoError('Photo must be under 5 MB'); return; }
        setPhotoError(null);

        // Show instant local preview while uploading
        const objectUrl = URL.createObjectURL(file);
        setPhotoPreview(objectUrl);
        setIsUploadingPhoto(true);

        try {
            const ext = file.name.split('.').pop() ?? 'jpg';
            // Always use same filename per user so old one is replaced automatically
            const path = `${userProfile.id}/avatar.${ext}`;
            const { error: upErr } = await supabase.storage
                .from('avatars')
                .upload(path, file, { upsert: true, contentType: file.type });
            if (upErr) throw upErr;

            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
            // Add cache-buster so browser picks up the new image
            const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

            const { error: dbErr } = await supabase
                .from('users')
                .update({ photo_url: publicUrl })
                .eq('id', userProfile.id);
            if (dbErr) throw dbErr;

            // Update in-memory profile (no reload!)
            updateProfile({ photo_url: publicUrl });
            setPhotoPreview(null); // the profile image now reads from userProfile
        } catch (e: any) {
            console.error('[Profile] Photo upload failed:', e);
            setPhotoError(e?.message ?? 'Upload failed. Please try again.');
            setPhotoPreview(null);
        } finally {
            URL.revokeObjectURL(objectUrl);
            setIsUploadingPhoto(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!userProfile || deleteConfirmText !== 'DELETE') return;
        setIsDeletingAccount(true);
        try {
            await supabase.from('follows').delete().or(`follower_id.eq.${userProfile.id},following_id.eq.${userProfile.id}`);
            await supabase.from('recent_connections').delete().eq('user_id', userProfile.id);
            await supabase.from('users').delete().eq('id', userProfile.id);
            logout();
            navigate('/auth');
        } catch (e) {
            console.error('[Profile] Delete account failed:', e);
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleCopyPeerId = () => {
        navigator.clipboard.writeText(userProfile?.peer_id ?? '');
        setCopiedPeerId(true);
        setTimeout(() => setCopiedPeerId(false), 2000);
    };

    const handleEnablePush = async () => {
        const granted = await requestPermission();
        if (granted && userProfile) {
            await subscribeToPush(userProfile.id);
        }
    };

    const handleDownloadApp = async () => {
        const prompt = (window as any).deferredPWAInstallPrompt;
        if (prompt) {
            await prompt.prompt();
            (window as any).deferredPWAInstallPrompt = null;
        } else {
            alert("App is either already installed, or your browser doesn't support automatic installation. On iOS, use the Share button to 'Add to Home Screen'.");
        }
    };

    // ── Guest UI ──
    if (isGuest) {
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
                    className="px-8 h-12 rounded-2xl bg-white text-black font-bold text-[15px]"
                >
                    Sign In Now
                </motion.button>
            </div>
        );
    }

    if (!userProfile) return null;

    const joinDate = new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col px-4 pt-4 pb-12 space-y-6">

            {/* ── Luxury Hero Section ── */}
            <motion.div {...fadeUp(0)} className="relative flex flex-col items-center text-center pt-8 pb-4">
                {/* Immersive Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-64 overflow-hidden pointer-events-none -z-10">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-[#0A84FF] via-[#BF5AF2] to-transparent blur-[80px]"
                    />
                </div>

                <div className="relative group mb-6">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] rounded-[48px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                    <div className="relative h-32 w-32 rounded-[42px] p-1 bg-gradient-to-tr from-white/20 to-transparent border border-white/20 shadow-2xl overflow-hidden backdrop-blur-md">
                        {isUploadingPhoto ? (
                            <div className="h-full w-full flex items-center justify-center bg-black/40 rounded-[38px]">
                                <Loader2 className="h-10 w-10 text-white/60 animate-spin" />
                            </div>
                        ) : (
                            <img
                                src={photoPreview ?? userProfile.photo_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.email}`}
                                alt={userProfile.display_name}
                                className="h-full w-full object-cover rounded-[38px]"
                            />
                        )}

                        {/* Camera Interaction Overlay */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[38px] transition-opacity"
                        >
                            <Camera className="h-8 w-8 text-white" />
                        </motion.button>
                    </div>

                    {/* Hidden file input */}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

                    {/* Quick Edit Badge */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full flex items-center justify-center bg-[#0A84FF] border-[3px] border-[#0A0A0F] shadow-xl text-white"
                    >
                        <Camera className="h-4 w-4" />
                    </motion.button>
                </div>

                <div className="space-y-2 z-10 w-full px-6">
                    {isEditingName ? (
                        <div className="flex flex-col items-center gap-3">
                            <input
                                autoFocus
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                                maxLength={32}
                                className="text-[28px] font-black text-white text-center bg-white/5 backdrop-blur-xl rounded-[24px] px-6 py-3 outline-none border border-white/10 focus:border-[#0A84FF]/60 transition-all w-full max-w-[300px] shadow-2xl"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            />
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleSaveName}
                                    disabled={isSavingName}
                                    className="h-11 px-6 rounded-full bg-[#30D158] text-white font-black uppercase tracking-widest text-[11px] flex items-center gap-2 shadow-lg shadow-[#30D158]/20"
                                >
                                    {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    Save Name
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsEditingName(false)}
                                    className="h-11 w-11 rounded-full bg-white/5 text-white/40 flex items-center justify-center border border-white/10"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center gap-3 group">
                                <h1 className="text-[32px] font-black text-white tracking-tight drop-shadow-2xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {userProfile.display_name}
                                </h1>
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleStartEditName}
                                    className="h-9 w-9 rounded-full flex items-center justify-center bg-white/5 border border-white/5 text-white/30 hover:text-white transition-all shadow-lg"
                                >
                                    <Pencil className="h-4 w-4" />
                                </motion.button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20">
                                    <ShieldCheck className="h-3.5 w-3.5 text-[#30D158]" />
                                    <span className="text-[11px] font-black text-[#30D158] uppercase tracking-[0.1em]">Verified Member</span>
                                </div>
                                <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.1em]">Joined {joinDate}</span>
                            </div>
                        </div>
                    )}

                    {/* Status Feedback Messages */}
                    <AnimatePresence mode="wait">
                        {nameSaved && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="flex justify-center mt-2"
                            >
                                <div className="px-4 py-1.5 rounded-full bg-[#30D158]/20 text-[#30D158] text-[12px] font-bold flex items-center gap-2">
                                    <Check className="h-3.5 w-3.5" /> Identity Updated
                                </div>
                            </motion.div>
                        )}
                        {photoError && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="flex justify-center mt-2"
                            >
                                <div className="px-4 py-1.5 rounded-full bg-[#FF453A]/20 text-[#FF453A] text-[12px] font-bold flex items-center gap-2">
                                    <X className="h-3.5 w-3.5" /> {photoError}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* ── Network & Bio ── */}
            <motion.div {...fadeUp(0.1)} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[12px] font-black text-white/30 uppercase tracking-[0.2em]">Network & Identity</h2>
                </div>

                <div className="flex flex-col gap-3">
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

                    <div className="px-5 py-5 rounded-[24px] bg-white/[0.03] border border-white/[0.05] shadow-xl backdrop-blur-md">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Bio</p>
                            {!isEditingBio && (
                                <button onClick={handleStartEditBio} className="text-[#0A84FF] text-[10px] font-bold uppercase tracking-widest">
                                    Edit
                                </button>
                            )}
                        </div>
                        {isEditingBio ? (
                            <div className="space-y-3">
                                <textarea
                                    value={editedBio}
                                    onChange={(e) => setEditedBio(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[14px] outline-none focus:border-[#0A84FF]/60"
                                    rows={3}
                                    placeholder="Write a little about yourself..."
                                />
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => setIsEditingBio(false)}
                                        className="px-4 py-2 rounded-xl text-white/40 text-[12px] font-bold uppercase"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveBio}
                                        disabled={isSavingBio}
                                        className="px-4 py-2 rounded-xl bg-[#0A84FF] text-white text-[12px] font-bold uppercase shadow-lg shadow-[#0A84FF]/20 flex items-center gap-2"
                                    >
                                        {isSavingBio && <Loader2 className="w-3 h-3 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[14px] text-white/80 leading-relaxed font-medium">
                                {bio || <span className="text-white/20 italic">No bio written yet. Click edit to add one.</span>}
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ── Account Details (Luxury Glass) ── */}
            <motion.div {...fadeUp(0.15)} className="space-y-4">
                <h2 className="text-[12px] font-black text-white/30 uppercase tracking-[0.2em] px-2">Account Intelligence</h2>
                <div className="space-y-0.5 rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/[0.05] backdrop-blur-3xl shadow-2xl">
                    {/* Email */}
                    <motion.div
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                        className="flex items-center gap-4 px-5 py-5 transition-colors"
                    >
                        <div className="h-12 w-12 rounded-[18px] bg-[#0A84FF]/10 flex items-center justify-center shrink-0 border border-[#0A84FF]/20">
                            <Mail className="h-6 w-6 text-[#0A84FF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[16px] font-bold text-white truncate tracking-tight">{userProfile.email}</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.15em] mt-0.5">Verified Identifier</p>
                        </div>
                    </motion.div>

                    <div className="h-[1px] w-full bg-white/[0.05]" />

                    {/* Peer ID */}
                    <motion.div
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                        className="flex items-center gap-4 px-5 py-5 transition-colors"
                    >
                        <div className="h-12 w-12 rounded-[18px] bg-[#BF5AF2]/10 flex items-center justify-center shrink-0 border border-[#BF5AF2]/20">
                            <Fingerprint className="h-6 w-6 text-[#BF5AF2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-[15px] font-black font-mono text-white tracking-[0.1em] uppercase select-all truncate">
                                    {userProfile.peer_id}
                                </p>
                            </div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.15em] mt-0.5">Unique Neural Signature</p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCopyPeerId}
                            className="h-10 w-10 rounded-[14px] bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white transition-all shadow-lg"
                        >
                            {copiedPeerId ? <Check className="h-4 w-4 text-[#30D158]" /> : <Copy className="h-4 w-4" />}
                        </motion.button>
                    </motion.div>

                    <div className="h-[1px] w-full bg-white/[0.05]" />

                    {/* Member Since */}
                    <motion.div
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                        className="flex items-center gap-4 px-5 py-5 transition-colors"
                    >
                        <div className="h-12 w-12 rounded-[18px] bg-[#30D158]/10 flex items-center justify-center shrink-0 border border-[#30D158]/20">
                            <Calendar className="h-6 w-6 text-[#30D158]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[16px] font-bold text-white tracking-tight">{joinDate}</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.15em] mt-0.5">Network Anniversary</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Premium Content Banner ── */}
            <motion.div {...fadeUp(0.18)} className="pt-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadApp}
                    className="w-full relative overflow-hidden rounded-[32px] p-6 text-left group transition-all duration-500 shadow-2xl border border-white/10"
                    style={{
                        background: 'linear-gradient(135deg, rgba(10,132,255,0.2) 0%, rgba(191,90,242,0.2) 100%)',
                    }}
                >
                    {/* Animated Ray */}
                    <motion.div
                        animate={{
                            left: ['-100%', '200%'],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                    />

                    <div className="relative z-10 flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/10 border border-white/20 shadow-2xl backdrop-blur-md">
                            <Download className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[18px] font-black text-white tracking-tight leading-tight">Elite Access</h3>
                            <p className="text-[12px] text-white/60 font-black uppercase tracking-widest mt-1">Install Local Application</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#0A84FF] group-hover:text-white transition-all">
                            <ChevronRight className="h-5 w-5" />
                        </div>
                    </div>
                </motion.button>
            </motion.div>

            {/* ── Shots Activity ── */}
            <motion.div {...fadeUp(0.19)} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[12px] font-black text-white/30 uppercase tracking-[0.2em]">Shots Activity</h2>
                    <div className="flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-[#FF0000]" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="px-4 flex flex-col items-center justify-center py-5 rounded-[24px] bg-white/[0.03] border border-white/[0.05] shadow-xl backdrop-blur-md">
                        <Heart className="h-5 w-5 text-[#FF375F] mb-1" />
                        <p className="text-[18px] font-black text-white">{likedShorts.length}</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Liked</p>
                    </div>
                    <div className="px-4 flex flex-col items-center justify-center py-5 rounded-[24px] bg-white/[0.03] border border-white/[0.05] shadow-xl backdrop-blur-md">
                        <Play className="h-5 w-5 text-white mb-1" />
                        <p className="text-[18px] font-black text-white">{viewedShorts.length}</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Watched</p>
                    </div>
                    <div className="px-4 flex flex-col items-center justify-center py-5 rounded-[24px] bg-white/[0.03] border border-white/[0.05] shadow-xl backdrop-blur-md">
                        <Youtube className="h-5 w-5 text-[#FF9F0A] mb-1 opacity-50" />
                        <p className="text-[18px] font-black text-white">{skippedShorts.length}</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Skipped</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Visual Preference Stack ── */}
            <motion.div {...fadeUp(0.20)} className="space-y-4">
                <h2 className="text-[12px] font-black text-white/30 uppercase tracking-[0.2em] px-2">Preferences & Core</h2>
                <div className="rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/[0.05] shadow-2xl">
                    {/* Push Notifications */}
                    <motion.button
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                        onClick={permission !== 'granted' ? handleEnablePush : undefined}
                        className="flex items-center w-full gap-5 px-5 py-5 text-left transition-colors"
                    >
                        <div className="h-12 w-12 rounded-[18px] bg-[#0A84FF]/10 flex items-center justify-center shrink-0 border border-[#0A84FF]/20">
                            {permission === 'granted' ? <BellRing className="h-6 w-6 text-[#0A84FF]" /> : <Bell className="h-6 w-6 text-[#0A84FF] opacity-30" />}
                        </div>
                        <div className="flex-1">
                            <p className="text-[16px] font-bold text-white tracking-tight">System Notifications</p>
                            <p className="text-[11px] font-black text-[#0A84FF] uppercase tracking-[0.1em] mt-0.5">
                                {permission === 'granted' ? 'Elite Connectivity Active' : permission === 'denied' ? 'Manual Bypass Required' : 'Tap to Synchronize'}
                            </p>
                        </div>
                        {permission !== 'granted' && permission !== 'denied' ? (
                            <ChevronRight className="h-5 w-5 text-white/10" />
                        ) : permission === 'granted' ? (
                            <div className="h-6 w-6 rounded-full bg-[#30D158]/20 flex items-center justify-center">
                                <Check className="h-3.5 w-3.5 text-[#30D158]" />
                            </div>
                        ) : null}
                    </motion.button>
                </div>
            </motion.div>

            {/* ── System Intelligence Actions ── */}
            <motion.div {...fadeUp(0.25)} className="space-y-4">
                <h2 className="text-[12px] font-black text-white/30 uppercase tracking-[0.2em] px-2">Management Terminal</h2>
                <div className="rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/[0.05] shadow-2xl divide-y divide-white/[0.05]">
                    {/* Logout */}
                    <motion.button
                        whileHover={{ backgroundColor: 'rgba(255,69,58,0.05)' }}
                        onClick={handleLogout}
                        className="flex items-center w-full gap-5 px-5 py-5 text-left bg-gradient-to-r from-transparent to-transparent hover:to-[#FF453A]/5 transition-all"
                    >
                        <div className="h-12 w-12 rounded-[18px] bg-[#FF453A]/10 flex items-center justify-center shrink-0 border border-[#FF453A]/20 shadow-lg shadow-[#FF453A]/5">
                            <LogOut className="h-6 w-6 text-[#FF453A]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[16px] font-bold text-[#FF453A] tracking-tight">Deactivate Session</p>
                            <p className="text-[10px] font-black text-[#FF453A]/40 uppercase tracking-[0.15em] mt-0.5">Secure Termination</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[#FF453A]/20" />
                    </motion.button>

                    {/* Delete Account */}
                    <motion.button
                        whileHover={{ backgroundColor: 'rgba(255,69,58,0.08)' }}
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex items-center w-full gap-5 px-5 py-5 text-left transition-all"
                    >
                        <div className="h-12 w-12 rounded-[18px] bg-red-950/20 flex items-center justify-center shrink-0 border border-red-900/40">
                            <Trash2 className="h-6 w-6 text-red-700" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[16px] font-bold text-red-900 tracking-tight">Wipe Core Memory</p>
                            <p className="text-[10px] font-black text-red-900/40 uppercase tracking-[0.15em] mt-0.5">Irreversible Deletion</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-red-900/20" />
                    </motion.button>
                </div>
            </motion.div>

            <motion.p {...fadeUp(0.35)} className="text-center text-[12px] text-white/20 pt-2">
                Togetherly Connect v2.0.0
            </motion.p>

            {/* ── Delete Account Dialog ── */}
            <AnimatePresence>
                {showDeleteDialog && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteDialog(false)}
                            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%', opacity: 0.5 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                            className="fixed bottom-0 left-0 right-0 z-[201] rounded-t-[28px] p-6 space-y-5"
                            style={{ background: 'rgba(20,10,10,0.98)', border: '1px solid rgba(255,69,58,0.2)', paddingBottom: 'env(safe-area-inset-bottom, 28px)' }}
                        >
                            <div className="flex justify-center">
                                <div className="h-1 w-10 rounded-full bg-white/15" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-[#FF453A]/15 flex items-center justify-center">
                                    <Trash2 className="h-6 w-6 text-[#FF453A]" />
                                </div>
                                <div>
                                    <h3 className="text-[18px] font-bold text-white">Delete Account</h3>
                                    <p className="text-[12px] text-white/40">This action is irreversible</p>
                                </div>
                            </div>
                            <p className="text-[14px] text-white/50 leading-relaxed">
                                Your profile, friends list, and all connection history will be permanently deleted. Type <span className="text-[#FF453A] font-bold">DELETE</span> to confirm.
                            </p>
                            <input
                                value={deleteConfirmText}
                                onChange={e => setDeleteConfirmText(e.target.value)}
                                placeholder="Type DELETE to confirm"
                                className="w-full rounded-xl px-4 py-3 text-white text-[15px] outline-none bg-white/5 border border-white/10 focus:border-[#FF453A]/50 transition-colors"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(''); }}
                                    className="flex-1 h-12 rounded-2xl bg-white/10 text-white font-semibold text-[15px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                                    className="flex-1 h-12 rounded-2xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2"
                                    style={{
                                        background: deleteConfirmText === 'DELETE' ? '#FF453A' : 'rgba(255,69,58,0.15)',
                                        color: deleteConfirmText === 'DELETE' ? 'white' : 'rgba(255,69,58,0.4)',
                                    }}
                                >
                                    {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    Delete Forever
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
