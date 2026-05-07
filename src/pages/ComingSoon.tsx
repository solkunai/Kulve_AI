import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Image, Send, Mail, Globe, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { BS, Eyebrow, monoFont } from '../lib/bs-design';
import { KulveLogo } from '../components/KulveLogo';

const features = [
  { icon: FileText, title: 'AI Marketing Plans', desc: 'Monthly strategy tailored to your business' },
  { icon: Image, title: 'Branded Graphics', desc: 'Social posts, flyers, business cards — all on-brand' },
  { icon: Send, title: 'Automated Outreach', desc: 'Personalized cold emails sent on autopilot' },
  { icon: Mail, title: 'Newsletters', desc: 'Beautiful email campaigns in minutes' },
  { icon: Globe, title: 'Website Builder', desc: 'Full business website from your brand kit' },
  { icon: Printer, title: 'Print Materials', desc: 'Flyers, business cards, pitch decks' },
];

export default function ComingSoon() {
  const { signOut, user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BS.paper, color: BS.text }}>
      {/* Top utility bar */}
      <div
        className="hidden md:flex justify-between items-center text-xs"
        style={{ background: BS.ink, color: '#C8CEDC', padding: '7px 56px' }}
      >
        <span>Now in private beta · invitations sent weekly</span>
        <div className="flex gap-[18px]">
          <a href="#" className="hover:text-white transition-colors">Status</a>
          <a href="#" className="hover:text-white transition-colors">Changelog</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
        </div>
      </div>

      {/* Nav */}
      <header
        className="flex items-center justify-between px-6 md:px-14 py-4"
        style={{ borderBottom: `1px solid ${BS.border}`, background: BS.paper }}
      >
        <Link to="/">
          <KulveLogo />
        </Link>
        <button
          onClick={() => signOut()}
          className="text-sm font-medium hover:opacity-70 transition-opacity"
          style={{ color: BS.muted }}
        >
          Sign out
        </button>
      </header>

      {/* Hero */}
      <section className="flex-1 px-6 md:px-14 pt-16 pb-10 max-w-[1100px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow>YOU'RE IN — JUST NOT YET</Eyebrow>
          <h1
            className="text-4xl md:text-5xl lg:text-[60px] font-semibold mt-4 mb-4 leading-[1.05]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Kulvé is rolling out in <span style={{ color: BS.accent }}>small waves.</span>
          </h1>
          <p className="text-base md:text-[17px] leading-relaxed" style={{ color: BS.muted }}>
            Public access is paused while we onboard founders one at a time. We'll email you the moment it's your turn — usually within a couple of weeks.
          </p>

          {/* Waitlist form */}
          <div className="mt-8 max-w-xl mx-auto">
            {!submitted ? (
              <>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWaitlist()}
                    placeholder="work@company.com"
                    className="flex-1 px-3.5 py-3 rounded-md text-sm outline-none focus:ring-2"
                    style={{ border: `1px solid ${BS.border}`, background: 'white', color: BS.text }}
                  />
                  <button
                    onClick={handleWaitlist}
                    disabled={loading}
                    className="px-5 py-3 rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
                    style={{ background: BS.accent, color: 'white' }}
                  >
                    {loading ? 'Adding…' : 'Save my spot'}
                  </button>
                </div>
                {error && (
                  <div className="text-xs mt-2" style={{ color: '#A52327' }}>{error}</div>
                )}
                <p
                  className="mt-3 text-[11px]"
                  style={{ color: BS.faint, fontFamily: monoFont, letterSpacing: '0.04em' }}
                >
                  EARLY ACCESS · FOUNDER PRICING LOCKED FOR LIFE
                </p>
              </>
            ) : (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: BS.accentSoft, border: `1px solid #B8E5EE`, color: BS.accentInk }}
              >
                <div className="text-3xl mb-2">✓</div>
                <div className="font-semibold">You're on the list.</div>
                <div className="text-sm mt-1" style={{ color: BS.muted }}>
                  We'll email you the moment access opens up.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature preview */}
        <div className="mt-20">
          <div
            className="text-xs font-semibold uppercase mb-7 text-center"
            style={{ color: BS.faint, letterSpacing: '0.12em', fontFamily: monoFont }}
          >
            WHAT'S COMING IN BOX ONE
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-xl"
                style={{ background: BS.softer, border: `1px solid ${BS.border}` }}
              >
                <f.icon className="w-5 h-5 mb-3" style={{ color: BS.accent }} strokeWidth={1.8} />
                <h3 className="font-semibold text-sm" style={{ letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: BS.muted }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-14 py-6 mt-10"
        style={{ background: BS.ink, color: 'rgba(255,255,255,0.4)' }}
      >
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <p>© 2026 Kulvé. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Status</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
