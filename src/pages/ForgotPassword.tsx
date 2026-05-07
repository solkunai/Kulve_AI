import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BS, Eyebrow, monoFont } from '../lib/bs-design';
import { KulveLogo } from '../components/KulveLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: BS.softer }}
      >
        <div className="w-full max-w-md text-center">
          <Link to="/" className="inline-block mb-8">
            <KulveLogo />
          </Link>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl"
            style={{ background: BS.successSoft, color: BS.success }}
          >
            ✓
          </div>
          <Eyebrow>EMAIL SENT</Eyebrow>
          <h1
            className="text-3xl font-semibold mt-3 mb-3"
            style={{ letterSpacing: '-0.02em', color: BS.text }}
          >
            Check your email
          </h1>
          <p style={{ color: BS.muted }} className="text-sm">
            We sent a reset link to <strong style={{ color: BS.text }}>{email}</strong>. If you don't see it, check your spam folder.
          </p>
          <Link
            to="/login"
            className="inline-block mt-7 px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ border: `1px solid ${BS.border}`, color: BS.text }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: BS.paper, color: BS.text }}>
      {/* Left: form */}
      <div className="flex flex-col justify-between p-8 md:p-16 lg:p-20">
        <Link to="/">
          <KulveLogo />
        </Link>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <Eyebrow>FORGOT YOUR PASSWORD?</Eyebrow>
          <h1
            className="text-3xl md:text-[36px] font-semibold mt-3 mb-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            Reset it in 30 seconds.
          </h1>
          <p className="text-sm mb-7" style={{ color: BS.muted }}>
            Enter the email on your account — we'll send a one-tap reset link.
          </p>

          {error && (
            <div
              className="p-3 mb-4 rounded-lg text-sm"
              style={{ background: '#FCE7E8', border: '1px solid #F4B0B3', color: '#A52327' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2"
                style={{ border: `1px solid ${BS.border}`, background: 'white', color: BS.text }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: BS.ink, color: 'white' }}
            >
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm" style={{ color: BS.muted }}>
            Remembered it?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: BS.accentInk }}>
              Sign in
            </Link>
          </div>
        </div>

        <div className="text-[11px]" style={{ color: BS.faint, fontFamily: monoFont }}>
          © 2026 Kulvé · SOC2-ready · EU + US
        </div>
      </div>

      {/* Right: ink panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 xl:p-16"
        style={{ background: BS.ink, color: 'white' }}
      >
        <div
          className="text-[11px]"
          style={{ color: BS.accentBright, letterSpacing: '0.18em', fontFamily: monoFont }}
        >
          A NOTE FROM KULVÉ
        </div>

        <div>
          <h2
            className="text-3xl xl:text-[40px] font-medium leading-[1.1]"
            style={{ letterSpacing: '-0.025em' }}
          >
            We won't make you jump through hoops. <span style={{ color: BS.accentBright }}>One link, one click, you're back in.</span>
          </h2>
          <div
            className="mt-6 text-[11.5px] font-semibold"
            style={{ letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)', fontFamily: monoFont }}
          >
            CHECK YOUR INBOX IN ABOUT 60 SECONDS
          </div>
        </div>

        <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: monoFont }}>
          Need help? hello@kulve.us
        </div>
      </div>
    </div>
  );
}
