
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/hooks/usePeer';

interface ChatNotificationProps {
  message: Message | null;
  onDismiss: () => void;
  onOpenChat: () => void;
}

const ChatNotification = ({ message, onDismiss, onOpenChat }: ChatNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

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
    setTimeout(onDismiss, 300);
  };

  if (!message) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-4 shadow-2xl">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">
                  {message.nickname || 'Friend'}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <p className="text-white/90 text-sm mb-3 line-clamp-2">
              {message.content}
            </p>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={onOpenChat}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-auto"
              >
                Reply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-white/60 hover:text-white hover:bg-white/10 text-xs px-3 py-1 h-auto"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatNotification;
