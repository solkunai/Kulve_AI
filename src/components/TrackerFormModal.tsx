import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { TrackerField } from '../lib/trackers';

// Generic add/edit modal for the Business Trackers (Inventory, Sales, Clients) —
// one component driven by a `fields` config instead of three near-duplicate modals.
export function TrackerFormModal({
  open,
  title,
  fields,
  initialValues,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  fields: TrackerField[];
  initialValues?: Record<string, unknown>;
  onClose: () => void;
  onSave: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues ?? {});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const setField = (key: string, value: unknown) => setValues((v) => ({ ...v, [key]: value }));

  const close = () => {
    setValues(initialValues ?? {});
    setError('');
    onClose();
  };

  const handleSave = async () => {
    const missing = fields.find((f) => f.required && !values[f.key]);
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    // Blank optional fields become '' from empty text/number inputs — omit them
    // so the DB gets null/its default instead of an empty string in a numeric column.
    const cleaned: Record<string, unknown> = {};
    for (const f of fields) {
      const v = values[f.key];
      if (v !== '' && v !== undefined) cleaned[f.key] = v;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(cleaned);
      close();
    } catch (e: any) {
      setError(e?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={close} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm font-semibold text-gray-900 mb-1.5 block">
                {f.label}{f.required && <span className="text-red-500"> *</span>}
              </label>
              {f.type === 'select' ? (
                <select
                  value={(values[f.key] as string) ?? ''}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                >
                  <option value="">— Select —</option>
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  value={(values[f.key] as string | number) ?? ''}
                  onChange={(e) => setField(f.key, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                />
              )}
            </div>
          ))}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={close} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
