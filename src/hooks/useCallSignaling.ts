import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'active' | 'ended' | 'declined' | 'missed';

export interface CallRecord {
    id: string;
    caller_id: string;
    callee_id: string;
    caller_peer_id: string;
    callee_peer_id: string | null;
    type: CallType;
    status: CallStatus;
    started_at: string;
    ended_at: string | null;
}

interface UseCallSignalingOptions {
    currentUserId: string;
    currentPeerId: string;
    onIncomingCall: (call: CallRecord) => void;
    onCallAccepted: (call: CallRecord) => void;
    onCallEnded: (callId: string) => void;
}

export function useCallSignaling({
    currentUserId,
    currentPeerId,
    onIncomingCall,
    onCallAccepted,
    onCallEnded,
}: UseCallSignalingOptions) {
    const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        if (!currentUserId) return;

        const channel = supabase
            .channel(`calls:${currentUserId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'calls',
                    filter: `callee_id=eq.${currentUserId}`,
                },
                (payload) => {
                    const call = payload.new as CallRecord;
                    if (payload.eventType === 'INSERT' && call.status === 'ringing') {
                        onIncomingCall(call);
                    } else if (payload.eventType === 'UPDATE') {
                        if (call.status === 'ended' || call.status === 'declined') {
                            onCallEnded(call.id);
                            setActiveCall(null);
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'calls',
                    filter: `caller_id=eq.${currentUserId}`,
                },
                (payload) => {
                    const call = payload.new as CallRecord;
                    if (call.status === 'active' && call.callee_peer_id) {
                        setActiveCall(call);
                        onCallAccepted(call);  // caller connects to callee_peer_id
                    } else if (call.status === 'ended' || call.status === 'declined') {
                        onCallEnded(call.id);
                        setActiveCall(null);
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;
        return () => { supabase.removeChannel(channel); };
    }, [currentUserId]);

    // Initiate an outgoing call
    const initiateCall = useCallback(async (
        calleeId: string,
        type: CallType = 'audio'
    ): Promise<CallRecord | null> => {
        const { data, error } = await supabase
            .from('calls')
            .insert({
                caller_id: currentUserId,
                callee_id: calleeId,
                caller_peer_id: currentPeerId,
                type,
                status: 'ringing',
            })
            .select()
            .single();

        if (error || !data) return null;
        setActiveCall(data as CallRecord);

        // Notify callee
        await supabase.from('notifications').insert({
            user_id: calleeId,
            type: 'call',
            title: type === 'video' ? '📹 Incoming Video Call' : '📞 Incoming Call',
            body: 'Tap to answer',
            data: { call_id: data.id, caller_id: currentUserId },
            read: false,
        });

        // Auto-mark as missed after 45s if not answered
        setTimeout(async () => {
            const { data: current } = await supabase
                .from('calls').select('status').eq('id', data.id).single();
            if (current?.status === 'ringing') {
                await supabase.from('calls')
                    .update({ status: 'missed', ended_at: new Date().toISOString() })
                    .eq('id', data.id);
                setActiveCall(null);
            }
        }, 45_000);

        return data as CallRecord;
    }, [currentUserId, currentPeerId]);

    // Accept incoming call — fills callee_peer_id and sets active
    const acceptCall = useCallback(async (callId: string): Promise<CallRecord | null> => {
        const { data, error } = await supabase
            .from('calls')
            .update({ status: 'active', callee_peer_id: currentPeerId })
            .eq('id', callId)
            .select()
            .single();

        if (error || !data) return null;
        setActiveCall(data as CallRecord);
        return data as CallRecord;
    }, [currentPeerId]);

    const declineCall = useCallback(async (callId: string) => {
        await supabase.from('calls')
            .update({ status: 'declined', ended_at: new Date().toISOString() })
            .eq('id', callId);
        setActiveCall(null);
    }, []);

    const endCall = useCallback(async (callId: string) => {
        await supabase.from('calls')
            .update({ status: 'ended', ended_at: new Date().toISOString() })
            .eq('id', callId);
        setActiveCall(null);
    }, []);

    return { activeCall, initiateCall, acceptCall, declineCall, endCall };
}
