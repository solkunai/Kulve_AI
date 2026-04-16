import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Palette,
  Image as ImageIcon,
  Send,
  Megaphone,
  Printer,
  Mail,
  Globe,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trash2,
  Edit2,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Sparkles,
  Gift,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { cn } from './lib/utils';
// Types imported as needed by sub-components
import { useAuth } from './lib/auth';
import { supabase } from './lib/supabase';
import MarketingPlan from './pages/dashboard/MarketingPlan';
import SocialContent from './pages/dashboard/SocialContent';
import OutreachContent from './pages/dashboard/OutreachContent';
import NewsletterContent from './pages/dashboard/NewsletterContent';
import Referrals from './pages/dashboard/Referrals';
import PlansPage from './pages/dashboard/Plans';
import WebsiteBuilder from './pages/dashboard/WebsiteBuilder';
import BrandKitPageReal from './pages/BrandKit';
import FlyersAndCards from './pages/dashboard/FlyersAndCards';

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-sm',
      secondary: 'bg-brand-gray-light text-brand-navy hover:bg-gray-200',
      outline: 'border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg font-medium',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-button transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

const Card = ({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div className={cn('bg-white border border-gray-100 rounded-brand shadow-[0_1px_3px_rgba(0,0,0,0.08)]', className)} {...props}>
    {children}
  </div>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-button border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={cn('text-sm font-medium text-gray-700 mb-1.5 block', className)}>
    {children}
  </label>
);

// --- Sub-pages ---

const DashboardHome = ({ businessName, onNavigate }: { businessName: string, onNavigate: (tab: string) => void }) => {
  const { user } = useAuth();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const [stats, setStats] = useState({ plans: 0, posts: 0, emails: 0, newsletters: 0, totalContent: 0 });
  const [recentContent, setRecentContent] = useState<{ id: string; type: string; title: string; created_at: string }[]>([]);
  const [plan, setPlan] = useState<string | null>(null);
  const [outreachEmail, setOutreachEmail] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch all stats in parallel
    Promise.all([
      // Content counts by type
      supabase.from('generated_content').select('type', { count: 'exact' }).eq('user_id', user.id),
      // Recent content
      supabase.from('generated_content').select('id, type, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      // User plan
      supabase.from('profiles').select('plan').eq('id', user.id).single(),
      // Outreach email
      supabase.from('brand_kits').select('outreach_email').eq('user_id', user.id).single(),
    ]).then(([contentRes, recentRes, profileRes, brandRes]) => {
      // Count content by type
      if (contentRes.data) {
        const counts = { plans: 0, posts: 0, emails: 0, newsletters: 0, totalContent: 0 };
        contentRes.data.forEach((item: any) => {
          counts.totalContent++;
          if (item.type === 'marketing_plan') counts.plans++;
          if (item.type === 'social_post') counts.posts++;
          if (item.type === 'outreach_email') counts.emails++;
          if (item.type === 'newsletter') counts.newsletters++;
        });
        setStats(counts);
      }
      if (recentRes.data) setRecentContent(recentRes.data);
      if (profileRes.data?.plan) setPlan(profileRes.data.plan);
      if (brandRes.data?.outreach_email) setOutreachEmail(brandRes.data.outreach_email);
      setLoadingStats(false);
    });
  }, [user]);

  const contentTypeLabel = (type: string) => {
    switch (type) {
      case 'marketing_plan': return 'Marketing Plan';
      case 'social_post': return 'Social Posts';
      case 'outreach_email': return 'Outreach Emails';
      case 'newsletter': return 'Newsletter';
      case 'tagline': return 'Taglines';
      case 'website_copy': return 'Website Copy';
      default: return type;
    }
  };

  const contentTypeColor = (type: string) => {
    switch (type) {
      case 'marketing_plan': return 'bg-purple-50 text-purple-700';
      case 'social_post': return 'bg-pink-50 text-pink-700';
      case 'outreach_email': return 'bg-blue-50 text-blue-700';
      case 'newsletter': return 'bg-amber-50 text-amber-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const contentTypeNav = (type: string) => {
    switch (type) {
      case 'marketing_plan': return 'Marketing Plan';
      case 'social_post': return 'Social Media';
      case 'outreach_email': return 'Outreach';
      case 'newsletter': return 'Newsletters';
      default: return 'Dashboard';
    }
  };

  return (
  <div className="space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {businessName || 'there'}</h1>
        <p className="text-gray-500">{dateStr}</p>
      </div>
      {plan && (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-lg text-sm font-semibold capitalize">
          {plan} Plan
        </span>
      )}
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Marketing Plans', value: stats.plans, icon: Megaphone, action: 'Marketing Plan' },
        { label: 'Social Posts', value: stats.posts, icon: ImageIcon, action: 'Social Media' },
        { label: 'Outreach Emails', value: stats.emails, icon: Send, action: 'Outreach' },
        { label: 'Newsletters', value: stats.newsletters, icon: Mail, action: 'Newsletters' },
      ].map((stat, i) => (
        <Card key={i} className="p-6 cursor-pointer hover:border-brand-blue/30 transition-colors" onClick={() => onNavigate(stat.action)}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <stat.icon className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">{loadingStats ? '—' : stat.value}</span>
          </div>
        </Card>
      ))}
    </div>

    {/* Quick Actions + Outreach Email */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Marketing Plan', icon: Megaphone, tab: 'Marketing Plan', color: 'bg-purple-50 text-purple-600' },
            { label: 'Social Posts', icon: ImageIcon, tab: 'Social Media', color: 'bg-pink-50 text-pink-600' },
            { label: 'Outreach', icon: Send, tab: 'Outreach', color: 'bg-blue-50 text-blue-600' },
            { label: 'Newsletter', icon: Mail, tab: 'Newsletters', color: 'bg-amber-50 text-amber-600' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => onNavigate(action.tab)}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-brand-blue/30 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {outreachEmail && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Your Outreach Email</h2>
          <p className="text-sm text-gray-500 mb-4">Cold emails are sent from this address.</p>
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-blue shrink-0" />
            <span className="text-sm font-mono text-gray-700 truncate">{outreachEmail}</span>
          </div>
        </Card>
      )}
    </div>

    {/* Recent Activity */}
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Recent Activity</h2>
      </div>
      {recentContent.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {recentContent.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(contentTypeNav(item.type))}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium shrink-0', contentTypeColor(item.type))}>
                  {contentTypeLabel(item.type)}
                </span>
                <span className="text-sm font-medium text-gray-900 truncate">{item.title}</span>
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-4">
                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <p className="text-gray-500">No content generated yet. Start by creating a marketing plan!</p>
          <Button className="mt-4 gap-2" onClick={() => onNavigate('Marketing Plan')}>
            <Sparkles className="w-4 h-4" /> Generate Marketing Plan
          </Button>
        </div>
      )}
    </Card>
  </div>
);
};

// Old BrandKitPage removed — using BrandKitPageReal (from src/pages/BrandKit.tsx)

// GraphicsPage removed — use Social Media tab instead

// OutreachPage removed — use Outreach tab (OutreachContent) instead

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ plans: 0, posts: 0, emails: 0, newsletters: 0, flyers: 0, total: 0 });
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    if (!user) return;

    // Get content counts
    supabase
      .from('generated_content')
      .select('type, created_at')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data) return;
        const counts = { plans: 0, posts: 0, emails: 0, newsletters: 0, flyers: 0, total: data.length };
        const byWeek: Record<string, number> = {};

        data.forEach((item: any) => {
          if (item.type === 'marketing_plan') counts.plans++;
          if (item.type === 'social_post') counts.posts++;
          if (item.type === 'outreach_email') counts.emails++;
          if (item.type === 'newsletter') counts.newsletters++;

          // Group by week for chart
          const d = new Date(item.created_at);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          byWeek[key] = (byWeek[key] || 0) + 1;
        });

        setStats(counts);
        setChartData(Object.entries(byWeek).map(([name, count]) => ({ name, count })).slice(-8));
      });
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Track your content generation and usage.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Content', value: stats.total },
          { label: 'Marketing Plans', value: stats.plans },
          { label: 'Social Posts', value: stats.posts },
          { label: 'Outreach Emails', value: stats.emails },
          { label: 'Newsletters', value: stats.newsletters },
          { label: 'Flyers & Cards', value: stats.flyers },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Content Generated Over Time</h3>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip
                  cursor={{ fill: '#f8f9fb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" name="Items Created" fill="#3b6dca" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userPlan, setUserPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || '');
    setFullName(user.user_metadata?.full_name || '');

    supabase.from('profiles').select('plan').eq('id', user.id).single()
      .then(({ data }) => { if (data?.plan) setUserPlan(data.plan); });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.auth.updateUser({ data: { full_name: fullName } });
    setMessage('Account updated!');
    setTimeout(() => setMessage(''), 3000);
    setSaving(false);
  };

  const planPrice: Record<string, string> = { starter: '$250', growth: '$500', scale: '$1,500' };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and subscription.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
          {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{message}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={email} disabled className="bg-gray-50" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Update Account'}</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
          {userPlan ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center text-white">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-brand-navy capitalize">{userPlan} Plan</p>
                  <p className="text-sm text-brand-blue">{planPrice[userPlan] || ''} / month</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={async () => {
                  const { openCustomerPortal } = await import('./lib/stripe');
                  openCustomerPortal().catch(err => console.error('Portal error:', err));
                }}>Manage Subscription</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-500">No active plan. Choose a plan to unlock all features.</p>
              <Button onClick={async () => {
                const { subscribeToPlan } = await import('./lib/stripe');
                subscribeToPlan('starter').catch(err => console.error('Checkout error:', err));
              }}>Subscribe Now</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// --- Main Dashboard Layout ---

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    if (!user) return;
    setUserEmail(user.email || '');
    const fullName = user.user_metadata?.full_name || user.email || '';
    setUserInitials(fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2));

    supabase
      .from('brand_kits')
      .select('business_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.business_name) {
          setBusinessName(data.business_name);
        } else {
          setBusinessName(fullName);
        }
      });
  }, [user]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Marketing Plan', icon: Megaphone },
    { name: 'Social Media', icon: ImageIcon },
    { name: 'Outreach', icon: Send },
    { name: 'Newsletters', icon: Mail },
    { name: 'Brand Kit', icon: Palette },
    { name: 'Flyers & Cards', icon: Printer },
    { name: 'Website', icon: Globe },
    { name: 'Plans', icon: Zap },
    { name: 'Referrals', icon: Gift },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <DashboardHome businessName={businessName} onNavigate={setActiveTab} />;
      case 'Marketing Plan': return <MarketingPlan />;
      case 'Social Media': return <SocialContent />;
      case 'Outreach': return <OutreachContent />;
      case 'Newsletters': return <NewsletterContent />;
      case 'Flyers & Cards': return <FlyersAndCards />;
      case 'Website': return <WebsiteBuilder />;
      case 'Brand Kit': return <BrandKitPageReal />;
      case 'Plans': return <PlansPage />;
      case 'Referrals': return <Referrals />;
      case 'Analytics': return <AnalyticsPage />;
      case 'Settings': return <SettingsPage />;
      default: {
        const ActiveIcon = navItems.find(n => n.name === activeTab)?.icon || LayoutDashboard;
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ActiveIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{activeTab}</h2>
            <p className="text-gray-500 mt-2">This feature is coming soon to your dashboard.</p>
            <Button variant="outline" className="mt-6" onClick={() => setActiveTab('Dashboard')}>Back to Dashboard</Button>
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-light flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
              <span className="font-bold text-xl">K</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Kulve</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                setIsSidebarOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === item.name ? 'sidebar-active' : 'sidebar-inactive'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-sm font-bold">{userInitials || 'U'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{businessName || userEmail}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
            <button onClick={onLogout} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-900">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span>Pages</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input className="pl-9 h-9 w-64 bg-gray-50 border-none" placeholder="Search anything..." />
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-900 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
