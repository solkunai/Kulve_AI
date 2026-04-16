import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">&#10003;</span>
          </div>
          <h1 className="text-3xl font-bold text-brand-navy">Check your email</h1>
          <p className="mt-4 text-gray-600">We sent a password reset link to <strong>{email}</strong>.</p>
          <p className="mt-2 text-sm text-gray-500">If you don't see it, check your spam folder.</p>
          <Link to="/login">
            <Button variant="outline" className="mt-8">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
              <span className="font-bold text-xl text-white">K</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-brand-navy">Kulvé</span>
          </Link>
          <h1 className="text-3xl font-bold text-brand-navy">Reset your password</h1>
          <p className="mt-2 text-gray-600">Enter your email and we'll send a reset link</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                placeholder="you@business.com"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-brand-blue font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
