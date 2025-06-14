
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Github, Linkedin, Instagram, Youtube, ShieldCheck, FileUp, Video, KeyRound, Share2, Link2 } from 'lucide-react';

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
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-primary mb-4">
              Your Private Space for Real-Time Connection.
            </h1>
            <p className="max-w-3xl mx-auto text-base md:text-lg text-muted-foreground mb-8">
              Togetherly offers a suite of private, real-time collaboration tools. All interactions are peer-to-peer, ensuring your data stays between you and your connections, with no servers in the middle.
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
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-20 bg-background/50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Core Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center p-6 border border-border rounded-lg bg-background/20 hover:border-primary/50 hover:bg-background/40 transition-all">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                            <Youtube className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Synchronized YouTube</h3>
                        <p className="text-muted-foreground text-sm">Watch videos together in perfect sync.</p>
                    </div>
                    <div className="text-center p-6 border border-border rounded-lg bg-background/20 hover:border-primary/50 hover:bg-background/40 transition-all">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Secure Chat</h3>
                        <p className="text-muted-foreground text-sm">Chat securely with end-to-end encryption.</p>
                    </div>
                    <div className="text-center p-6 border border-border rounded-lg bg-background/20 hover:border-primary/50 hover:bg-background/40 transition-all">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                            <FileUp className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">P2P File Sharing</h3>
                        <p className="text-muted-foreground text-sm">Share files directly and privately with your peer.</p>
                    </div>
                    <div className="text-center p-6 border border-border rounded-lg bg-background/20 hover:border-primary/50 hover:bg-background/40 transition-all">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                            <Video className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Video Calls</h3>
                        <p className="text-muted-foreground text-sm">Connect face-to-face with high-quality video calls.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-12 md:py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10 text-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
                            <KeyRound className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">1. Get Your ID</h3>
                        <p className="text-muted-foreground">Launch the app to get your unique, private Peer ID.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
                            <Share2 className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">2. Share Securely</h3>
                        <p className="text-muted-foreground">Share your ID with a friend you want to connect with.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
                            <Link2 className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">3. Connect & Collaborate</h3>
                        <p className="text-muted-foreground">Your friend uses your ID to establish a secure P2P connection.</p>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <footer className="bg-secondary/30 border-t border-border text-sm">
        <div className="container mx-auto px-4 py-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-primary">Togetherly</h3>
                    <p className="text-muted-foreground">A project by <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">SKAV TECH</a></p>
                    <p className="text-muted-foreground">Developed by Sandeep Kasturi.</p>
                </div>
                <div className="lg:mx-auto">
                    <h3 className="text-lg font-semibold text-primary mb-2">Connect with the developer</h3>
                    <div className="flex gap-4">
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
                </div>
                <div className="sm:col-span-2 lg:col-span-1 lg:text-right">
                    <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Togetherly. All Rights Reserved.</p>
                </div>
            </div>
            <div className="mt-6 text-center border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                    Inspiration and love goes to "S" ❤️
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
