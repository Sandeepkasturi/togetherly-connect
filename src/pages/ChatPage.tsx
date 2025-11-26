import { useOutletContext } from "react-router-dom";
import { AppContextType } from "@/layouts/AppLayout";
import Chat from "@/components/Chat";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

const ChatPage = () => {
  const context = useOutletContext<AppContextType>();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-4 pt-4 pb-3 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-tight">Chat</h1>
            <p className="text-xs text-muted-foreground">
              {context.isConnected ? "You are connected. Messages sync in real time." : "Connect from Watch tab to start chatting."}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 py-3">
        <Card className="h-full bg-card/90 border-border/70">
          <Chat
            messages={context.messages}
            sendMessage={context.sendMessage}
            isConnected={context.isConnected}
            handleSendReaction={context.handleSendReaction}
            handleSendFile={context.handleSendFile}
          />
        </Card>
      </main>
    </div>
  );
};

export default ChatPage;
