import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { applyReferralCode } from '../lib/referrals';
import { isAdminEmail } from '../lib/admins';
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

// Step dots — purely visual indicator at top of form (account → details → ready)
const StepDots = ({ active = 0 }: { active?: number }) => (
  <div className="flex items-center gap-2 mb-5">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="h-1.5 rounded-full transition-all"
        style={{
          width: i === active ? 28 : 14,
          background: i <= active ? BS.accent : BS.border,
        }}
      />
    ))}
    <span
      className="text-[10.5px] ml-2"
      style={{ color: BS.faint, fontFamily: monoFont, letterSpacing: '0.08em' }}
    >
      STEP 01 OF 03 · ACCOUNT
    </span>
  </div>
);

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  // Pre-fill referral code from URL (?ref=CODE)
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref.toUpperCase());
  }, [searchParams]);

  // Non-admin emails get added to the waitlist instead of creating an account.
  const addToWaitlist = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('waitlist')
      .insert({ email, source: 'signup_page' });
    if (error && !error.message.match(/duplicate|unique/i)) {
      setError('Something went wrong. Try again.');
      setLoading(false);
      return false;
    }
    setWaitlisted(true);
    setLoading(false);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Public sign-ups are paused — only approved testers can create an account.
    if (!isAdminEmail(email)) {
      await addToWaitlist();
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      if (referralCode.trim()) {
        await applyReferralCode(referralCode.trim(), session.user.id, email);
      }
      navigate('/onboarding');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // After Google sign-in, check the resulting user; non-admins land on
    // ComingSoon via ProtectedRoute. Admins go to onboarding.
    const { data: { user } } = await supabase.auth.getUser();
    if (user && isAdminEmail(user.email)) {
      navigate('/onboarding');
    } else {
      // Non-admin signed in via Google → route to dashboard, which gates to ComingSoon
      navigate('/dashboard');
    }
  };

  if (waitlisted) {
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
            style={{ background: BS.accentSoft, color: BS.accentInk }}
          >
            ✓
          </div>
          <Eyebrow>YOU'RE ON THE LIST</Eyebrow>
          <h1
            className="text-3xl font-semibold mt-3 mb-3"
            style={{ letterSpacing: '-0.02em', color: BS.text }}
          >
            Thanks — we'll be in touch.
          </h1>
          <p style={{ color: BS.muted }} className="text-sm">
            Public sign-ups are paused. We're letting in approved testers in waves. We'll email <strong style={{ color: BS.text }}>{email}</strong> the moment your turn comes up.
          </p>
          <Link
            to="/"
            className="inline-block mt-7 px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ border: `1px solid ${BS.border}`, color: BS.text }}
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

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
          <Eyebrow>EMAIL SENT</Eyebrow>
          <h1
            className="text-3xl font-semibold mt-3 mb-3"
            style={{ letterSpacing: '-0.02em', color: BS.text }}
          >
            Check your email
          </h1>
          <p style={{ color: BS.muted }} className="text-sm">
            We sent a confirmation link to <strong style={{ color: BS.text }}>{email}</strong>. Click it to activate your account.
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
    <div
      className="min-h-screen grid lg:grid-cols-2"
      style={{ background: BS.paper, color: BS.text }}
    >
      {/* ── Left: form ───────────────────────────────────────────── */}
      <div className="flex flex-col justify-between p-8 md:p-16 lg:p-20">
        <Link to="/">
          <KulveLogo />
        </Link>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          <StepDots active={0} />
          <Eyebrow>JOIN KULVÉ</Eyebrow>
          <h1 className="text-3xl md:text-[36px] font-semibold mt-3 mb-2" style={{ letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
          <p className="text-sm mb-5" style={{ color: BS.muted }}>
            Two minutes. Then your strategist takes over.
          </p>

          {/* Sign-ups paused notice */}
          <div
            className="px-3.5 py-2.5 rounded-md mb-5 text-xs"
            style={{ background: BS.accentSoft, color: BS.accentInk, border: `1px solid #B8E5EE` }}
          >
            <strong>Heads up:</strong> public sign-ups are paused. Approved testers can create accounts here — everyone else gets added to the waitlist automatically.
          </div>

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
              <label className="block text-xs font-semibold mb-1.5">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Maya Rivera"
                className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2"
                style={{ border: `1px solid ${BS.border}`, background: 'white', color: BS.text }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">Work email</label>
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
              <label className="block text-xs font-semibold mb-1.5">Password</label>
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
              <div className="text-[11px] mt-1.5" style={{ color: BS.faint }}>
                At least 6 characters.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Referral code <span className="font-normal" style={{ color: BS.faint }}>(optional)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. JOHN4X2K"
                className="w-full px-3.5 py-3 rounded-lg text-sm outline-none focus:ring-2 uppercase tracking-wider"
                style={{
                  border: `1px solid ${BS.border}`,
                  background: 'white',
                  color: BS.text,
                  fontFamily: monoFont,
                }}
              />
              {referralCode && (
                <div className="text-[11px] mt-1.5 font-medium" style={{ color: BS.success }}>
                  15% off your first month if valid.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: BS.ink, color: 'white' }}
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm" style={{ color: BS.muted }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: BS.accentInk }}>
              Sign in
            </Link>
          </div>
        </div>

        <div className="text-[11px]" style={{ color: BS.faint, fontFamily: monoFont }}>
          © 2026 Kulvé · SOC2-ready · EU + US
        </div>
      </div>

      {/* ── Right: ink panel ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 xl:p-16"
        style={{ background: BS.ink, color: 'white' }}
      >
        <div
          className="text-[11px]"
          style={{ color: BS.accentBright, letterSpacing: '0.18em', fontFamily: monoFont }}
        >
          STOP DOING THIS YOURSELF
        </div>

        <div>
          <h2
            className="text-3xl xl:text-[40px] font-medium leading-[1.1]"
            style={{ letterSpacing: '-0.025em' }}
          >
            Most founders spend Sundays writing emails. <span style={{ color: BS.accentBright }}>Yours is about to spend itself running them.</span>
          </h2>
          <div
            className="mt-6 text-[11.5px] font-semibold"
            style={{ letterSpacing: '0.16em', color: 'rgba(255,255,255,0.55)', fontFamily: monoFont }}
          >
            10 MINUTES IN · A PLAN, A LIST, AND THREE DRAFTS
          </div>
        </div>

        <div
          className="pt-5 grid grid-cols-3 gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          {([
            ['SETUP', '4 min'],
            ['1ST PLAN', 'Sun 8pm'],
            ['1ST WIN', '~10 days'],
          ] as const).map(([l, v]) => (
            <div key={l}>
              <div
                className="text-[11px] font-bold"
                style={{ letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)', fontFamily: monoFont }}
              >
                {l}
              </div>
              <div
                className="text-xl xl:text-2xl font-semibold mt-1"
                style={{ letterSpacing: '-0.02em' }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
