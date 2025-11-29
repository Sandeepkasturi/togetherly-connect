
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const peerId = searchParams.get('peerId');
    if (peerId) {
      localStorage.setItem('peerIdToConnect', peerId);
    }
    navigate('/watch');
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold">Preparing your connection...</p>
        <p className="text-muted-foreground">You will be redirected shortly to set up your nickname.</p>
      </div>
    </div>
  );
};

export default JoinPage;
