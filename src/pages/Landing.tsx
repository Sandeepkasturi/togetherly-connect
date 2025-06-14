
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const Landing = () => {
  const { nickname, setNickname } = useUser();
  const [inputNickname, setInputNickname] = useState(nickname);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLaunch = () => {
    if (inputNickname.trim().length < 3) {
      toast({
        title: 'Nickname too short',
        description: 'Please enter a nickname with at least 3 characters.',
        variant: 'destructive',
      });
      return;
    }
    setNickname(inputNickname.trim());
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-background to-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary mb-4">
            Your Private Space for Real-Time Connection.
          </h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Enjoy synchronized YouTube, secure chat, file sharing, and video calls. All peer-to-peer, ensuring your interactions are private and seamless.
          </p>
          <div className="max-w-sm mx-auto space-y-4">
            <div className="grid w-full items-center gap-1.5 text-left">
              <Label htmlFor="nickname">Choose your Nickname</Label>
              <Input 
                id="nickname"
                type="text" 
                placeholder="Your cool name"
                value={inputNickname}
                onChange={(e) => setInputNickname(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLaunch()}
                className="text-center text-base"
              />
            </div>
            <Button size="lg" onClick={handleLaunch} className="w-full">
              Launch App
            </Button>
          </div>
        </motion.div>
      </main>
      <footer className="p-4 text-center text-muted-foreground text-sm">
        <p>Built with ❤️ by Lovable</p>
      </footer>
    </div>
  );
};

export default Landing;
