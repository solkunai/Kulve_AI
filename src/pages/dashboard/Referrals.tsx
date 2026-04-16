import { useState, useEffect } from 'react';
import { Copy, Check, Users, DollarSign, Link as LinkIcon, Share2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getOrCreateReferralCode, getReferralStats, getReferralLink } from '../../lib/referrals';

export default function Referrals() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [link, setLink] = useState('');
  const [stats, setStats] = useState({ totalReferred: 0, activePaid: 0, totalEarnings: 0, referrals: [] as any[] });
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      const userName = user.user_metadata?.full_name || user.email || 'User';
      const referralCode = await getOrCreateReferralCode(user.id, userName);
      setCode(referralCode);
      setLink(getReferralLink(referralCode));

      const referralStats = await getReferralStats(user.id);
      setStats(referralStats);
      setLoading(false);
    };

    init();
  }, [user]);

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
        <p className="text-gray-500">Earn 10% recurring commission for every customer you refer to Kulvé.</p>
      </div>

      {/* How it works */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">How It Works</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6 text-brand-blue" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Share Your Link</h3>
            <p className="text-sm text-gray-500">Send your unique referral link or code to anyone who could use Kulvé</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">They Sign Up</h3>
            <p className="text-sm text-gray-500">They get <strong>15% off</strong> their first month when they use your code</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">You Earn 10%</h3>
            <p className="text-sm text-gray-500">You earn <strong>10% recurring</strong> of their monthly plan for as long as they're subscribed</p>
          </div>
        </div>
      </div>

      {/* Your code and link */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-gray-900">Your Referral Code & Link</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Your Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-lg font-bold tracking-widest text-brand-navy">
                {code}
              </div>
              <button
                onClick={() => copyToClipboard(code, 'code')}
                className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {copied === 'code' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1.5">Your Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600 truncate">
                {link}
              </div>
              <button
                onClick={() => copyToClipboard(link, 'link')}
                className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {copied === 'link' ? <Check className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">People Referred</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalReferred}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Active Paid</span>
            <Check className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.activePaid}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Earnings</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</div>
        </div>
      </div>

      {/* Referral history */}
      {stats.referrals.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Referral History</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.referrals.map((ref, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{ref.email}</span>
                  <span className="text-xs text-gray-400 ml-3">
                    {new Date(ref.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  ref.status === 'active' ? 'bg-green-50 text-green-700' :
                  ref.status === 'paid' ? 'bg-blue-50 text-blue-700' :
                  ref.status === 'signed_up' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.referrals.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No referrals yet</h3>
          <p className="text-sm text-gray-500">Share your code or link to start earning 10% recurring commissions.</p>
        </div>
      )}
    </div>
  );
}
