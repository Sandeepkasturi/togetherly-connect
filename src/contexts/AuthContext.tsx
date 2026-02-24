import React, {
    createContext, useContext, useState, useEffect,
    useCallback, useRef, ReactNode,
} from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { supabase, DBUser } from '@/lib/supabase';
import { generatePermanentPeerId } from '@/lib/peerId';

// ── Types ─────────────────────────────────────────────────────

export interface GoogleProfile {
    sub: string;
    email: string;
    name: string;
    picture: string;
    given_name?: string;
}

export interface UserProfile extends DBUser {
    // convenience alias
    displayName: string;
    photoURL: string;
}

interface AuthContextType {
    // state
    googleProfile: GoogleProfile | null;
    userProfile: UserProfile | null;
    isGuest: boolean;
    isLoading: boolean;
    isAuthenticated: boolean; // true if google auth OR guest

    // actions
    loginWithGoogle: () => void;
    loginAsGuest: () => void;
    logout: () => void;
    /** Patch the in-memory userProfile without a full reload */
    updateProfile: (patch: Partial<UserProfile>) => void;

    // derived
    permanentPeerId: string | null; // set only for registered users
}

// ── Context ───────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_KEY = 'tg_guest';
const PROFILE_KEY = 'tg_google_profile';

// ── Helpers ───────────────────────────────────────────────────

function safeStorageGet(key: string, type: 'local' | 'session' = 'local'): string | null {
    try {
        const storage = type === 'local' ? window.localStorage : window.sessionStorage;
        return storage.getItem(key);
    } catch (e) {
        console.warn(`[Auth] Failed to access ${type}Storage:`, e);
        return null;
    }
}

function safeStorageSet(key: string, value: string, type: 'local' | 'session' = 'local') {
    try {
        const storage = type === 'local' ? window.localStorage : window.sessionStorage;
        storage.setItem(key, value);
    } catch (e) {
        console.warn(`[Auth] Failed to set ${type}Storage:`, e);
    }
}

function safeStorageRemove(key: string, type: 'local' | 'session' = 'local') {
    try {
        const storage = type === 'local' ? window.localStorage : window.sessionStorage;
        storage.removeItem(key);
    } catch (e) {
        console.warn(`[Auth] Failed to remove ${type}Storage:`, e);
    }
}

function saveProfile(profile: GoogleProfile) {
    safeStorageSet(PROFILE_KEY, JSON.stringify(profile));
}

function loadProfile(): GoogleProfile | null {
    const raw = safeStorageGet(PROFILE_KEY);
    try {
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

// ── Provider ──────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(loadProfile);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isGuest, setIsGuest] = useState(() => safeStorageGet(GUEST_KEY, 'session') === '1');
    const [isLoading, setIsLoading] = useState(true);
    const onlineInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Derived state ─────────────────────────────────────────
    const permanentPeerId = userProfile?.peer_id ?? null;

    // ── Sync user to Supabase after Google login ──────────────
    const syncUserToSupabase = useCallback(async (profile: GoogleProfile): Promise<UserProfile | null> => {
        try {
            // Randomize peerId per session to allow multi-device support
            const peerId = `tg-${Math.random().toString(36).substring(2, 10)}`;

            // Use upsert to handle existing users and update their current session's peerId
            let { data, error } = await supabase
                .from('users')
                .upsert({
                    google_sub: profile.sub,
                    email: profile.email,
                    display_name: profile.name,
                    photo_url: profile.picture,
                    peer_id: peerId,
                    is_online: true,
                    last_seen: new Date().toISOString(),
                }, { onConflict: 'google_sub' })
                .select()
                .maybeSingle();

            // If upsert fails or doesn't return data (due to RLS or other issues), 
            // fallback to finding the user
            if (error || !data) {
                console.warn('[Auth] Upsert failed, attempting fallback fetch:', error);
                const { data: existing } = await supabase
                    .from('users')
                    .select('*')
                    .eq('google_sub', profile.sub)
                    .maybeSingle();

                if (existing) {
                    data = existing;
                    error = null;
                }
            }

            if (error || !data) {
                console.error('[Auth] Supabase sync failed. No UUID available.', error);
                return null;
            }

            const up: UserProfile = {
                ...data,
                displayName: data.display_name,
                photoURL: data.photo_url ?? profile.picture,
            };
            return up;
        } catch (e) {
            console.error('[Auth] syncUserToSupabase critical failure:', e);
            return null;
        }
    }, []);

    // ── Online presence heartbeat ─────────────────────────────
    const startPresence = useCallback((userId: string, peerId: string) => {
        const ping = () => supabase
            .from('users')
            .update({
                is_online: true,
                last_seen: new Date().toISOString(),
                peer_id: peerId
            })
            .eq('id', userId)
            .then(() => {/* silent */ });

        ping();
        onlineInterval.current = setInterval(ping, 30_000);

        const markOffline = () => {
            supabase.from('users')
                .update({ is_online: false, last_seen: new Date().toISOString() })
                .eq('id', userId);
        };

        window.addEventListener('beforeunload', markOffline);
        return () => {
            clearInterval(onlineInterval.current!);
            window.removeEventListener('beforeunload', markOffline);
            markOffline();
        };
    }, []);

    // ── Google login (implicit / token flow via popup) ────────
    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                // Fetch user info from Google
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile: GoogleProfile = await res.json();

                saveProfile(profile);
                setGoogleProfile(profile);
                sessionStorage.removeItem(GUEST_KEY);
                setIsGuest(false);

                const up = await syncUserToSupabase(profile);
                setUserProfile(up);

                if (up) startPresence(up.id, up.peer_id);
            } catch (e) {
                console.error('[Auth] Google login error:', e);
            } finally {
                setIsLoading(false);
            }
        },
        onError: (err) => {
            console.error('[Auth] Google OAuth error:', err);
            setIsLoading(false);
        },
        flow: 'implicit',
    });

    // ── Guest login ───────────────────────────────────────────
    const loginAsGuest = useCallback(() => {
        sessionStorage.setItem(GUEST_KEY, '1');
        setIsGuest(true);
        setGoogleProfile(null);
        setUserProfile(null);
        localStorage.removeItem(PROFILE_KEY);
    }, []);

    // ── Logout ────────────────────────────────────────────────
    const logout = useCallback(() => {
        if (onlineInterval.current) clearInterval(onlineInterval.current);
        if (userProfile) {
            supabase.from('users')
                .update({ is_online: false })
                .eq('id', userProfile.id);
        }
        googleLogout();
        localStorage.removeItem(PROFILE_KEY);
        sessionStorage.removeItem(GUEST_KEY);
        setGoogleProfile(null);
        setUserProfile(null);
        setIsGuest(false);
    }, [userProfile]);

    // ── Update profile in-memory (no full reload needed) ──────
    const updateProfile = useCallback((patch: Partial<UserProfile>) => {
        setUserProfile(prev => {
            if (!prev) return prev;
            const next = { ...prev, ...patch };
            // Keep convenience aliases in sync
            if (patch.display_name) next.displayName = patch.display_name;
            if (patch.photo_url) next.photoURL = patch.photo_url;
            return next;
        });
    }, []);

    // ── Restore session on mount ──────────────────────────────
    useEffect(() => {
        const init = async () => {
            if ((window as any).bootStep) (window as any).bootStep('Restoring Session...');
            const saved = loadProfile();
            if (saved) {
                if ((window as any).bootStep) (window as any).bootStep('Syncing User...');
                const up = await syncUserToSupabase(saved);
                setUserProfile(up);
                if (up) startPresence(up.id, up.peer_id);
            }
            if ((window as any).bootStep) (window as any).bootStep('Auth Ready');
            setIsLoading(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isAuthenticated = !!googleProfile || isGuest;

    return (
        <AuthContext.Provider value={{
            googleProfile, userProfile, isGuest, isLoading, isAuthenticated,
            loginWithGoogle, loginAsGuest, logout, updateProfile, permanentPeerId,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
};
