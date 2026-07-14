import { useRef, useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  parseCsv,
  guessMapping,
  mappingToPoints,
  importMetricPoints,
  formatMetric,
  METRICS,
  type ColumnMapping,
  type MetricKey,
} from '../lib/metrics';

type Stage = 'choose' | 'map' | 'done';

export function ImportDataModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('choose');
  const [filename, setFilename] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({ dateCol: null, metrics: {} });
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStage('choose');
    setFilename('');
    setHeaders([]);
    setDataRows([]);
    setMapping({ dateCol: null, metrics: {} });
    setError('');
    setImportedCount(0);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    setError('');
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        setError('That file looks empty or has no data rows. It needs a header row plus at least one row of numbers.');
        return;
      }
      const hdr = rows[0];
      const body = rows.slice(1);
      setFilename(file.name);
      setHeaders(hdr);
      setDataRows(body);
      setMapping(guessMapping(hdr));
      setStage('map');
    } catch {
      setError('Could not read that file. Make sure it is a .csv export.');
    }
  };

  const points = stage === 'map' ? mappingToPoints(dataRows, mapping) : [];
  const months = new Set(points.map((p) => p.period_start));
  const mappedMetricCount = Object.keys(mapping.metrics).length;

  const setMetricCol = (key: MetricKey, col: number | null) => {
    setMapping((m) => {
      const metrics = { ...m.metrics };
      if (col === null) delete metrics[key];
      else metrics[key] = col;
      return { ...m, metrics };
    });
  };

  const doImport = async () => {
    if (!user || points.length === 0) return;
    setImporting(true);
    setError('');
    try {
      const count = await importMetricPoints(user.id, filename, points);
      setImportedCount(count);
      setStage('done');
    } catch (e: any) {
      setError(e?.message || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const cols = ['Month', 'MRR', 'Revenue', 'Sales', 'New Customers', 'Active Customers', 'Churn Rate'];
    const now = new Date();
    const rows = [cols.join(',')];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      rows.push([label, 8000 + i * 0, 9500, 42, 14, 96, 3.2].join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kulve-metrics-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Import your data</h2>
              <p className="text-xs text-gray-500">CSV export from Stripe, QuickBooks, Excel or your own sheet</p>
            </div>
          </div>
          <button onClick={close} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          {/* Stage: choose file */}
          {stage === 'choose' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
                onClick={() => fileInput.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-200 hover:border-brand-blue/40 hover:bg-gray-50'
                }`}
              >
                <Upload className="w-8 h-8 text-brand-blue mx-auto mb-3" />
                <p className="font-semibold text-gray-900">Drop a CSV here, or click to choose</p>
                <p className="text-sm text-gray-500 mt-1">One row per month, a column for each metric</p>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Not sure of the format?</p>
                  <p className="text-xs text-gray-500">Download a template, fill it in Excel, and upload it back.</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-blue bg-white border border-brand-blue/20 rounded-lg hover:bg-brand-blue/5"
                >
                  <Download className="w-4 h-4" /> Template
                </button>
              </div>
            </div>
          )}

          {/* Stage: map columns */}
          {stage === 'map' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="font-medium text-gray-700">{filename}</span>
                <span>· {dataRows.length} rows · {headers.length} columns</span>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Which column is the month / date?</label>
                <select
                  value={mapping.dateCol ?? ''}
                  onChange={(e) => setMapping((m) => ({ ...m, dateCol: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                >
                  <option value="">— Select a column —</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Map your metrics</label>
                <p className="text-xs text-gray-500 mb-3">We guessed these from your column names — adjust any that are wrong, set to “—” to skip.</p>
                <div className="space-y-2">
                  {METRICS.map((def) => (
                    <div key={def.key} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-36 shrink-0">{def.label}</span>
                      <select
                        value={mapping.metrics[def.key] ?? ''}
                        onChange={(e) => setMetricCol(def.key, e.target.value === '' ? null : Number(e.target.value))}
                        className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                      >
                        <option value="">—</option>
                        {headers.map((h, i) => (
                          <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
                {mapping.dateCol === null ? (
                  <span className="text-gray-600">Pick the month/date column to continue.</span>
                ) : points.length === 0 ? (
                  <span className="text-gray-600">No numbers found yet — map at least one metric to a column with values.</span>
                ) : (
                  <span className="text-brand-navy">
                    Ready to import <strong>{points.length}</strong> data points across{' '}
                    <strong>{months.size}</strong> month{months.size === 1 ? '' : 's'} ({mappedMetricCount} metric
                    {mappedMetricCount === 1 ? '' : 's'}).
                  </span>
                )}
              </div>

              {/* Preview of first parsed row */}
              {points.length > 0 && (
                <div className="text-xs text-gray-500">
                  Example: {(() => {
                    const first = points[0];
                    const def = METRICS.find((d) => d.key === first.metric_key)!;
                    return `${def.label} for ${first.period_start.slice(0, 7)} = ${formatMetric(def.format, first.value)}`;
                  })()}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStage('choose')} className="text-sm text-gray-500 hover:text-gray-700">
                  ← Choose a different file
                </button>
                <button
                  onClick={doImport}
                  disabled={points.length === 0 || importing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importing…' : `Import ${points.length || ''} data points`}
                </button>
              </div>
            </div>
          )}

          {/* Stage: done */}
          {stage === 'done' && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Imported {importedCount} data points</h3>
              <p className="text-gray-500 mt-1">Your cockpit now shows your real numbers.</p>
              <button
                onClick={() => { onImported(); close(); }}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90"
              >
                View my cockpit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
