import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, MonitorPlay, Plus, Video, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { nanoid } from "nanoid";
import { supabase, DBUser } from "@/lib/supabase";
import { useCallSignaling } from "@/hooks/useCallSignaling";
import { X, Check } from "lucide-react";

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d, ease: [0.32, 0.72, 0, 1] },
});

const RoomsPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  // Friend Selection State
  const [friends, setFriends] = useState<DBUser[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(
    new Set(),
  );
  const [isSelectingFriends, setIsSelectingFriends] = useState(false);
  const [pendingRoomType, setPendingRoomType] = useState<
    "conference" | "party" | null
  >(null);

  const { initiateRoomInvite } = useCallSignaling({
    currentUserId: userProfile?.id ?? "",
    currentPeerId: "", // not fully needed here since we overload caller_peer_id in the hook
    onIncomingCall: () => { },
    onCallAccepted: () => { },
    onCallEnded: () => { },
  });

  // Load friends
  useEffect(() => {
    if (!userProfile) return;
    const loadFriends = async () => {
      const { data } = await supabase
        .from("follows")
        .select(
          "followerUser:users!follower_id(*), followingUser:users!following_id(*)",
        )
        .or(
          `follower_id.eq.${userProfile.id},following_id.eq.${userProfile.id}`,
        )
        .eq("status", "accepted");

      if (data) {
        const friendMap = new Map<string, DBUser>();
        data.forEach((f: any) => {
          const friend =
            f.followerUser.id === userProfile.id
              ? f.followingUser
              : f.followerUser;
          if (friend && !friendMap.has(friend.id)) {
            friendMap.set(friend.id, friend);
          }
        });
        setFriends(Array.from(friendMap.values()));
      }
    };
    loadFriends();
  }, [userProfile]);

  const handleStartRoomCreation = (type: "conference" | "party") => {
    setPendingRoomType(type);
    setIsSelectingFriends(true);
  };

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmAndCreateRoom = async () => {
    if (!pendingRoomType || !userProfile) return;

    setIsCreating(true);
    setIsSelectingFriends(false);
    const roomId = nanoid(10);

    // Send invites to all selected friends
    for (const friendId of Array.from(selectedFriendIds)) {
      await initiateRoomInvite(friendId, roomId, pendingRoomType);
    }

    setTimeout(() => {
      navigate(`/rooms/${roomId}?type=${pendingRoomType}`);
    }, 500);
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-24 space-y-8 min-h-screen">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="pt-6 pb-2 text-center">
        <h1
          className="text-[32px] font-black text-white tracking-tight drop-shadow-2xl"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Rooms
        </h1>
        <p className="text-[14px] text-white/50 mt-1 font-medium">
          Create spaces to connect & watch
        </p>
      </motion.div>

      {/* Action Cards */}
      <div className="space-y-4">
        <motion.button
          {...fadeUp(0.1)}
          disabled={isCreating}
          onClick={() => handleStartRoomCreation("conference")}
          className="w-full relative overflow-hidden rounded-[32px] p-6 text-left group transition-all duration-500 shadow-2xl border border-white/10 hover:-translate-y-1 hover:shadow-[#0A84FF]/20"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,132,255,0.15) 0%, rgba(10,132,255,0.02) 100%)",
          }}
        >
          {/* Animated Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          <div className="absolute inset-0 bg-[#0A84FF] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

          <div className="relative z-10 flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 bg-[#0A84FF]/20 border border-[#0A84FF]/30 shadow-[0_0_20px_rgba(10,132,255,0.2)] backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
              <Users className="h-8 w-8 text-[#0A84FF]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[22px] font-black text-white tracking-tight leading-tight group-hover:text-[#0A84FF] transition-colors">
                Conference Room
              </h3>
              <p className="text-[13px] text-white/50 font-medium tracking-wide mt-1">
                Multi-user high-def video calls
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#0A84FF] group-hover:border-transparent group-hover:text-white transition-all group-hover:rotate-90">
              <Plus className="h-6 w-6" />
            </div>
          </div>
        </motion.button>

        <motion.button
          {...fadeUp(0.2)}
          disabled={isCreating}
          onClick={() => handleStartRoomCreation("party")}
          className="w-full relative overflow-hidden rounded-[32px] p-6 text-left group transition-all duration-500 shadow-2xl border border-white/10 hover:-translate-y-1 hover:shadow-[#BF5AF2]/20"
          style={{
            background:
              "linear-gradient(135deg, rgba(191,90,242,0.15) 0%, rgba(191,90,242,0.02) 100%)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          <div className="absolute inset-0 bg-[#BF5AF2] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

          <div className="relative z-10 flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 bg-[#BF5AF2]/20 border border-[#BF5AF2]/30 shadow-[0_0_20px_rgba(191,90,242,0.2)] backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
              <MonitorPlay className="h-8 w-8 text-[#BF5AF2]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[22px] font-black text-white tracking-tight leading-tight group-hover:text-[#BF5AF2] transition-colors">
                Watch togetherly
              </h3>
              <p className="text-[13px] text-white/50 font-medium tracking-wide mt-1">
                Sync YouTube videos with friends
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#BF5AF2] group-hover:border-transparent group-hover:text-white transition-all group-hover:rotate-90">
              <Plus className="h-6 w-6" />
            </div>
          </div>
        </motion.button>
      </div>

      {/* Feature Description */}
      <motion.div {...fadeUp(0.3)} className="pt-8 text-center px-4">
        <div className="inline-flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 mb-4 shadow-lg backdrop-blur-md">
          <Video className="h-4 w-4 text-white/50" />
          <div className="w-[1px] h-4 bg-white/10" />
          <Phone className="h-4 w-4 text-white/50" />
          <div className="w-[1px] h-4 bg-white/10" />
          <Users className="h-4 w-4 text-white/50" />
        </div>
        <p className="text-[13px] text-white/40 leading-relaxed max-w-[280px] mx-auto">
          Rooms allow you to connect with multiple friends concurrently.
          Standard reliability ensures a stable connection for everyone.
        </p>
      </motion.div>
      {/* Friend Selection Modal */}
      <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300 ${isSelectingFriends ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <motion.div
          animate={isSelectingFriends ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="w-full max-w-sm bg-[#1C1C1E] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
        >
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex flex-col">
              <h3 className="text-[20px] font-black tracking-tight text-white mb-0.5">Invite Friends</h3>
              <p className="text-[11px] text-[#0A84FF] uppercase tracking-[0.15em] font-black">
                {pendingRoomType === "party"
                  ? "▶ Watch togetherly"
                  : "🎥 Conference Room"}
              </p>
            </div>
            <button
              onClick={() => {
                setIsSelectingFriends(false);
                setSelectedFriendIds(new Set());
              }}
              className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            {friends.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center opacity-50">
                <Users className="h-12 w-12 mb-4" />
                <p className="font-bold text-sm">No friends to invite yet</p>
                <p className="text-xs mt-1">Add friends from the Chat tab!</p>
              </div>
            ) : (
              friends.map((friend) => {
                const isSelected = selectedFriendIds.has(friend.id);
                return (
                  <button
                    key={friend.id}
                    onClick={() => toggleFriend(friend.id)}
                    className="w-full flex items-center gap-4 p-3 rounded-[20px] hover:bg-white/5 transition-colors border border-transparent group"
                    style={{
                      borderColor: isSelected
                        ? "rgba(10,132,255,0.3)"
                        : "transparent",
                      background: isSelected ? "rgba(10,132,255,0.08)" : "",
                    }}
                  >
                    <div className="h-12 w-12 rounded-[18px] bg-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF] font-black overflow-hidden border border-white/5 shadow-md group-hover:scale-105 transition-transform">
                      {friend.photo_url ? (
                        <img
                          src={friend.photo_url}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        friend.display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="flex-1 text-left text-white font-bold text-[16px] tracking-tight truncate">
                      {friend.display_name}
                    </span>
                    <div
                      className={`h-7 w-7 rounded-full border flex items-center justify-center transition-all duration-300 ${isSelected ? "bg-[#0A84FF] border-[#0A84FF] scale-110 shadow-[0_0_15px_rgba(10,132,255,0.5)]" : "border-white/20 group-hover:border-white/40"}`}
                    >
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-5 border-t border-white/5 bg-white/[0.02] relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={confirmAndCreateRoom}
              className={`relative overflow-hidden w-full py-4 rounded-[20px] font-black tracking-wide transition-all shadow-2xl flex flex-col items-center justify-center ${selectedFriendIds.size > 0
                  ? "bg-[#0A84FF] text-white hover:bg-[#0070DF] shadow-[#0A84FF]/20"
                  : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                }`}
            >
              <span className="relative z-10 text-[15px] uppercase tracking-wider">
                {selectedFriendIds.size > 0
                  ? `Invite ${selectedFriendIds.size} & Start`
                  : "Start without Invites"}
              </span>
              {selectedFriendIds.size > 0 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoomsPage;
