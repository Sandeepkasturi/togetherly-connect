import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import {
    LogOut, Mail, Fingerprint, Calendar, User, ExternalLink,
    ChevronRight, ShieldCheck, Pencil, Camera, Trash2, X, Check, Loader2, Copy
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: d, ease: [0.32, 0.72, 0, 1] },
});

const ProfilePage = () => {
    const { userProfile, logout, isGuest, updateProfile } = useAuth();
    const { setNickname } = useUser();
    const navigate = useNavigate();
    const [recentConnections, setRecentConnections] = useState<any[]>([]);

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
                supabase
                    .from('recent_connections')
                    .select('*')
                    .eq('user_id', userProfile.id)
                    .order('last_connected_at', { ascending: false })
                    .limit(5)
                    .then(({ data }) => { if (data) setRecentConnections(data); });
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
        <div className="min-h-full px-4 pt-4 pb-24 space-y-6 overflow-y-auto">

            {/* ── Header / Avatar ── */}
            <motion.div {...fadeUp(0)} className="flex flex-col items-center text-center space-y-4 pt-4">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] rounded-[40px] blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative h-28 w-28 rounded-[38px] overflow-hidden border-2 border-white/10 bg-black">
                        {isUploadingPhoto ? (
                            <div className="h-full w-full flex items-center justify-center bg-black/60">
                                <Loader2 className="h-8 w-8 text-white/60 animate-spin" />
                            </div>
                        ) : (
                            <img
                                src={photoPreview ?? userProfile.photo_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.email}`}
                                alt={userProfile.display_name}
                                className="h-full w-full object-cover rounded-[32px]"
                            />
                        )}
                        {/* Camera overlay */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 flex items-center justify-center rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(0,0,0,0.55)' }}
                        >
                            <Camera className="h-7 w-7 text-white" />
                        </button>
                    </div>
                    {/* Hidden file input */}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

                    {/* Edit photo button (always visible on mobile) */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: '#0A84FF', border: '2px solid black' }}
                    >
                        <Camera className="h-3.5 w-3.5 text-white" />
                    </button>
                </div>

                <div className="space-y-1">
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                                maxLength={32}
                                className="text-[22px] font-bold text-white text-center bg-white/10 rounded-xl px-3 py-1 outline-none border border-[#0A84FF]/40 focus:border-[#0A84FF] transition-colors w-48"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            />
                            <button onClick={handleSaveName} disabled={isSavingName}
                                className="h-8 w-8 rounded-full bg-[#30D158]/20 text-[#30D158] flex items-center justify-center">
                                {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button onClick={() => setIsEditingName(false)}
                                className="h-8 w-8 rounded-full bg-white/10 text-white/50 flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-[26px] font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {userProfile.display_name}
                            </h1>
                            <button
                                onClick={handleStartEditName}
                                className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/30 hover:text-white"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                    <p className="text-[14px] text-white/40 font-medium tracking-wide flex items-center justify-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-[#30D158]" /> Verified Member
                    </p>
                    {/* Name saved flash */}
                    <AnimatePresence>
                        {nameSaved && (
                            <motion.p
                                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="text-[12px] text-[#30D158] font-semibold flex items-center gap-1"
                            >
                                <Check className="h-3 w-3" /> Name updated!
                            </motion.p>
                        )}
                    </AnimatePresence>
                    {/* Photo error */}
                    <AnimatePresence>
                        {photoError && (
                            <motion.p
                                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="text-[12px] text-[#FF453A] font-semibold flex items-center gap-1"
                            >
                                <X className="h-3 w-3" /> {photoError}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* ── Recent Connections ── */}
            <motion.div {...fadeUp(0.1)} className="space-y-3">
                <h2 className="text-[13px] font-bold text-white/30 uppercase tracking-widest px-2">Recent Connections</h2>
                <div className="ios-card divide-y divide-white/[0.06]">
                    {recentConnections.length > 0 ? (
                        recentConnections.map((conn) => (
                            <div key={conn.id} className="flex items-center gap-4 px-4 py-3">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-white/30" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-semibold text-white truncate">{conn.nickname}</p>
                                    <p className="text-[11px] text-white/30 truncate font-mono">{conn.peer_id}</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { localStorage.setItem('peerIdToConnect', conn.peer_id); navigate('/app'); }}
                                    className="px-3 py-1.5 rounded-lg text-[12px] font-bold border border-[#0A84FF]/20"
                                    style={{ background: 'rgba(10,132,255,0.10)', color: '#0A84FF' }}
                                >
                                    Connect
                                </motion.button>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-8 text-center">
                            <p className="text-[14px] text-white/30 italic">No recent connections yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── Account Info ── */}
            <motion.div {...fadeUp(0.15)} className="space-y-3">
                <h2 className="text-[13px] font-bold text-white/30 uppercase tracking-widest px-2">Account Info</h2>
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
                            <p className="text-[14px] font-mono font-bold text-white tracking-wider uppercase select-all truncate">
                                {userProfile.peer_id}
                            </p>
                            <p className="text-[12px] text-white/40">Permanent Peer ID</p>
                        </div>
                        <button
                            onClick={handleCopyPeerId}
                            className="p-2 text-white/30 hover:text-white/60 transition-colors"
                        >
                            {copiedPeerId ? <Check className="h-4 w-4 text-[#30D158]" /> : <Copy className="h-4 w-4" />}
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

            {/* ── System Actions ── */}
            <motion.div {...fadeUp(0.25)} className="space-y-3">
                <h2 className="text-[13px] font-bold text-white/30 uppercase tracking-widest px-2">Account</h2>
                <div className="ios-card overflow-hidden divide-y divide-white/[0.06]">
                    {/* Edit Name */}
                    <button
                        onClick={handleStartEditName}
                        className="flex items-center w-full gap-4 px-4 py-4 text-left hover:bg-white/[0.03] transition-colors"
                    >
                        <div className="h-10 w-10 rounded-xl bg-[#0A84FF]/10 flex items-center justify-center shrink-0">
                            <Pencil className="h-5 w-5 text-[#0A84FF]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-semibold text-white">Edit Display Name</p>
                            <p className="text-[12px] text-white/40">Change how others see you</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/20" />
                    </button>

                    {/* Edit Photo */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center w-full gap-4 px-4 py-4 text-left hover:bg-white/[0.03] transition-colors"
                    >
                        <div className="h-10 w-10 rounded-xl bg-[#BF5AF2]/10 flex items-center justify-center shrink-0">
                            <Camera className="h-5 w-5 text-[#BF5AF2]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-semibold text-white">Change Profile Photo</p>
                            <p className="text-[12px] text-white/40">Upload a new photo (max 5MB)</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/20" />
                    </button>

                    {/* Sign Out */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-4 px-4 py-4 text-left hover:bg-[#FF453A]/5 transition-colors"
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

                    {/* Delete Account */}
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex items-center w-full gap-4 px-4 py-4 text-left hover:bg-[#FF453A]/5 transition-colors"
                    >
                        <div className="h-10 w-10 rounded-xl bg-[#FF453A]/10 flex items-center justify-center shrink-0">
                            <Trash2 className="h-5 w-5 text-[#FF453A]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-semibold text-[#FF453A]">Delete Account</p>
                            <p className="text-[12px] text-[#FF453A]/40">Permanently remove your account</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#FF453A]/20" />
                    </button>
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
