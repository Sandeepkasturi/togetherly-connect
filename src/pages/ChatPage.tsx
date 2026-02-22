import { useOutletContext } from "react-router-dom";
import { AppContextType } from "@/layouts/AppLayout";
import Chat from "@/components/Chat";

const ChatPage = () => {
  const context = useOutletContext<AppContextType>();

  return (
    <div className="fixed inset-0 flex flex-col bg-[hsl(var(--chat-bg))] pb-[88px] lg:pb-0">
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
  );
};

export default ChatPage;
