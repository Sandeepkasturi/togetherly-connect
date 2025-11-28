import { useOutletContext } from "react-router-dom";
import { AppContextType } from "@/layouts/AppLayout";
import Chat from "@/components/Chat";

const ChatPage = () => {
  const context = useOutletContext<AppContextType>();

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0b141a] pb-16">
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
      />
    </div>
  );
};

export default ChatPage;
