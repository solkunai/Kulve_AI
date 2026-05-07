import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { BS, Eyebrow, monoFont } from '../lib/bs-design';
import { KulveLogo } from '../components/KulveLogo';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009.003 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9.003 3.58z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: BS.paper, color: BS.text }}>
      {/* ── Left: form ─────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between p-8 md:p-16 lg:p-20">
        <Link to="/">
          <KulveLogo />
        </Link>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <Eyebrow>WELCOME BACK</Eyebrow>
          <h1 className="text-3xl md:text-[36px] font-semibold mt-3 mb-2" style={{ letterSpacing: '-0.02em' }}>
            Sign in to Kulvé
          </h1>
          <p className="text-sm mb-7" style={{ color: BS.muted }}>
            Your agents are waiting.
          </p>

          {error && (
            <div
              className="p-3 mb-4 rounded-lg text-sm"
              style={{ background: '#FCE7E8', border: '1px solid #F4B0B3', color: '#A52327' }}
            >
              {error}
            </div>
          )}

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60"
            style={{ background: 'white', border: `1px solid ${BS.border}`, color: BS.text }}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-4 text-[11px]" style={{ color: BS.faint }}>
            <div className="flex-1 h-px" style={{ background: BS.border }} />
            OR
            <div className="flex-1 h-px" style={{ background: BS.border }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: BS.text }}>Email</label>
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold" style={{ color: BS.text }}>Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: BS.accentInk }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm" style={{ color: BS.muted }}>
            New here?{' '}
            <Link to="/" className="font-semibold hover:underline" style={{ color: BS.accentInk }}>
              Join the waitlist
            </Link>
          </div>
          <div
            className="text-center mt-3 text-[11px]"
            style={{ color: BS.faint, fontFamily: monoFont, letterSpacing: '0.04em' }}
          >
            Public sign-ups paused · approved testers only
          </div>
        </div>

        <div className="text-[11px]" style={{ color: BS.faint, fontFamily: monoFont }}>
          © 2026 Kulvé · SOC2-ready · EU + US
        </div>
      </div>

      {/* ── Right: ink panel with strategist quote + stats ────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 xl:p-16"
        style={{ background: BS.ink, color: 'white' }}
      >
        <div
          className="text-[11px]"
          style={{
            color: BS.accentBright,
            letterSpacing: '0.18em',
            fontFamily: monoFont,
          }}
        >
          WHILE YOU WERE OUT
        </div>

        <div>
          <h2
            className="text-3xl xl:text-[40px] font-medium leading-[1.1]"
            style={{ letterSpacing: '-0.025em' }}
          >
            Your strategist <span style={{ color: BS.accentBright }}>doesn't take weekends.</span> 4 meetings booked, 12 follow-ups sent, one lead converted.
          </h2>
          <div
            className="mt-6 text-[11.5px] font-semibold"
            style={{
              letterSpacing: '0.16em',
              color: 'rgba(255,255,255,0.55)',
              fontFamily: monoFont,
            }}
          >
            COFFEE FIRST. THEN APPROVE THE NEXT BATCH.
          </div>
        </div>

        <div
          className="pt-5 grid grid-cols-3 gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          {([
            ['BOOKED', '4 mtgs'],
            ['SENT', '12 emails'],
            ['CLOSED', '1 deal'],
          ] as const).map(([l, v]) => (
            <div key={l}>
              <div
                className="text-[11px] font-bold"
                style={{
                  letterSpacing: '0.14em',
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: monoFont,
                }}
              >
                {l}
              </div>
              <div className="text-2xl xl:text-[32px] font-semibold mt-1" style={{ letterSpacing: '-0.02em' }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
