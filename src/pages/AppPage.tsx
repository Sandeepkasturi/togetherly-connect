import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Instagram, Youtube, ShieldCheck, FileUp, Video, KeyRound, Share2, Link2 } from 'lucide-react';
import ProductHuntBadge from '@/components/ProductHuntBadge';

const AppPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero text-foreground flex flex-col relative overflow-hidden pb-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-gradient-primary mb-6 font-display">
              Your Private Space for Real-Time Connection.
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground/90 mb-10 leading-relaxed">
              Togetherly offers a suite of private, real-time collaboration tools. All interactions are peer-to-peer, ensuring your data stays between you and your connections, with no servers in the middle.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/watch')}
              className="glass hover:glass-strong hover:glow-primary transition-all duration-300 hover:scale-105 font-semibold text-lg py-6 rounded-xl"
            >
              Get Started ✨
            </Button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-20 bg-gradient-surface/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gradient-accent font-display">Core Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center p-8 glass rounded-2xl hover:glow-card hover:scale-105 transition-all duration-500 group"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-primary-foreground mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Youtube className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-xl mb-3 text-foreground">Synchronized YouTube</h3>
                <p className="text-muted-foreground">Watch videos together in perfect sync.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center p-8 glass rounded-2xl hover:glow-card hover:scale-105 transition-all duration-500 group"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent text-accent-foreground mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-xl mb-3 text-foreground">Secure Chat</h3>
                <p className="text-muted-foreground">Chat securely with end-to-end encryption.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center p-8 glass rounded-2xl hover:glow-card hover:scale-105 transition-all duration-500 group"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-primary-foreground mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileUp className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-xl mb-3 text-foreground">P2P File Sharing</h3>
                <p className="text-muted-foreground">Share files directly and privately with your peer.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-8 glass rounded-2xl hover:glow-card hover:scale-105 transition-all duration-500 group"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent text-accent-foreground mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-xl mb-3 text-foreground">Video Calls</h3>
                <p className="text-muted-foreground">Connect face-to-face with high-quality video calls.</p>
              </motion.div>
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

      <footer className="bg-secondary/30 border-t border-border text-sm relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary">Togetherly</h3>
              <p className="text-muted-foreground">A project by <a href="https://skavtechs.vercel.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">SKAV TECH</a></p>
              <p className="text-muted-foreground">Developed by Sandeep Kasturi.</p>
              <p className="text-xs text-muted-foreground pt-2">
                All my inspiration and love goes to 'S' — thank you for being my strength and continuous supporter ❤️.
              </p>
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
            <ProductHuntBadge />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppPage;
