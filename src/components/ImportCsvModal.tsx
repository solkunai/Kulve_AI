import { useRef, useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { parseCsv } from '../lib/csv';
import {
  bulkImportTracker,
  guessTrackerMapping,
  TRACKER_FIELDS,
  type TrackerCategory,
} from '../lib/trackers';

type Stage = 'choose' | 'map' | 'done';

// Generic CSV import modal for the Business Trackers — same choose → map → done
// flow as ImportDataModal (the Cockpit's metrics importer), parameterized by
// category instead of hardcoded to the metrics registry.
export function ImportCsvModal({
  open,
  category,
  onClose,
  onImported,
}: {
  open: boolean;
  category: TrackerCategory;
  onClose: () => void;
  onImported: () => void;
}) {
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('choose');
  const [filename, setFilename] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [colMap, setColMap] = useState<Partial<Record<string, number>>>({});
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  if (!open) return null;

  const fields = TRACKER_FIELDS[category];

  const reset = () => {
    setStage('choose');
    setFilename('');
    setHeaders([]);
    setDataRows([]);
    setColMap({});
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
        setError('That file looks empty or has no data rows. It needs a header row plus at least one row of data.');
        return;
      }
      const hdr = rows[0];
      const body = rows.slice(1);
      setFilename(file.name);
      setHeaders(hdr);
      setDataRows(body);
      setColMap(guessTrackerMapping(category, hdr));
      setStage('map');
    } catch {
      setError('Could not read that file. Make sure it is a .csv export.');
    }
  };

  const setFieldCol = (key: string, col: number | null) => {
    setColMap((m) => {
      const next = { ...m };
      if (col === null) delete next[key];
      else next[key] = col;
      return next;
    });
  };

  const mappedCount = Object.keys(colMap).length;

  const doImport = async () => {
    if (!user || mappedCount === 0) return;
    setImporting(true);
    setError('');
    try {
      const count = await bulkImportTracker(category, user.id, filename, dataRows, colMap);
      setImportedCount(count);
      setStage('done');
    } catch (e: any) {
      setError(e?.message || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Import CSV</h2>
              <p className="text-xs text-gray-500">Upload a spreadsheet export to bulk-add rows</p>
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

          {stage === 'choose' && (
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
              <p className="text-sm text-gray-500 mt-1">One row per record, a column for each field</p>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {stage === 'map' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="font-medium text-gray-700">{filename}</span>
                <span>· {dataRows.length} rows · {headers.length} columns</span>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-1.5 block">Map your columns</label>
                <p className="text-xs text-gray-500 mb-3">We guessed these from your column names — adjust any that are wrong, set to “—” to skip.</p>
                <div className="space-y-2">
                  {fields.map((f) => (
                    <div key={f.key} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-36 shrink-0">
                        {f.label}{f.required && <span className="text-red-500"> *</span>}
                      </span>
                      <select
                        value={colMap[f.key] ?? ''}
                        onChange={(e) => setFieldCol(f.key, e.target.value === '' ? null : Number(e.target.value))}
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

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
                {mappedCount === 0 ? (
                  <span className="text-gray-600">Map at least one column to continue.</span>
                ) : (
                  <span className="text-brand-navy">
                    Ready to import up to <strong>{dataRows.length}</strong> row{dataRows.length === 1 ? '' : 's'} ({mappedCount} field
                    {mappedCount === 1 ? '' : 's'} mapped).
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStage('choose')} className="text-sm text-gray-500 hover:text-gray-700">
                  ← Choose a different file
                </button>
                <button
                  onClick={doImport}
                  disabled={mappedCount === 0 || importing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importing…' : 'Import rows'}
                </button>
              </div>
            </div>
          )}

          {stage === 'done' && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Imported {importedCount} rows</h3>
              <p className="text-gray-500 mt-1">Your data is ready to view.</p>
              <button
                onClick={() => { onImported(); close(); }}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90"
              >
                View my data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
