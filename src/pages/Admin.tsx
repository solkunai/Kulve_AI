import { useState, useEffect } from 'react';
import { Users, DollarSign, BarChart3, Zap, Mail, FileText, Image, Globe, ChevronRight, Search, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  plan: string | null;
  created_at: string;
  usage_counts: any;
}

interface ContentStats {
  marketing_plans: number;
  social_posts: number;
  outreach_emails: number;
  newsletters: number;
  website_copy: number;
  total: number;
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Dashboard state
  const [users, setUsers] = useState<UserData[]>([]);
  const [contentStats, setContentStats] = useState<ContentStats>({ marketing_plans: 0, social_posts: 0, outreach_emails: 0, newsletters: 0, website_copy: 0, total: 0 });
  const [emailsSent, setEmailsSent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserContent, setSelectedUserContent] = useState<any[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('kulve_admin', 'true');
    } else {
      setError('Wrong password');
    }
  };

  // Check if already authenticated
  useEffect(() => {
    if (sessionStorage.getItem('kulve_admin') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  // Load admin data
  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);

    Promise.all([
      // All users
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      // All content
      supabase.from('generated_content').select('type, user_id, created_at'),
      // Outreach messages sent
      supabase.from('outreach_messages').select('id', { count: 'exact' }),
    ]).then(([usersRes, contentRes, emailsRes]) => {
      if (usersRes.data) setUsers(usersRes.data);

      if (contentRes.data) {
        const stats: ContentStats = { marketing_plans: 0, social_posts: 0, outreach_emails: 0, newsletters: 0, website_copy: 0, total: contentRes.data.length };
        contentRes.data.forEach((c: any) => {
          if (c.type === 'marketing_plan') stats.marketing_plans++;
          if (c.type === 'social_post') stats.social_posts++;
          if (c.type === 'outreach_email') stats.outreach_emails++;
          if (c.type === 'newsletter') stats.newsletters++;
          if (c.type === 'website_copy') stats.website_copy++;
        });
        setContentStats(stats);
      }

      setEmailsSent(emailsRes.count || 0);
      setLoading(false);
    });
  }, [authenticated]);

  // Load selected user's content
  useEffect(() => {
    if (!selectedUser) return;
    supabase.from('generated_content')
      .select('id, type, title, created_at')
      .eq('user_id', selectedUser)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setSelectedUserContent(data); });
  }, [selectedUser]);

  const handleLogout = () => {
    sessionStorage.removeItem('kulve_admin');
    setAuthenticated(false);
    setPassword('');
  };

  // --- Login Screen ---
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-2xl text-white">K</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Kulvé Admin</h1>
            <p className="text-gray-400 mt-2">Enter admin password</p>
          </div>
          <form onSubmit={handleLogin}>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none mb-4"
            />
            <button type="submit" className="w-full py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Admin Dashboard ---
  const planCounts = { free: 0, trial: 0, starter: 0, growth: 0, scale: 0, none: 0 };
  users.forEach(u => {
    const p = (u.plan || 'none') as keyof typeof planCounts;
    if (p in planCounts) planCounts[p]++;
    else planCounts.none++;
  });

  const mrr = (planCounts.starter * 250) + (planCounts.growth * 500) + (planCounts.scale * 1500) + (planCounts.trial * 10);
  const arr = mrr * 12;

  const filteredUsers = searchQuery
    ? users.filter(u => u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  const selectedUserData = selectedUser ? users.find(u => u.id === selectedUser) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg">K</span>
          </div>
          <span className="font-bold text-lg">Kulvé Admin</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-400' },
                { label: 'MRR', value: `$${mrr.toLocaleString()}`, icon: DollarSign, color: 'text-green-400' },
                { label: 'ARR', value: `$${arr.toLocaleString()}`, icon: BarChart3, color: 'text-green-400' },
                { label: 'Content Created', value: contentStats.total, icon: FileText, color: 'text-purple-400' },
                { label: 'Emails Sent', value: emailsSent, icon: Mail, color: 'text-amber-400' },
                { label: 'Active Plans', value: planCounts.starter + planCounts.growth + planCounts.scale, icon: Zap, color: 'text-cyan-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Plan breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Revenue by Plan</h2>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { plan: 'Free', count: planCounts.free + planCounts.none, revenue: 0, color: 'bg-gray-700' },
                  { plan: 'Trial', count: planCounts.trial, revenue: planCounts.trial * 10, color: 'bg-gray-600' },
                  { plan: 'Starter', count: planCounts.starter, revenue: planCounts.starter * 250, color: 'bg-blue-600' },
                  { plan: 'Growth', count: planCounts.growth, revenue: planCounts.growth * 500, color: 'bg-purple-600' },
                  { plan: 'Scale', count: planCounts.scale, revenue: planCounts.scale * 1500, color: 'bg-green-600' },
                ].map((p, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-full h-2 rounded-full ${p.color} mb-3`} />
                    <div className="text-xl font-bold">{p.count}</div>
                    <div className="text-xs text-gray-500">{p.plan}</div>
                    <div className="text-sm font-semibold text-green-400 mt-1">${p.revenue}/mo</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Content Generated (All Users)</h2>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'Marketing Plans', value: contentStats.marketing_plans, icon: FileText },
                  { label: 'Social Posts', value: contentStats.social_posts, icon: Image },
                  { label: 'Outreach Emails', value: contentStats.outreach_emails, icon: Mail },
                  { label: 'Newsletters', value: contentStats.newsletters, icon: Mail },
                  { label: 'Websites', value: contentStats.website_copy, icon: Globe },
                ].map((s, i) => (
                  <div key={i} className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <s.icon className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* User List */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-bold">All Users ({users.length})</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="pl-9 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:border-brand-blue outline-none w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Plan</th>
                      <th className="px-6 py-3">Signed Up</th>
                      <th className="px-6 py-3">Content</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{user.full_name || '—'}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.plan === 'scale' ? 'bg-green-500/10 text-green-400' :
                            user.plan === 'growth' ? 'bg-purple-500/10 text-purple-400' :
                            user.plan === 'starter' ? 'bg-blue-500/10 text-blue-400' :
                            user.plan === 'trial' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>
                            {user.plan || 'free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {user.usage_counts ? (Object.values(user.usage_counts) as number[]).reduce((a, b) => a + (Number(b) || 0), 0) : 0}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                            className="text-brand-blue hover:text-blue-300 transition-colors"
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedUser === user.id ? 'rotate-90' : ''}`} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected user detail */}
              {selectedUser && selectedUserData && (
                <div className="border-t border-gray-800 p-6 bg-gray-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{selectedUserData.full_name || selectedUserData.email}</h3>
                      <p className="text-sm text-gray-400">{selectedUserData.email}</p>
                    </div>
                    <span className="text-sm text-gray-500">ID: {selectedUser.slice(0, 8)}...</span>
                  </div>

                  {selectedUserContent.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Content</h4>
                      {selectedUserContent.map(c => (
                        <div key={c.id} className="flex items-center justify-between py-2 px-3 bg-gray-900 rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              c.type === 'marketing_plan' ? 'bg-purple-500/10 text-purple-400' :
                              c.type === 'social_post' ? 'bg-pink-500/10 text-pink-400' :
                              c.type === 'outreach_email' ? 'bg-blue-500/10 text-blue-400' :
                              c.type === 'newsletter' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>{c.type.replace('_', ' ')}</span>
                            <span className="text-gray-300">{c.title}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No content generated yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
