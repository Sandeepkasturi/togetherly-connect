import { useState, useEffect, useRef, useCallback } from 'react';
import type Peer from 'peerjs';
import type { MediaConnection, DataConnection } from 'peerjs';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface RoomPeer {
    userId: string;
    peerId: string;
    displayName: string;
    photoUrl?: string;
    isHost: boolean;
    isPlayerGranted?: boolean; // For Watch Party
}

export type RoomType = 'conference' | 'party';

export const useMultiPeer = (roomId: string, roomType: RoomType = 'conference') => {
    const { userProfile } = useAuth();

    const [peer, setPeer] = useState<Peer | null>(null);
    const [myPeerId, setMyPeerId] = useState<string>('');
    const [peers, setPeers] = useState<RoomPeer[]>([]);
    const [streams, setStreams] = useState<Record<string, MediaStream>>({});
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    // Watch Party State
    const [partyState, setPartyState] = useState<{
        videoId: string | null;
        isPlaying: boolean;
        currentTime: number;
        updatedAt: number;
    }>({ videoId: null, isPlaying: false, currentTime: 0, updatedAt: Date.now() });

    // Refs for keeping track of active connections to prevent duplicates
    const peerInstance = useRef<Peer | null>(null);
    const mediaConnections = useRef<Record<string, MediaConnection>>({});
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const processedPeers = useRef<Set<string>>(new Set());
    const localStreamRef = useRef<MediaStream | null>(null);

    // Initialize Local Media
    useEffect(() => {
        let activeStream: MediaStream | null = null;
        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                localStreamRef.current = stream;
                activeStream = stream;
            } catch (e) {
                console.error("Failed to get local media", e);
                // Optionally start with audio only, or empty stream if permission denied
            }
        };
        initMedia();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Initialize PeerJS and Realtime Channel
    useEffect(() => {
        if (!userProfile || !localStreamRef.current) return;

        let activePeer: Peer | null = null;

        const initPeer = async () => {
            const { default: PeerClass } = await import('peerjs');

            // Generate a random peer ID for this specific room session
            const newPeer = new PeerClass(`room_${userProfile.id}_${Math.random().toString(36).substring(2, 9)}`, {
                host: '0.peerjs.com',
                port: 443,
                path: '/',
                secure: true,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ]
                }
            });

            newPeer.on('open', (id) => {
                setMyPeerId(id);
                peerInstance.current = newPeer;
                setPeer(newPeer);
                activePeer = newPeer;

                // Join Supabase Presence Channel
                setupPresence(id);
            });

            // Handle incoming media calls
            newPeer.on('call', (call) => {
                if (!localStreamRef.current) return;

                // Process peer to avoid mutual duplicate calling
                processedPeers.current.add(call.peer);

                call.answer(localStreamRef.current);

                call.on('stream', (remoteStream) => {
                    const callerUserId = call.metadata?.userId;
                    if (callerUserId) {
                        setStreams(prev => ({ ...prev, [callerUserId]: remoteStream }));
                    }
                });

                call.on('close', () => {
                    const callerUserId = call.metadata?.userId;
                    if (callerUserId) {
                        setStreams(prev => {
                            const next = { ...prev };
                            delete next[callerUserId];
                            return next;
                        });
                    }
                });

                mediaConnections.current[call.peer] = call;
            });
        };

        const setupPresence = (currentPeerId: string) => {
            const channel = supabase.channel(`room:${roomId}`, {
                config: { presence: { key: userProfile.id } }
            });

            channelRef.current = channel;

            const myPresenceState: RoomPeer = {
                userId: userProfile.id,
                peerId: currentPeerId,
                displayName: userProfile.display_name,
                photoUrl: userProfile.photo_url || undefined,
                isHost: false, // Will resolve host logic later based on who created
                isPlayerGranted: false
            };

            channel
                .on('presence', { event: 'sync' }, () => {
                    const newState = channel.presenceState<RoomPeer>();
                    const currentPeers: RoomPeer[] = [];

                    let minDate = Date.now();
                    let hostId = myPresenceState.userId; // Default to self

                    Object.values(newState).forEach(presences => {
                        // A user might have multiple connections (tabs) under the same userId
                        presences.forEach(presenceInfo => {
                            if (presenceInfo) {
                                currentPeers.push(presenceInfo);

                                // Naive Host resolution: Sort by userId or presence join time (if provided)
                                // For reliable host: Host is the one whose userId created the room.
                                // If we don't know who created it, we can just pick the alphabetically first ID for now.
                                if (presenceInfo.userId < hostId) hostId = presenceInfo.userId;
                            }
                        });
                    });

                    // Update who is host
                    const updatedPeers = currentPeers.map(p => ({
                        ...p,
                        isHost: p.userId === hostId,
                        isPlayerGranted: p.userId === hostId ? true : p.isPlayerGranted
                    }));

                    setPeers(updatedPeers);

                    // Connect to new peers
                    updatedPeers.forEach(p => {
                        if (p.userId !== userProfile.id && !processedPeers.current.has(p.peerId)) {
                            connectToNewPeer(p, currentPeerId);
                        }
                    });
                })
                .on('broadcast', { event: 'PARTY_STATE' }, (payload) => {
                    setPartyState(payload.payload);
                })
                .on('broadcast', { event: 'GRANT_PLAYER' }, (payload) => {
                    setPeers(prev => prev.map(p => p.userId === payload.payload.userId ? { ...p, isPlayerGranted: payload.payload.granted } : p));
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track(myPresenceState);
                    }
                });
        };

        const connectToNewPeer = (remotePeer: RoomPeer, myPid: string) => {
            if (!peerInstance.current || !localStreamRef.current) return;

            processedPeers.current.add(remotePeer.peerId);

            // 1. Call for Media
            const call = peerInstance.current.call(remotePeer.peerId, localStreamRef.current, {
                metadata: { userId: userProfile.id }
            });

            if (call) {
                call.on('stream', (remoteStream) => {
                    setStreams(prev => ({ ...prev, [remotePeer.userId]: remoteStream }));
                });
                call.on('close', () => {
                    setStreams(prev => {
                        const next = { ...prev };
                        delete next[remotePeer.userId];
                        return next;
                    });
                });
                mediaConnections.current[remotePeer.peerId] = call;
            }
        };

        if (localStreamRef.current) {
            initPeer();
        }

        return () => {
            if (channelRef.current) channelRef.current.unsubscribe();
            if (activePeer) activePeer.destroy();
            Object.values(mediaConnections.current).forEach(c => c.close());
        };
    }, [userProfile, roomId, localStream]); // re-run only if stream initializes

    // Toggle Media Controls
    const toggleAudio = useCallback(() => {
        if (localStream) {
            const track = localStream.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsAudioEnabled(track.enabled);
            }
        }
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            const track = localStream.getVideoTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsVideoEnabled(track.enabled);
            }
        }
    }, [localStream]);

    // Cleanup
    const leaveRoom = useCallback(() => {
        if (channelRef.current) channelRef.current.unsubscribe();
        if (peerInstance.current) peerInstance.current.destroy();
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    }, []);

    // Watch Party Sync Methods
    const broadcastPartyState = useCallback((state: Partial<typeof partyState>) => {
        const nextState = { ...partyState, ...state, updatedAt: Date.now() };
        setPartyState(nextState);

        if (channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'PARTY_STATE',
                payload: nextState
            });
        }
    }, [partyState]);

    const grantPlayerAccess = useCallback((targetUserId: string, granted: boolean) => {
        if (channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'GRANT_PLAYER',
                payload: { userId: targetUserId, granted }
            });
            // Also update locally
            setPeers(prev => prev.map(p => p.userId === targetUserId ? { ...p, isPlayerGranted: granted } : p));
        }
    }, []);

    return {
        myPeerId,
        peers,
        streams,
        localStream,
        isAudioEnabled,
        isVideoEnabled,
        toggleAudio,
        toggleVideo,
        leaveRoom,
        roomId,
        partyState,
        broadcastPartyState,
        grantPlayerAccess
    };
};
