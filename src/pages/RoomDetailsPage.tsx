import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useMultiPeer } from "@/hooks/useMultiPeer";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorPlay,
  Maximize2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import YouTubeSearch from "@/components/YouTubeSearch";
import YouTubePlayer from "@/components/YouTubePlayer";
import { DataType } from "@/hooks/usePeer";

// Simple YouTube URL parser
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const VideoTile = ({
  stream,
  name,
  isMuted,
  isHost,
}: {
  stream: MediaStream | null;
  name: string;
  isMuted?: boolean;
  isHost?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-xl border border-white/10 group">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted} // Mute local video
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 rounded-full bg-[#0A84FF] flex items-center justify-center text-white text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[12px] font-medium flex items-center gap-2">
        {name}
        {isHost && <ShieldCheck className="h-3 w-3 text-[#FFD60A]" />}
      </div>
    </div>
  );
};

const RoomDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const roomType =
    (searchParams.get("type") as "conference" | "party") || "conference";
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const {
    myPeerId,
    peers,
    streams,
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    partyState,
    broadcastPartyState,
    grantPlayerAccess,
  } = useMultiPeer(id || "", roomType);

  const [videoInput, setVideoInput] = useState("");
  const playerRef = useRef<HTMLIFrameElement>(null);

  const handleEndCall = () => {
    leaveRoom();
    navigate("/rooms");
  };

  const handlePlayNewVideo = () => {
    const vidId = getYouTubeId(videoInput);
    if (vidId) {
      broadcastPartyState({ videoId: vidId, isPlaying: true, currentTime: 0 });
      setVideoInput("");
    }
  };

  const myPeer = peers.find((p) => p.peerId === myPeerId);
  const isHost = myPeer?.isHost;
  const canControlPlayer = myPeer?.isPlayerGranted || isHost;

  // Adapter to convert YouTubePlayer's `sendData` format to useMultiPeer's `broadcastPartyState`
  const handlePlayerSendData = (data: DataType) => {
    if (data.type === "player_state") {
      const { event, currentTime } = data.payload;
      broadcastPartyState({
        isPlaying: event === "play",
        currentTime: currentTime,
      });
    } else if (data.type === "request_sync" && isHost) {
      // If someone requests sync, the host should oblige.
      const isPlaying = partyState.isPlaying;
      broadcastPartyState({
        // Force broadcast by changing updatedAt
        updatedAt: Date.now()
      });
    }
  };

  // Adapter to convert useMultiPeer's `partyState` into the format YouTubePlayer expects via `playerData`
  // This effectively fakes an incoming PeerJS message from the central room state
  const formattedPlayerData: DataType | null = partyState.videoId ? {
    type: "player_state",
    payload: {
      event: partyState.isPlaying ? "play" : "pause",
      currentTime: partyState.currentTime
    }
  } : null;

  // Grid classes based on participant count
  const totalParticipants = peers.length;
  let gridClass = "grid-cols-2"; // default to 2 cols to fit 4 easily
  if (totalParticipants === 1) gridClass = "grid-cols-1";
  else if (totalParticipants <= 4) gridClass = "grid-cols-2";
  else gridClass = "grid-cols-2 md:grid-cols-3";

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-[100] pt-safe">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          {roomType === "party" ? (
            <MonitorPlay className="h-5 w-5 text-[#BF5AF2]" />
          ) : (
            <Users className="h-5 w-5 text-[#0A84FF]" />
          )}
          <span className="text-white font-bold tracking-widest uppercase text-sm">
            {roomType === "party" ? "Watch togetherly" : "Conference Room"}
          </span>
          <span className="px-2 py-0.5 ml-2 bg-white/10 rounded px text-[10px] text-white/50">
            {id}
          </span>
        </div>
        <div className="text-white/50 text-sm">
          {totalParticipants} Participant{totalParticipants !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Main Content Area - Split cleanly. Pb-40 avoids overlap with bottom controls on mobile */}
      <div
        className={`flex-1 overflow-hidden flex ${roomType === "party" ? "flex-col lg:flex-row" : "flex-col"} p-2 gap-2 pb-40 lg:pb-24`}
      >
        {/* Watch togetherly Player Area */}
        {roomType === "party" && (
          <div className="flex-1 lg:flex-[2] bg-[#0A0A0F] rounded-2xl border border-white/10 flex flex-col shadow-2xl relative overflow-y-auto overflow-x-hidden custom-scrollbar">
            {partyState.videoId ? (
              <div className="flex-1 w-full h-full relative">
                <YouTubePlayer
                  videoId={partyState.videoId}
                  sendData={handlePlayerSendData}
                  playerData={formattedPlayerData}
                  isConnected={true} // In rooms, connectiveness is implied by channel subscription
                />
                {!canControlPlayer && (
                  <div
                    className="absolute inset-0 bg-transparent z-10"
                    title="Only the host can control the player"
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col p-4 md:p-8">
                <div className="text-center mb-6">
                  <MonitorPlay className="h-12 w-12 mx-auto mb-3 opacity-50 text-[#BF5AF2]" />
                  <h2 className="text-xl font-bold mb-1 text-white">
                    Watch togetherly
                  </h2>
                  <p className="text-sm text-white/50">
                    Search and play videos synchronously
                  </p>
                </div>

                {canControlPlayer ? (
                  <div className="max-w-xl mx-auto w-full">
                    <YouTubeSearch
                      isConnected={true}
                      onVideoSelect={(vidId) => {
                        broadcastPartyState({
                          videoId: vidId,
                          isPlaying: true,
                          currentTime: 0,
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-white/40">
                    Waiting for host to pick a video...
                  </div>
                )}
              </div>
            )}

            {/* Host controls overlay when video is playing */}
            {partyState.videoId && canControlPlayer && (
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <div className="flex items-center bg-black/70 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-xl">
                  <input
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    placeholder="New YouTube Link..."
                    className="w-48 bg-transparent border-none outline-none px-3 text-[12px] text-white"
                  />
                  <button
                    onClick={handlePlayNewVideo}
                    className="bg-white/20 text-white px-3 py-1.5 rounded-full font-bold text-[12px] hover:bg-white/30"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Participants Grid Area */}
        <div
          className={`${roomType === "party" ? "flex-1" : "flex-1"} overflow-y-auto custom-scrollbar p-1`}
        >
          <div
            className={`w-full grid ${gridClass} gap-2`}
            style={{ gridAutoRows: 'max-content' }}
          >
            {/* Local User */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1C1C1E]">
              <VideoTile
                stream={localStream}
                name={`${userProfile?.display_name || "You"} (You)`}
                isMuted={true}
                isHost={isHost}
              />
            </div>

            {/* Remote Peers */}
            {peers
              .filter((p) => p.peerId !== myPeerId)
              .map((peer) => (
                <div
                  key={peer.peerId}
                  className="relative group w-full aspect-video rounded-2xl overflow-hidden bg-[#1C1C1E]"
                >
                  <VideoTile
                    stream={streams[peer.peerId] || null}
                    name={peer.displayName}
                    isHost={peer.isHost}
                  />
                  {/* Host Actions */}
                  {isHost && roomType === "party" && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          grantPlayerAccess(peer.userId, !peer.isPlayerGranted)
                        }
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${peer.isPlayerGranted ? "bg-[#FF3B30] text-white" : "bg-[#30D158] text-white"}`}
                      >
                        {peer.isPlayerGranted
                          ? "Revoke Player"
                          : "Grant Player"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="h-24 pb-safe bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center gap-4 z-20 absolute bottom-16 lg:bottom-0 w-full px-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleAudio}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-colors ${!isAudioEnabled ? "bg-[#FF3B30] text-white" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}
        >
          {!isAudioEnabled ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleEndCall}
          className="h-16 w-16 rounded-full flex items-center justify-center bg-[#FF453A] text-white shadow-[0_0_20px_rgba(255,69,58,0.5)] border-2 border-white/10 hover:bg-red-600 transition-colors"
        >
          <PhoneOff className="h-7 w-7" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleVideo}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-colors ${!isVideoEnabled ? "bg-[#FF3B30] text-white" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}
        >
          {!isVideoEnabled ? (
            <VideoOff className="h-6 w-6" />
          ) : (
            <Video className="h-6 w-6" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
