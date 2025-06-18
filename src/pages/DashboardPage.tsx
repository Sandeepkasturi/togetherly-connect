
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '@/layouts/AppLayout';
import { motion } from 'framer-motion';
import PeerConnection from '@/components/PeerConnection';
import { Users, Tv, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const DashboardPage = () => {
  const context = useOutletContext<AppContextType>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Tv className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              TOGETHERLY
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Connect with friends and start watching together
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/20 p-6">
              <div className="flex items-center gap-4 mb-6">
                <Users className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-semibold">User Profile</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500">
                  <AvatarFallback className="text-white font-bold text-lg">
                    {context.myNickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {context.myNickname}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Ready to connect
                  </p>
                </div>
              </div>

              {/* Connection Status */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${context.isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <span className={`text-sm ${context.isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
                      {context.isConnected ? `Connected to ${context.remoteNickname}` : 'Waiting for connection'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Connection Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <PeerConnection 
                peerId={context.peerId}
                connectToPeer={context.connectToPeer}
                isConnected={context.isConnected}
                myNickname={context.myNickname}
                remoteNickname={context.remoteNickname}
                sendData={context.sendData}
                startCall={context.startCall}
                isCallActive={context.isCallActive}
              />
            </Card>
          </motion.div>
        </div>

        {/* Connection Summary */}
        {context.isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-2xl mx-auto mt-8"
          >
            <Card className="bg-green-500/10 border-green-500/20 p-6 text-center">
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                🎉 Successfully Connected!
              </h3>
              <p className="text-gray-300">
                You're now connected to <strong>{context.remoteNickname}</strong>. 
                Head to the Watch page to start enjoying content together.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Ambient effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
