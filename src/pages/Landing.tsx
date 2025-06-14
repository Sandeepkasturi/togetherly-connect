import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Github, Linkedin, Instagram } from 'lucide-react';

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
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-4">
            Togetherly is a platform designed for private, real-time collaboration. Whether you're watching videos with friends, chatting securely, or sharing files, our peer-to-peer technology ensures your data stays between you and your connections, with no servers in the middle.
          </p>
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
      <footer className="p-8 border-t border-border text-center text-muted-foreground text-sm">
        <div className="max-w-4xl mx-auto">
            <p className="mb-4">
                A project by <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">SKAV TECH</a>, developed by Sandeep Kasturi.
            </p>
            <div className="flex justify-center gap-6 mb-4">
                <a href="https://instagram.com/sandeep_kasturi_" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="h-5 w-5" />
                </a>
                <a href="https://github.com/sandeepkasturi" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
                    <Github className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/in/sandeepkasturi9/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="h-5 w-5" />
                </a>
            </div>
            <p>&copy; {new Date().getFullYear()} <span className="font-semibold text-primary">Togetherly</span>. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
