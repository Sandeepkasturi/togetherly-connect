// Phase 4 & 5: Subscription & Monetization Types

export type PlanType = 'free' | 'pro' | 'premium';

export interface Plan {
  id: PlanType;
  name: string;
  monthlyPrice: number; // In INR
  yearlyPrice: number;
  description: string;
  features: string[];
  color: string; // Brand color for UI
  badge?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: 'active' | 'cancelled' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  payment_method?: string; // Last 4 digits of card
  razorpay_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  availableIn: PlanType[];
  icon?: string;
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Get started with collaborative learning',
    features: [
      '2 spaces per month',
      '5 collaborators per space',
      'Basic interview questions',
      'Chat & basic features',
    ],
    color: '#8B5CF6', // Purple
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 99, // INR
    yearlyPrice: 990,
    description: 'For serious learners and recruiters',
    features: [
      'Unlimited spaces',
      'Unlimited collaborators',
      'Advanced interview questions',
      'Judge0 code execution',
      'Session recordings',
      'Priority support',
      'Custom branding',
    ],
    color: '#3B82F6', // Blue
    badge: 'Popular',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 299, // INR
    yearlyPrice: 2990,
    description: 'Complete suite for organizations',
    features: [
      'Everything in Pro',
      'Team management',
      'AI-powered feedback',
      'Advanced analytics',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'Bulk discounts',
    ],
    color: '#F59E0B', // Amber
  },
};

export const FEATURES: Feature[] = [
  {
    id: 'unlimited_spaces',
    name: 'Unlimited Spaces',
    description: 'Create unlimited study and interview rooms',
    availableIn: ['pro', 'premium'],
  },
  {
    id: 'ai_feedback',
    name: 'AI Feedback',
    description: 'Get AI-powered feedback on your interview performance',
    availableIn: ['premium'],
  },
  {
    id: 'code_execution',
    name: 'Code Execution',
    description: 'Run and test code with Judge0 integration',
    availableIn: ['pro', 'premium'],
  },
  {
    id: 'session_recording',
    name: 'Session Recording',
    description: 'Record and review interview sessions',
    availableIn: ['pro', 'premium'],
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Track performance and progress over time',
    availableIn: ['premium'],
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'Integrate Togetherly into your platform',
    availableIn: ['premium'],
  },
];
