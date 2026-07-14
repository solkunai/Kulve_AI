import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Upload,
  RefreshCw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ImportDataModal } from '../../components/ImportDataModal';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '../../lib/auth';
import {
  fetchMetrics,
  buildSeries,
  sampleMetrics,
  formatMetric,
  isGoodChange,
  METRIC_BY_KEY,
  type MetricSeries,
  type MetricKey,
} from '../../lib/metrics';

const BLUE = '#3b6dca';
const NAVY = '#1a1f36';
const GREEN = '#10b981';
const RED = '#ef4444';

// ── Change badge (▲ +12% green / ▼ -4% red, coloured by whether it's good) ──
function ChangeBadge({ series }: { series: MetricSeries }) {
  if (series.changePct === null) {
    return <span className="text-xs text-gray-400">—</span>;
  }
  const good = isGoodChange(series.def, series.changePct);
  const up = series.changePct > 0;
  const color =
    good === null ? 'text-gray-500 bg-gray-100' : good ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50';
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      <Icon className="w-3 h-3" />
      {up ? '+' : ''}
      {series.changePct.toFixed(1)}%
    </span>
  );
}

// ── KPI card with sparkline ─────────────────────────────────────────────────
function KpiCard({ series }: { series: MetricSeries }) {
  const good = isGoodChange(series.def, series.changePct);
  const sparkColor = good === false ? RED : good === true ? GREEN : BLUE;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{series.def.label}</p>
        <ChangeBadge series={series} />
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{formatMetric(series.def.format, series.current)}</p>
      <div className="h-10 mt-2 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series.points} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
            <defs>
              <linearGradient id={`spark-${series.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparkColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={sparkColor}
              strokeWidth={2}
              fill={`url(#spark-${series.key})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">vs. last month</p>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: '10px',
  border: 'none',
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  fontSize: '12px',
};

export default function Cockpit() {
  const { user } = useAuth();
  const [series, setSeries] = useState<MetricSeries[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const points = await fetchMetrics(user.id);
    if (points.length === 0) {
      setSeries(buildSeries(sampleMetrics()));
      setIsSample(true);
    } else {
      setSeries(buildSeries(points));
      setIsSample(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const get = (key: MetricKey) => series.find((s) => s.key === key);

  // Combined MRR + Revenue chart data
  const mrr = get('mrr');
  const revenue = get('revenue');
  const trendData =
    mrr?.points.map((p, i) => ({
      name: p.label,
      MRR: p.value,
      Revenue: revenue?.points[i]?.value ?? 0,
    })) ?? [];

  const newCustomers = get('new_customers');
  const churn = get('churn_rate');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading your cockpit…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Cockpit</h1>
          <p className="text-gray-500">Your live KPIs — revenue, sales, customers and churn in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors"
          >
            <Upload className="w-4 h-4" /> Import data
          </button>
        </div>
      </div>

      {/* Sample-data banner */}
      {isSample && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-navy">You're viewing sample data</p>
              <p className="text-sm text-gray-500">
                Import a CSV from Stripe, QuickBooks or Excel — or connect an account — to see your real numbers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-brand-blue bg-white border border-brand-blue/20 rounded-lg hover:bg-brand-blue/5 transition-colors shrink-0"
          >
            Connect your data <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {series.map((s) => (
          <KpiCard key={s.key} series={s} />
        ))}
      </div>

      {/* MRR + Revenue trend */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Revenue & MRR</h3>
          <span className="text-xs text-gray-400">Last 12 months</span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-mrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NAVY} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={NAVY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={8} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(v) => formatMetric('currency', Number(v))}
                width={64}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: any, name) => [formatMetric('currency', Number(v)), name]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="monotone" dataKey="Revenue" stroke={BLUE} strokeWidth={2.5} fill="url(#g-rev)" />
              <Area type="monotone" dataKey="MRR" stroke={NAVY} strokeWidth={2.5} fill="url(#g-mrr)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New customers + Churn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="font-semibold text-gray-900 mb-6">New Customers</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newCustomers?.points ?? []} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} width={32} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8f9fb' }} />
                <Bar dataKey="value" name="New customers" fill={BLUE} radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="font-semibold text-gray-900 mb-6">Churn Rate</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={churn?.points ?? []} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={8} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  width={36}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, 'Churn']} />
                <Line type="monotone" dataKey="value" name="Churn" stroke={RED} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data source footer */}
      <p className="text-xs text-gray-400 text-center">
        {isSample ? (
          <>Showing sample data · {METRIC_BY_KEY.mrr.description}</>
        ) : (
          <>Live data · pulled from your connected sources</>
        )}
      </p>

      <ImportDataModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => { setImportOpen(false); load(); }}
      />
    </div>
  );
}
