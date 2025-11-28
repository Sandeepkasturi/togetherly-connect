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
    navigate('/watch');
  };

  return (
    <div className="min-h-screen bg-gradient-hero text-foreground flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <Header />
      <main className="flex-grow relative z-10">
        {/* Hero Section - Mobile First */}
        <section className="text-center px-4 py-8 sm:py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-gradient-primary mb-4 sm:mb-6 font-display leading-tight px-2">
              Your Private Space for Real-Time Connection
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground/90 mb-8 sm:mb-10 leading-relaxed px-2">
              Watch videos together, chat securely, and share files—all peer-to-peer with no servers in between.
            </p>
            <div className="max-w-md mx-auto space-y-4 sm:space-y-5 px-2">
              <div className="grid w-full items-center gap-2 text-left glass p-4 sm:p-6 rounded-2xl">
                <Label htmlFor="nickname" className="text-sm sm:text-base font-medium">Choose your Nickname</Label>
                <Input 
                  id="nickname"
                  type="text" 
                  placeholder="Enter your name"
                  value={inputNickname}
                  onChange={(e) => setInputNickname(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLaunch()}
                  className="text-center text-base sm:text-lg h-12 sm:h-14 rounded-xl"
                />
              </div>
              <Button 
                size="lg" 
                onClick={handleLaunch} 
                className="w-full animated-gradient hover:glow-primary transition-all duration-300 hover:scale-105 active:scale-95 font-semibold text-base sm:text-lg h-14 sm:h-16 rounded-xl shadow-lg"
              >
                Launch App ✨
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Features Section - Mobile Optimized */}
        <section id="features" className="py-10 sm:py-12 md:py-20 bg-gradient-surface/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 text-gradient-accent font-display">Core Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center p-6 sm:p-8 glass rounded-2xl hover:glow-card hover:scale-105 transition-all duration-500 group"
                    >
                        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary text-primary-foreground mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Youtube className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-foreground">Synchronized YouTube</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Watch videos together in perfect sync.</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center p-6 sm:p-8 glass rounded-2xl hover:glow-card hover:scale-105 transition-all duration-500 group"
                    >
                        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-accent text-accent-foreground mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-foreground">Secure Chat</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Chat securely with end-to-end encryption.</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center p-6 sm:p-8 glass rounded-2xl hover:glow-card hover:scale-105 transition-all duration-500 group"
                    >
                        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary text-primary-foreground mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                            <FileUp className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-foreground">P2P File Sharing</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Share files directly and privately with your peer.</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center p-6 sm:p-8 glass rounded-2xl hover:glow-card hover:scale-105 transition-all duration-500 group"
                    >
                        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-accent text-accent-foreground mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Video className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-foreground">Video Calls</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Connect face-to-face with high-quality video calls.</p>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* How it Works Section - Mobile Optimized */}
        <section id="how-it-works" className="py-10 sm:py-12 md:py-20">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 sm:gap-10 text-center">
                    <div className="flex flex-col items-center p-4">
                        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground mb-4">
                            <KeyRound className="h-7 w-7 sm:h-8 sm:w-8" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-2">1. Get Your ID</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Launch the app to get your unique, private Peer ID.</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground mb-4">
                            <Share2 className="h-7 w-7 sm:h-8 sm:w-8" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-2">2. Share Securely</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Share your ID with a friend you want to connect with.</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground mb-4">
                            <Link2 className="h-7 w-7 sm:h-8 sm:w-8" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-2">3. Connect & Collaborate</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Your friend uses your ID to establish a secure P2P connection.</p>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <footer className="bg-secondary/30 border-t border-border text-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                <div className="space-y-2 text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-bold text-primary">Togetherly</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">A project by <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">SKAV TECH</a></p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Developed by Sandeep Kasturi.</p>
                    <p className="text-xs text-muted-foreground pt-2">
                        All my inspiration and love goes to 'S' — thank you for being my strength and continuous supporter ❤️.
                    </p>
                </div>
                <div className="text-center sm:text-left lg:mx-auto">
                    <h3 className="text-base sm:text-lg font-semibold text-primary mb-3">Connect with the developer</h3>
                    <div className="flex gap-4 justify-center sm:justify-start">
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
                <div className="text-center sm:col-span-2 lg:col-span-1 lg:text-right">
                    <p className="text-xs sm:text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Togetherly. All Rights Reserved.</p>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
