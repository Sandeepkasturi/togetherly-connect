import { useOutletContext } from "react-router-dom";
import { AppContextType } from "@/layouts/AppLayout";
import Chat from "@/components/Chat";
import { motion } from "framer-motion";
import { MessageCircle, User2, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChatPage = () => {
  const context = useOutletContext<AppContextType>();

  return (
    <div className="fixed inset-0 flex flex-col" style={{ top: 48, bottom: 83 }}>

      {/* iOS iMessage-style header — single peer display */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="shrink-0 ios-tab-bar border-b border-white/[0.06] px-4 py-3 flex items-center gap-3"
      >
        {/* Avatar */}
        <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${context.isConnected
            ? 'bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2]'
            : 'bg-white/10'
          }`}>
          {context.isConnected
            ? <User2 className="h-4 w-4 text-white" />
            : <MessageCircle className="h-4 w-4 text-white/40" />}
        </div>

        {/* Name + status (single instance) */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-white truncate">
            {context.isConnected ? context.remoteNickname : 'No connection'}
          </p>
          <div className="flex items-center gap-1.5">
            {/* Plain dot — no glow */}
            <span className={`h-1.5 w-1.5 rounded-full ${context.isConnected ? 'bg-[#34C85A]' : 'bg-white/20'}`} />
            <span className="text-[12px] text-white/40">
              {context.isConnected ? 'Online' : 'Connect in the Watch tab'}
            </span>
          </div>
        </div>

        {/* ⋮ menu — clear chat lives here */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 flex items-center justify-center rounded-full text-white/40 hover:bg-white/5 transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[hsl(var(--chat-header))] border-white/10 text-white">
            <DropdownMenuItem
              onClick={context.clearChat}
              className="text-[#FF453A] focus:text-[#FF453A] focus:bg-white/5"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Clear Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Chat body fills the rest */}
      <div className="flex-1 overflow-hidden bg-[hsl(var(--chat-bg))]">
        <Chat
          messages={context.messages}
          sendMessage={context.sendMessage}
          isConnected={context.isConnected}
          handleSendReaction={context.handleSendReaction}
          handleSendFile={context.handleSendFile}
          handleSendVoice={context.handleSendVoice}
          handleEditMessage={context.handleEditMessage}
          handleDeleteMessage={context.handleDeleteMessage}
          clearChat={context.clearChat}
          remoteNickname={context.remoteNickname}
        />
      </div>
    </div>
  );
};

export default ChatPage;
