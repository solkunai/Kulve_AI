import { useState } from 'react';
import { Check, Bell } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { supabase } from '../lib/supabase';

export default function Pricing({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWaitlist = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    setError('');

    const { error: dbError } = await supabase.from('waitlist').insert({
      email,
      source: 'pricing_page',
    });

    if (dbError) {
      if (dbError.message.includes('duplicate') || dbError.message.includes('unique')) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Try again.');
      }
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <section className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold mb-6">
            <Bell className="w-4 h-4" /> Launching Soon
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-brand-navy tracking-tight">Simple Pricing, Serious Results</h1>
          <p className="mt-6 text-xl text-gray-600">No contracts. Cancel anytime. Every plan includes your AI-powered marketing engine.</p>
        </div>

        {/* Waitlist signup */}
        <div className="max-w-md mx-auto mb-16">
          {!submitted ? (
            <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-4">
              <h3 className="font-bold text-brand-navy">Get notified when plans go live</h3>
              <p className="text-sm text-gray-500">Join the waitlist for early access + an exclusive launch discount.</p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
                />
                <Button onClick={handleWaitlist} disabled={loading}>
                  {loading ? 'Joining...' : 'Join Waitlist'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800">You're on the list!</h3>
              <p className="text-sm text-green-600 mt-1">We'll email you when plans go live with your exclusive discount.</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-end">
          {/* Starter */}
          <Card className="p-8 flex flex-col h-full">
            <h3 className="text-xl font-bold text-brand-navy">Starter</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-brand-navy">$250</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="mt-8 space-y-4 flex-1">
              {['AI-generated marketing plan', 'Social media content strategy', '5 branded social media graphics', '500 outreach emails per month', 'Basic analytics dashboard', 'Email support'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-10 w-full" onClick={onLogin}>Explore Free</Button>
          </Card>

          {/* Growth */}
          <Card className="p-8 flex flex-col h-full border-2 border-brand-blue relative shadow-xl scale-105 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-brand-navy">Growth</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-brand-navy">$500</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="mt-8 space-y-4 flex-1">
              {['Everything in Starter, plus:', '12 branded graphics per month', 'Ready-to-post content with captions', '2 flyer designs', 'Business card design', '2,000 outreach emails per month', 'LinkedIn outreach messages', 'Newsletter templates', 'Priority support'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-10 w-full" onClick={onLogin}>Explore Free</Button>
          </Card>

          {/* Scale */}
          <Card className="p-8 flex flex-col h-full">
            <h3 className="text-xl font-bold text-brand-navy">Scale</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-brand-navy">$1,500</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="mt-8 space-y-4 flex-1">
              {['Everything in Growth, plus:', '30 graphics (daily content)', 'Auto-scheduled posting', 'Full website design & creation', 'Investor pitch deck', 'Promotional banners', 'Brand kit creation', '5,000+ outreach across channels', 'Dedicated account manager'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-10 w-full" onClick={onLogin}>Explore Free</Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
