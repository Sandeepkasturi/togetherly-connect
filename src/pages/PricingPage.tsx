import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { PLANS, FEATURES } from '@/types/subscription';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const handleSubscribe = (planId: string) => {
    if (planId === 'free') {
      // Already free
      return;
    }
    // Will integrate Razorpay here in Phase 4b
    console.log(`Subscribe to ${planId} (${billingCycle})`);
  };

  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-black/80 backdrop-blur-md px-4 py-8 -mx-4 mb-12">
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-white/60 text-center max-w-2xl mx-auto mb-8">
          Choose the perfect plan for your learning and interview preparation needs.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-all duration-200',
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-6 py-2 rounded-lg font-medium transition-all duration-200',
              billingCycle === 'yearly'
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            )}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 px-4">
        {Object.entries(PLANS).map(([planId, plan]) => (
          <div
            key={planId}
            className={cn(
              'rounded-2xl border overflow-hidden transition-all duration-300',
              'hover:shadow-lg hover:shadow-white/10',
              planId === 'pro'
                ? 'border-blue-500/50 bg-gradient-to-br from-blue-600/10 to-blue-900/10 scale-105 shadow-lg shadow-blue-600/20'
                : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
            )}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm font-bold">
                {plan.badge}
              </div>
            )}

            {/* Content */}
            <div className="p-8 flex flex-col h-full">
              {/* Plan Name */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/60 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ₹{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-white/60">
                    {billingCycle === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                {plan.monthlyPrice > 0 && (
                  <p className="text-xs text-white/50 mt-2">
                    {billingCycle === 'monthly'
                      ? `₹${plan.monthlyPrice}/month, cancel anytime`
                      : `Only ₹${(plan.yearlyPrice / 12).toFixed(0)}/month when paid yearly`}
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(planId)}
                disabled={planId === 'free'}
                className={cn(
                  'w-full px-6 py-3 rounded-lg font-bold mb-8 transition-all duration-200',
                  planId === 'free'
                    ? 'bg-white/5 text-white/50 cursor-default'
                    : planId === 'pro'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                )}
              >
                {planId === 'free'
                  ? 'Current Plan'
                  : `Subscribe to ${plan.name}`}
              </button>

              {/* Features */}
              <div className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="mt-20 px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Feature Comparison
        </h2>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-white font-bold">Feature</th>
                <th className="text-center py-4 px-4 text-white font-bold">Free</th>
                <th className="text-center py-4 px-4 text-white font-bold">Pro</th>
                <th className="text-center py-4 px-4 text-white font-bold">Premium</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-4 text-white/80">{feature.name}</td>
                  <td className="text-center py-4 px-4">
                    {feature.availableIn.includes('free') && (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {feature.availableIn.includes('pro') && (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    )}
                  </td>
                  <td className="text-center py-4 px-4">
                    {feature.availableIn.includes('premium') && (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-20 px-4 max-w-2xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {[
            {
              q: 'Can I change my plan later?',
              a: 'Yes! You can upgrade or downgrade your plan at any time. Your billing will be adjusted accordingly.',
            },
            {
              q: 'Is there a free trial?',
              a: 'Yes, start with our Free plan to explore all features. Upgrade anytime when you\'re ready for more.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit/debit cards and UPI through Razorpay (India\'s leading payment gateway).',
            },
            {
              q: 'Do you offer team or bulk discounts?',
              a: 'Yes! Contact our team at team@togetherly.app for custom enterprise pricing.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Absolutely. Cancel your subscription anytime without any penalties. You\'ll retain access until your billing period ends.',
            },
            {
              q: 'Is my data secure?',
              a: 'All data is encrypted and stored securely on Supabase servers in India. We comply with data protection regulations.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-6 rounded-lg border border-white/10 bg-white/5">
              <h3 className="font-bold text-white mb-3">{faq.q}</h3>
              <p className="text-white/70">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 px-4 py-12 text-center">
        <div className="inline-block px-8 py-8 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-purple-600/10">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to get started?</h3>
          <p className="text-white/60 mb-6">
            Join thousands of learners using Togetherly to ace their interviews.
          </p>
          <button className={cn(
            'flex items-center gap-2 px-8 py-3 rounded-lg font-bold mx-auto',
            'bg-blue-600 hover:bg-blue-700 text-white',
            'transition-colors duration-200'
          )}>
            <Zap className="w-5 h-5" />
            Start Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
