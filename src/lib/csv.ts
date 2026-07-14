// Shared CSV parsing helpers — no external library (deliberate, matches existing convention).
// Originally lived only in metrics.ts; extracted so other trackers (Inventory, Sales, Clients)
// can reuse the same parser instead of each rolling their own.

// Robust CSV parser: handles quoted fields, embedded commas/newlines, and ""-escaped quotes.
export function parseCsv(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

// Parse a cell into a number, tolerating $, commas, %, and (parentheses) negatives.
export function parseNumeric(raw: string): number | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/[$,%\s]/g, '');
  if (s === '' || isNaN(Number(s))) return null;
  return neg ? -Number(s) : Number(s);
}

// Parse many date shapes into an ISO date (yyyy-mm-dd). Returns null if unparseable.
export function parseDate(raw: string): string | null {
  const s = String(raw || '').trim();
  if (!s) return null;
  const iso = (y: number, mo: number, d: number) =>
    `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/); // 2024-01-15
  if (m && +m[2] >= 1 && +m[2] <= 12) return iso(+m[1], +m[2], +m[3]);

  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/); // 01/15/2024 (mm/dd/yyyy)
  if (m && +m[1] >= 1 && +m[1] <= 12) return iso(+m[3], +m[1], +m[2]);

  const d = new Date(s); // native-parseable forms (e.g. "Jan 15, 2024")
  if (!isNaN(d.getTime())) return iso(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return null;
}

// Parse many date shapes into a month-start ISO date (yyyy-mm-01). Returns null if unparseable.
export function parsePeriodToMonthStart(raw: string): string | null {
  const s = String(raw || '').trim();
  if (!s) return null;
  const iso = (y: number, mo: number) => `${y}-${String(mo).padStart(2, '0')}-01`;

  let m = s.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?$/); // 2024-01, 2024/01/15
  if (m && +m[2] >= 1 && +m[2] <= 12) return iso(+m[1], +m[2]);

  m = s.match(/^(\d{1,2})[-/.](\d{4})$/); // 01/2024
  if (m && +m[1] >= 1 && +m[1] <= 12) return iso(+m[2], +m[1]);

  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  m = s.toLowerCase().match(/^([a-z]{3,})[\s\-,]+(\d{2,4})$/); // Jan 2024, January-24
  if (m) {
    const idx = months.indexOf(m[1].slice(0, 3));
    if (idx >= 0) {
      let y = +m[2];
      if (y < 100) y += 2000;
      return iso(y, idx + 1);
    }
  }

  const d = new Date(s); // mm/dd/yyyy and other native-parseable forms
  if (!isNaN(d.getTime())) return iso(d.getFullYear(), d.getMonth() + 1);
  return null;
}

// Normalize a header string for synonym matching (lowercase, collapse separators/whitespace).
export function norm(s: string): string {
  return s.toLowerCase().replace(/[_\-.]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Best-effort auto-mapping of CSV headers to target field keys via synonym lists.
export function guessColumnMap<K extends string>(
  headers: string[],
  synonyms: Record<K, string[]>
): Partial<Record<K, number>> {
  const normd = headers.map(norm);
  const mapping: Partial<Record<K, number>> = {};
  for (const key of Object.keys(synonyms) as K[]) {
    const syns = synonyms[key];
    let col = normd.findIndex((h) => syns.includes(h));
    if (col === -1) col = normd.findIndex((h) => syns.some((s) => h.includes(s)));
    if (col !== -1) mapping[key] = col;
  }
  return mapping;
}
