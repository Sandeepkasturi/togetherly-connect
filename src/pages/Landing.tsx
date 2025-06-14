
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Header from '@/components/Header';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary mb-4">
            Watch YouTube Together.
          </h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Create a private room, invite your friends, and enjoy YouTube videos in perfect sync. Chat, react, and share moments, no matter the distance.
          </p>
          <Button asChild size="lg">
            <Link to="/app">Launch App</Link>
          </Button>
        </motion.div>
      </main>
      <footer className="p-4 text-center text-muted-foreground text-sm">
        <p>Built with ❤️ by Lovable</p>
      </footer>
    </div>
  );
};

export default Landing;
