
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import Chat from "./Chat";
import PeerConnection from "./PeerConnection";
import { AppContextType } from "@/layouts/AppLayout";

const ChatSheet = (props: AppContextType) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="fixed bottom-6 right-6 z-50 rounded-full h-16 w-16 shadow-lg flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90">
            <div className="relative">
                <MessageSquare className="h-7 w-7" />
                {props.isConnected && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                )}
            </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6">
          <SheetTitle className="flex items-center gap-2">
            <Users />
            Room
          </SheetTitle>
          <SheetDescription>
            Connect, chat, and call your friend.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow flex flex-col gap-6 overflow-y-auto px-6 pb-6">
            <PeerConnection 
                peerId={props.peerId}
                connectToPeer={props.connectToPeer}
                isConnected={props.isConnected}
                myNickname={props.myNickname}
                remoteNickname={props.remoteNickname}
                sendData={props.sendData}
                startCall={props.startCall}
                isCallActive={props.isCallActive}
            />
            <Chat 
                messages={props.messages} 
                sendMessage={props.sendMessage} 
                isConnected={props.isConnected} 
                handleSendReaction={props.handleSendReaction}
                handleSendFile={props.handleSendFile}
            />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatSheet;
