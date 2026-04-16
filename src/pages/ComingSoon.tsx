import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Image, Send, Mail, Globe, FileText, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function ComingSoon() {
  const { signOut } = useAuth();
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
      source: 'coming_soon',
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

  const features = [
    { icon: FileText, title: 'AI Marketing Plans', desc: 'Monthly strategy tailored to your business' },
    { icon: Image, title: 'Branded Graphics', desc: 'Social posts, flyers, business cards — all on-brand' },
    { icon: Send, title: 'Automated Outreach', desc: 'Personalized cold emails sent on autopilot' },
    { icon: Mail, title: 'Newsletters', desc: 'Beautiful email campaigns in minutes' },
    { icon: Globe, title: 'Website Builder', desc: 'Full business website from your brand kit' },
    { icon: Printer, title: 'Print Materials', desc: 'Flyers, business cards, pitch decks' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
            <span className="font-bold text-xl text-white">K</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-navy">Kulvé</span>
        </Link>
        <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-700">Sign Out</button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        {/* Coming Soon badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-semibold mb-8">
          <Zap className="w-4 h-4" /> Coming Soon
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-brand-navy leading-tight">
          Your entire marketing team — powered by AI
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
          Kulvé is almost ready. We're building the most powerful AI marketing platform for businesses of all kinds. Be the first to access it.
        </p>

        {/* Waitlist */}
        <div className="mt-10 max-w-md mx-auto">
          {!submitted ? (
            <div className="space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                />
                <button
                  onClick={handleWaitlist}
                  disabled={loading}
                  className="px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50 shrink-0"
                >
                  {loading ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>
              <p className="text-xs text-gray-400">Join the waitlist for early access + exclusive launch discount</p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800">You're on the list!</h3>
              <p className="text-sm text-green-600 mt-1">We'll email you as soon as Kulvé launches.</p>
            </div>
          )}
        </div>

        {/* Feature preview */}
        <div className="mt-20">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">What's Coming</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-5 rounded-xl bg-gray-50 text-left">
                <f.icon className="w-6 h-6 text-brand-blue mb-3" />
                <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
