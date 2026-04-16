import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Lock, Edit2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { generateMarketingPlan } from '../../lib/content';
import { canGenerate, getPlanUpgradeMessage, type PlanType } from '../../lib/plans';

export default function MarketingPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userPlan, setUserPlan] = useState<PlanType>('free');
  const [plansGenerated, setPlansGenerated] = useState(0);
  const [savedPlans, setSavedPlans] = useState<{ id: string; title: string; content: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;

    // Get user plan
    supabase
      .from('profiles')
      .select('plan, usage_counts')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUserPlan((data.plan as PlanType) || 'free');
          setPlansGenerated(data.usage_counts?.marketing_plans || 0);
        }
      });

    // Get saved plans
    supabase
      .from('generated_content')
      .select('id, title, content, created_at')
      .eq('user_id', user.id)
      .eq('type', 'marketing_plan')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setSavedPlans(data.map(d => ({ ...d, content: (d.content as any).text || '' })));
      });
  }, [user]);

  const generationCheck = canGenerate(userPlan, 'marketing_plans', {
    marketing_plans: plansGenerated,
    graphics: 0,
    social_posts: 0,
    outreach_emails: 0,
    newsletters: 0,
    period_start: '',
  });

  const handleGenerate = async () => {
    if (!user) return;
    if (!generationCheck.allowed) return;

    setLoading(true);
    setPlan('');

    const { data: brandKit } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!brandKit) {
      setPlan('⚠️ Please set up your brand kit first before generating a marketing plan.');
      setLoading(false);
      return;
    }

    // Check required marketing preferences
    if (!brandKit.main_goal || !brandKit.unique_selling_point) {
      setPlan('⚠️ Please fill out the Marketing Preferences section in your Brand Kit (main goal and what makes you different) for a better plan.');
      setLoading(false);
      return;
    }

    const result = await generateMarketingPlan(brandKit);
    setPlan(result);

    // Save to database
    const title = `Marketing Plan — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    await supabase.from('generated_content').insert({
      user_id: user.id,
      type: 'marketing_plan',
      title,
      content: { text: result },
    });

    // Increment usage count
    const newCount = plansGenerated + 1;
    setPlansGenerated(newCount);
    await supabase
      .from('profiles')
      .update({ usage_counts: { marketing_plans: newCount } })
      .eq('id', user.id);

    setSavedPlans(prev => [{ id: crypto.randomUUID(), title, content: result, created_at: new Date().toISOString() }, ...prev]);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Plan</h1>
          <p className="text-gray-500">AI-generated monthly marketing strategy based on your brand kit.</p>
        </div>
        {generationCheck.allowed ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate New Plan</>
            )}
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
            <Lock className="w-4 h-4" /> Plan Generated This Month
          </div>
        )}
      </div>

      {!generationCheck.allowed && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <Lock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-800 font-semibold">{getPlanUpgradeMessage(userPlan, 'marketing plan')}</p>
          <p className="text-amber-600 text-sm mt-1">You get 1 marketing plan per month. Your next plan will be available at the start of your next billing cycle.</p>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Crafting your personalized marketing plan...</p>
          <p className="text-gray-400 text-sm mt-1">This takes about 15-30 seconds</p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Your Marketing Plan</span>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
              <button
                onClick={() => setEditing(!editing)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm border rounded-lg transition-colors ${editing ? 'bg-brand-blue text-white border-brand-blue' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                <Edit2 className="w-4 h-4" /> {editing ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>

          {editing && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-2">
              <span className="text-xs text-gray-400">Markdown supported (# headings, **bold**, - bullets)</span>
              <textarea
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm font-mono focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-y"
              />
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-8 prose prose-sm max-w-none prose-headings:text-brand-navy prose-strong:text-gray-900">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(plan) }} />
            </div>
          </div>
        </div>
      )}

      {savedPlans.length > 0 && !loading && !plan && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Previous Plans</h2>
          {savedPlans.map((saved) => (
            <button
              key={saved.id}
              onClick={() => setPlan(saved.content)}
              className="w-full text-left bg-white border border-gray-100 rounded-xl p-5 hover:border-brand-blue/30 transition-colors"
            >
              <p className="font-medium text-gray-900">{saved.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(saved.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple markdown to HTML (handles headers, bold, lists)
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });
}
