// Normalized metrics layer — the heart of the Business Cockpit.
//
// Every data source (CSV upload, manual entry, Stripe, QuickBooks, Microsoft…)
// translates into the same shape and lands in the `metrics` table. The cockpit
// UI reads ONLY from here and never knows or cares where a number came from.

import { supabase } from './supabase';
import { parseCsv, parseNumeric, parsePeriodToMonthStart, norm } from './csv';

export { parseCsv };

export type MetricKey =
  | 'mrr'
  | 'revenue'
  | 'sales'
  | 'new_customers'
  | 'active_customers'
  | 'churn_rate';

export type MetricFormat = 'currency' | 'number' | 'percent';

export interface MetricDef {
  key: MetricKey;
  label: string;
  format: MetricFormat;
  goodDirection: 'up' | 'down'; // which direction of change is "good" (colours the badge)
  description: string;
}

// Canonical KPI registry. Add a metric here and it flows through the whole cockpit.
export const METRICS: MetricDef[] = [
  { key: 'mrr',              label: 'MRR',              format: 'currency', goodDirection: 'up',   description: 'Monthly recurring revenue' },
  { key: 'revenue',          label: 'Revenue',          format: 'currency', goodDirection: 'up',   description: 'Total revenue in the period' },
  { key: 'sales',            label: 'Sales',            format: 'number',   goodDirection: 'up',   description: 'Number of sales / closed deals' },
  { key: 'new_customers',    label: 'New Customers',    format: 'number',   goodDirection: 'up',   description: 'Customers acquired in the period' },
  { key: 'active_customers', label: 'Active Customers', format: 'number',   goodDirection: 'up',   description: 'Total paying customers' },
  { key: 'churn_rate',       label: 'Churn Rate',       format: 'percent',  goodDirection: 'down', description: 'Share of customers lost in the period' },
];

export const METRIC_BY_KEY = Object.fromEntries(
  METRICS.map((m) => [m.key, m])
) as Record<MetricKey, MetricDef>;

export interface MetricPoint {
  metric_key: MetricKey;
  value: number;
  period_start: string; // ISO date (yyyy-mm-dd)
  period_grain: 'day' | 'week' | 'month';
  source: string;
}

export interface MetricSeries {
  key: MetricKey;
  def: MetricDef;
  current: number;
  previous: number | null;
  changePct: number | null; // % change of current vs previous period
  points: { label: string; value: number; date: string }[];
}

// Fetch a user's monthly metric points, oldest → newest.
export async function fetchMetrics(userId: string): Promise<MetricPoint[]> {
  const { data, error } = await supabase
    .from('metrics')
    .select('metric_key, value, period_start, period_grain, source')
    .eq('user_id', userId)
    .eq('period_grain', 'month')
    .order('period_start', { ascending: true });

  if (error || !data) return [];
  return data.map((d: any) => ({
    metric_key: d.metric_key,
    value: Number(d.value),
    period_start: d.period_start,
    period_grain: d.period_grain,
    source: d.source,
  }));
}

function monthLabel(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short' });
}

// Roll raw points up into one series per metric, with current / previous / % change.
export function buildSeries(points: MetricPoint[]): MetricSeries[] {
  return METRICS.map((def) => {
    const pts = points
      .filter((p) => p.metric_key === def.key)
      .map((p) => ({ label: monthLabel(p.period_start), value: Number(p.value), date: p.period_start }))
      .slice(-12);

    const current = pts.length ? pts[pts.length - 1].value : 0;
    const previous = pts.length > 1 ? pts[pts.length - 2].value : null;
    const changePct =
      previous !== null && previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : null;

    return { key: def.key, def, current, previous, changePct, points: pts };
  });
}

// Whether a change should be coloured green (good) or red (bad) for this metric.
export function isGoodChange(def: MetricDef, changePct: number | null): boolean | null {
  if (changePct === null || changePct === 0) return null;
  const goingUp = changePct > 0;
  return def.goodDirection === 'up' ? goingUp : !goingUp;
}

export function formatMetric(format: MetricFormat, value: number): string {
  if (format === 'currency') {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
    if (Math.abs(value) >= 10_000) return `$${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  if (format === 'percent') return `${value.toFixed(1).replace(/\.0$/, '')}%`;
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// ── CSV import helpers ──────────────────────────────────────────────────────
// parseCsv / parseNumeric / parsePeriodToMonthStart / norm now live in ./csv
// (shared with the Trackers feature) and are imported at the top of this file.

export interface ColumnMapping {
  dateCol: number | null;
  metrics: Partial<Record<MetricKey, number>>; // metric -> column index
}

const DATE_SYNONYMS = ['month', 'date', 'period', 'time', 'as of', 'mon'];
const METRIC_SYNONYMS: Record<MetricKey, string[]> = {
  mrr: ['mrr', 'monthly recurring revenue', 'recurring revenue'],
  revenue: ['revenue', 'total revenue', 'net revenue', 'sales revenue', 'income', 'total income', 'gross revenue'],
  sales: ['sales', 'orders', 'deals', 'transactions', 'closed deals', 'units sold', 'num sales'],
  new_customers: ['new customers', 'new custs', 'customers acquired', 'signups', 'sign ups', 'new accounts', 'new users'],
  active_customers: ['active customers', 'total customers', 'customers', 'subscribers', 'active subscribers', 'paying customers'],
  churn_rate: ['churn rate', 'churn', 'churn %', 'attrition', 'attrition rate'],
};

// Best-effort auto-mapping of CSV headers to the date column + each metric.
export function guessMapping(headers: string[]): ColumnMapping {
  const normd = headers.map(norm);
  const mapping: ColumnMapping = { dateCol: null, metrics: {} };

  mapping.dateCol = normd.findIndex((h) => DATE_SYNONYMS.some((d) => h === d || h.includes(d)));
  if (mapping.dateCol === -1) mapping.dateCol = null;

  for (const def of METRICS) {
    const syns = METRIC_SYNONYMS[def.key];
    // exact match first, then substring
    let col = normd.findIndex((h) => syns.includes(h));
    if (col === -1) col = normd.findIndex((h) => syns.some((s) => h.includes(s)));
    if (col !== -1) mapping.metrics[def.key] = col;
  }
  return mapping;
}

// Turn raw data rows + a mapping into normalized metric points.
export function mappingToPoints(dataRows: string[][], mapping: ColumnMapping): MetricPoint[] {
  if (mapping.dateCol === null) return [];
  const out: MetricPoint[] = [];
  for (const row of dataRows) {
    const period = parsePeriodToMonthStart(row[mapping.dateCol] ?? '');
    if (!period) continue;
    for (const [key, col] of Object.entries(mapping.metrics)) {
      const value = parseNumeric(row[col as number] ?? '');
      if (value === null) continue;
      out.push({ metric_key: key as MetricKey, value, period_start: period, period_grain: 'month', source: 'csv' });
    }
  }
  return out;
}

// Upsert imported points into the metrics table under a 'csv' connection.
export async function importMetricPoints(
  userId: string,
  filename: string,
  points: MetricPoint[]
): Promise<number> {
  // Reuse a single 'csv' connection per user for provenance.
  const { data: existing } = await supabase
    .from('connections')
    .select('id')
    .eq('user_id', userId)
    .eq('provider', 'csv')
    .limit(1)
    .maybeSingle();

  let connectionId = existing?.id as string | undefined;
  const now = new Date().toISOString();

  if (connectionId) {
    await supabase
      .from('connections')
      .update({ display_name: filename, last_synced_at: now, status: 'connected', updated_at: now })
      .eq('id', connectionId);
  } else {
    const { data: inserted } = await supabase
      .from('connections')
      .insert({ user_id: userId, provider: 'csv', display_name: filename, last_synced_at: now })
      .select('id')
      .single();
    connectionId = inserted?.id;
  }

  const rows = points.map((p) => ({
    user_id: userId,
    metric_key: p.metric_key,
    value: p.value,
    period_start: p.period_start,
    period_grain: 'month',
    source: 'csv',
    connection_id: connectionId ?? null,
  }));

  const { error } = await supabase
    .from('metrics')
    .upsert(rows, { onConflict: 'user_id,metric_key,period_start,period_grain' });
  if (error) throw error;
  return rows.length;
}

// Deterministic sample data so a brand-new account can SEE the cockpit before
// connecting anything. Clearly labelled as "Sample data" in the UI.
export function sampleMetrics(): MetricPoint[] {
  const months = 12;
  const now = new Date();
  const trajectories: Record<MetricKey, (i: number) => number> = {
    mrr:              (i) => 4200 + i * 780 + Math.round(Math.sin(i) * 250),
    revenue:          (i) => 5200 + i * 1100 + Math.round(Math.cos(i) * 400),
    sales:            (i) => 38 + i * 6 + (i % 3),
    new_customers:    (i) => 12 + Math.round(i * 1.7) + (i % 2),
    active_customers: (i) => 60 + i * 9,
    churn_rate:       (i) => Math.max(1.2, 5.5 - i * 0.25),
  };

  const out: MetricPoint[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const period = d.toISOString().slice(0, 10);
    (Object.keys(trajectories) as MetricKey[]).forEach((key) => {
      const raw = trajectories[key](i);
      out.push({
        metric_key: key,
        value: Number(raw.toFixed(key === 'churn_rate' ? 1 : 0)),
        period_start: period,
        period_grain: 'month',
        source: 'sample',
      });
    });
  }
  return out;
}
