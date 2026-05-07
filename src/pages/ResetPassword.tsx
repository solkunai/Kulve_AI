import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BS, Eyebrow, monoFont } from '../lib/bs-design';
import { KulveLogo } from '../components/KulveLogo';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const handleRecovery = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        await new Promise((r) => setTimeout(r, 1000));
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      } else {
        setError('Reset link expired or invalid. Please request a new one.');
      }
      setInitializing(false);
    };
    handleRecovery();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
    setLoading(false);
  };

  // ── Loading ─────────────────────────────────────────────────────
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BS.softer }}>
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: BS.border, borderTopColor: BS.accent }}
        />
      </div>
    );
  }

  // ── Expired link ────────────────────────────────────────────────
  if (!sessionReady && error) {
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
            style={{ background: '#FCE7E8', color: '#A52327' }}
          >
            !
          </div>
          <Eyebrow color="#A52327">LINK EXPIRED</Eyebrow>
          <h1
            className="text-3xl font-semibold mt-3 mb-3"
            style={{ letterSpacing: '-0.02em', color: BS.text }}
          >
            That reset link is no longer valid.
          </h1>
          <p style={{ color: BS.muted }} className="text-sm">{error}</p>
          <Link
            to="/forgot-password"
            className="inline-block mt-7 px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: BS.ink, color: 'white' }}
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────
  if (success) {
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
          <Eyebrow>PASSWORD UPDATED</Eyebrow>
          <h1
            className="text-3xl font-semibold mt-3 mb-3"
            style={{ letterSpacing: '-0.02em', color: BS.text }}
          >
            You're back in.
          </h1>
          <p className="text-sm" style={{ color: BS.muted }}>
            Redirecting to your dashboard…
          </p>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: BS.paper, color: BS.text }}>
      {/* Left: form */}
      <div className="flex flex-col justify-between p-8 md:p-16 lg:p-20">
        <Link to="/">
          <KulveLogo />
        </Link>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <Eyebrow>SET A NEW PASSWORD</Eyebrow>
          <h1
            className="text-3xl md:text-[36px] font-semibold mt-3 mb-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            Pick something stronger this time.
          </h1>
          <p className="text-sm mb-7" style={{ color: BS.muted }}>
            Six characters minimum. We'll sign you in immediately.
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
              <label className="block text-xs font-semibold mb-1.5">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2"
                style={{ border: `1px solid ${BS.border}`, background: 'white', color: BS.text }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
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
              {loading ? 'Updating…' : 'Update password →'}
            </button>
          </form>
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
          ALMOST BACK IN
        </div>

        <div>
          <h2
            className="text-3xl xl:text-[40px] font-medium leading-[1.1]"
            style={{ letterSpacing: '-0.025em' }}
          >
            One field. One click. <span style={{ color: BS.accentBright }}>Then your strategist picks up where you left off.</span>
          </h2>
          <div
            className="mt-6 text-[11.5px] font-semibold"
            style={{ letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)', fontFamily: monoFont }}
          >
            BACK TO YOUR DASHBOARD IN 5 SECONDS
          </div>
        </div>

        <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: monoFont }}>
          Need help? hello@kulve.us
        </div>
      </div>
    </div>
  );
}
