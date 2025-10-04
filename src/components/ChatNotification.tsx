
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/hooks/usePeer';

interface ChatNotificationProps {
  message: Message | null;
  onDismiss: () => void;
  onOpenChat: () => void;
  onQuickReply?: (replyText: string) => void;
}

const ChatNotification = ({ message, onDismiss, onOpenChat, onQuickReply }: ChatNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation to complete
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsReplying(false);
    setReplyText('');
    setTimeout(onDismiss, 300);
  };

  const handleQuickReply = () => {
    if (replyText.trim() && onQuickReply) {
      onQuickReply(replyText);
      setReplyText('');
      setIsReplying(false);
      handleDismiss();
    }
  };

  const handleReplyClick = () => {
    if (onQuickReply) {
      setIsReplying(true);
    } else {
      onOpenChat();
    }
  };

  if (!message) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0"
        >
          <div className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-pink-900/95 backdrop-blur-xl border border-white/30 rounded-xl p-4 shadow-2xl">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-500 rounded-full p-1.5">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">
                  {message.nickname || 'Friend'}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-white/95 text-sm mb-3 break-words">
              {message.content}
            </p>
            
            {isReplying ? (
              <div className="flex gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickReply()}
                  placeholder="Type your reply..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleQuickReply}
                  disabled={!replyText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleReplyClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 h-auto font-medium"
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  onClick={onOpenChat}
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/20 text-xs px-4 py-2 h-auto"
                >
                  Open Chat
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-white/60 hover:text-white hover:bg-white/20 text-xs px-3 py-2 h-auto ml-auto"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatNotification;
