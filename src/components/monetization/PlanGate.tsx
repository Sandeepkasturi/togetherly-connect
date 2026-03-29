import { PlanType } from '@/types/subscription';
import { Lock, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PlanGateProps {
  requiredPlan: PlanType | PlanType[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradeButton?: boolean;
}

const PlanGate = ({
  requiredPlan,
  children,
  fallback,
  showUpgradeButton = true,
}: PlanGateProps) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  // Mock current plan - will be replaced with real subscription data
  const currentPlan: PlanType = 'free';

  const requiredPlans = Array.isArray(requiredPlan)
    ? requiredPlan
    : [requiredPlan];

  const hasAccess = requiredPlans.includes(currentPlan) || currentPlan === 'premium';

  if (hasAccess) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-6 p-8 rounded-2xl border border-white/10 bg-white/5">
      <div className="text-center">
        {requiredPlans.includes('premium') ? (
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        ) : (
          <Lock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        )}

        <h3 className="text-xl font-bold text-white mb-2">
          {requiredPlans.includes('premium')
            ? 'Premium Feature'
            : 'Upgrade to Pro'}
        </h3>

        <p className="text-white/60 text-sm mb-6 max-w-sm">
          {requiredPlans.includes('premium')
            ? 'This feature is available in our Premium plan with AI-powered insights and advanced analytics.'
            : 'Unlock unlimited spaces, code execution, and more with a Pro or Premium subscription.'}
        </p>
      </div>

      {showUpgradeButton && (
        <div className="flex gap-3">
          <button
            onClick={handleUpgrade}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'transition-colors duration-200'
            )}
          >
            <Zap className="w-4 h-4" />
            View Plans
          </button>

          {!requiredPlans.includes('premium') && (
            <button
              onClick={() => navigate('/contact')}
              className={cn(
                'px-6 py-3 rounded-lg font-medium',
                'bg-white/10 hover:bg-white/20 text-white',
                'transition-colors duration-200'
              )}
            >
              Learn More
            </button>
          )}
        </div>
      )}

      {requiredPlans.includes('premium') && (
        <p className="text-xs text-white/40 text-center">
          Premium users also get AI feedback, analytics, and dedicated support.
        </p>
      )}
    </div>
  );
};

export default PlanGate;
