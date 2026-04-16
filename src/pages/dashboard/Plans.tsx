import { useState } from 'react';
import { Check, Zap, Bell, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Set to false to enable real Stripe payments
const WAITLIST_MODE = true;

const PLANS = [
  {
    id: 'trial' as const,
    name: 'Trial',
    price: 10,
    description: 'Try Kulvé with limited features',
    features: ['1 marketing plan (mini)', '2 graphics', '1 social post batch', '50 outreach emails', '1 newsletter'],
    color: 'bg-gray-100 text-gray-600',
  },
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 250,
    description: 'Essential marketing for growing businesses',
    features: ['AI marketing plan monthly', '5 branded graphics', '500 outreach emails/mo', 'Basic analytics', 'Email support'],
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'growth' as const,
    name: 'Growth',
    price: 500,
    popular: true,
    description: 'Full marketing engine for serious growth',
    features: ['Everything in Starter', '12 graphics/mo', 'Flyers & business cards', '2,000 outreach emails/mo', 'LinkedIn outreach', 'Newsletter templates', 'Priority support'],
    color: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'scale' as const,
    name: 'Scale',
    price: 1500,
    description: 'Complete marketing department replacement',
    features: ['Everything in Growth', '30 graphics (daily content)', 'Auto-scheduled posting', 'Website creation', 'Pitch deck', 'Brand kit creation', '5,000+ outreach', 'Dedicated account manager'],
    color: 'bg-green-50 text-green-600',
  },
];

export default function PlansPage() {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPlan, setWaitlistPlan] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');

  const handleJoinWaitlist = async (planId?: string) => {
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      setWaitlistError('Please enter a valid email');
      return;
    }

    setWaitlistLoading(true);
    setWaitlistError('');

    const { error } = await supabase.from('waitlist').insert({
      email: waitlistEmail,
      interested_plan: planId || waitlistPlan || null,
      source: 'plans_page',
    });

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        setWaitlistSubmitted(true); // Already on the list
      } else {
        setWaitlistError('Something went wrong. Try again.');
      }
    } else {
      setWaitlistSubmitted(true);
    }
    setWaitlistLoading(false);
  };

  // --- WAITLIST MODE ---
  if (WAITLIST_MODE) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" /> Coming Soon
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Kulvé Plans</h1>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">We're putting the finishing touches on our plans. Join the waitlist to be the first to know when we launch — plus get an exclusive early-bird discount.</p>
        </div>

        {/* Waitlist signup */}
        {!waitlistSubmitted ? (
          <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Get Notified at Launch</h3>
                <p className="text-sm text-gray-500">Early access + exclusive discount</p>
              </div>
            </div>

            {waitlistError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{waitlistError}</div>
            )}

            <div className="flex gap-2">
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="you@business.com"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
              />
              <button
                onClick={() => handleJoinWaitlist()}
                disabled={waitlistLoading}
                className="px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold text-sm hover:bg-brand-blue/90 transition-colors disabled:opacity-50 shrink-0"
              >
                {waitlistLoading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-green-800">You're on the list!</h3>
            <p className="text-sm text-green-600 mt-1">We'll email you as soon as plans go live with your exclusive early-bird discount.</p>
          </div>
        )}

        {/* Plan preview cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 border-gray-100 bg-white p-6 flex flex-col ${plan.popular ? 'ring-2 ring-brand-blue/20' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white px-3 py-0.5 rounded-full text-xs font-bold">
                  Most Popular
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${plan.color}`}>
                <Zap className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-500 text-sm">/mo</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>

              <ul className="mt-5 space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setWaitlistPlan(plan.id);
                  if (waitlistSubmitted) return;
                  if (waitlistEmail) handleJoinWaitlist(plan.id);
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-6 w-full py-3 rounded-lg text-sm font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Notify Me
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Plan FAQ</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900">When will plans be available?</p>
              <p className="text-gray-500 mt-1">We're launching very soon. Join the waitlist to be notified the moment plans go live.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Will there be an early-bird discount?</p>
              <p className="text-gray-500 mt-1">Yes — everyone on the waitlist gets an exclusive discount at launch.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Can I try Kulvé before paying?</p>
              <p className="text-gray-500 mt-1">Absolutely. You can explore the dashboard and generate sample content right now. Full features unlock when plans go live.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LIVE PAYMENT MODE (when WAITLIST_MODE = false) ---
  // ... (import and use subscribeToPlan, openCustomerPortal when ready)
  return null;
}
