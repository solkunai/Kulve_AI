// Data layer for the native Business Trackers: Inventory, Sales Log, Client List.
// Basic/fixed schemas (see migration_009_trackers.sql) — not a generic table builder.

import { supabase } from './supabase';
import { parseNumeric, parseDate, guessColumnMap } from './csv';

export type TrackerCategory = 'inventory' | 'sales' | 'clients';

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  sku: string | null;
  category: string | null;
  quantity: number;
  unit_price: number | null;
  reorder_point: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesRecord {
  id: string;
  user_id: string;
  sale_date: string; // yyyy-mm-dd
  item_name: string | null;
  quantity: number;
  amount: number;
  customer_name: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: 'active' | 'lead' | 'inactive';
  last_contacted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Field configs (drive TrackerFormModal + table columns) ─────────────────

export type FieldType = 'text' | 'number' | 'date' | 'select';

export interface TrackerField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for type: 'select'
}

export const INVENTORY_FIELDS: TrackerField[] = [
  { key: 'name', label: 'Item name', type: 'text', required: true },
  { key: 'sku', label: 'SKU', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'quantity', label: 'Quantity', type: 'number', required: true },
  { key: 'unit_price', label: 'Unit price', type: 'number' },
  { key: 'reorder_point', label: 'Reorder point', type: 'number' },
  { key: 'notes', label: 'Notes', type: 'text' },
];

export const SALES_FIELDS: TrackerField[] = [
  { key: 'sale_date', label: 'Date', type: 'date', required: true },
  { key: 'item_name', label: 'Item / description', type: 'text' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'amount', label: 'Amount', type: 'number', required: true },
  { key: 'customer_name', label: 'Customer', type: 'text' },
  { key: 'payment_method', label: 'Payment method', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'text' },
];

export const CLIENT_FIELDS: TrackerField[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'company', label: 'Company', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'lead', 'inactive'] },
  { key: 'notes', label: 'Notes', type: 'text' },
];

// ── Inventory CRUD ───────────────────────────────────────────────────────────

export async function fetchInventory(userId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as InventoryItem[];
}

export async function createInventoryItem(
  userId: string,
  fields: Partial<InventoryItem>
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({ ...fields, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data as InventoryItem;
}

export async function updateInventoryItem(
  id: string,
  fields: Partial<InventoryItem>
): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) throw error;
}

// ── Sales log CRUD ───────────────────────────────────────────────────────────

export async function fetchSalesLog(userId: string): Promise<SalesRecord[]> {
  const { data, error } = await supabase
    .from('sales_log')
    .select('*')
    .eq('user_id', userId)
    .order('sale_date', { ascending: false });
  if (error || !data) return [];
  return data as SalesRecord[];
}

export async function createSalesRecord(
  userId: string,
  fields: Partial<SalesRecord>
): Promise<SalesRecord> {
  const { data, error } = await supabase
    .from('sales_log')
    .insert({ ...fields, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data as SalesRecord;
}

export async function updateSalesRecord(
  id: string,
  fields: Partial<SalesRecord>
): Promise<void> {
  const { error } = await supabase
    .from('sales_log')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteSalesRecord(id: string): Promise<void> {
  const { error } = await supabase.from('sales_log').delete().eq('id', id);
  if (error) throw error;
}

// ── Client CRUD ──────────────────────────────────────────────────────────────

export async function fetchClients(userId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Client[];
}

export async function createClient(userId: string, fields: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...fields, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data as Client;
}

export async function updateClient(id: string, fields: Partial<Client>): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

// ── CSV import ───────────────────────────────────────────────────────────────
// Reuses the shared parser from ./csv. Each category gets its own synonym
// list (same idea as METRIC_SYNONYMS in metrics.ts) so column auto-mapping
// works against whatever headers a real spreadsheet export happens to use.

const INVENTORY_SYNONYMS: Record<string, string[]> = {
  name: ['name', 'item', 'item name', 'product', 'product name', 'description'],
  sku: ['sku', 'item code', 'product code', 'code'],
  category: ['category', 'type', 'department'],
  quantity: ['quantity', 'qty', 'stock', 'in stock', 'on hand', 'units'],
  unit_price: ['unit price', 'price', 'cost', 'unit cost'],
  reorder_point: ['reorder point', 'reorder level', 'min stock', 'low stock threshold'],
};

const SALES_SYNONYMS: Record<string, string[]> = {
  sale_date: ['date', 'sale date', 'order date', 'transaction date'],
  item_name: ['item', 'item name', 'product', 'description'],
  quantity: ['quantity', 'qty', 'units'],
  amount: ['amount', 'total', 'sale amount', 'revenue', 'price'],
  customer_name: ['customer', 'customer name', 'client', 'buyer'],
  payment_method: ['payment method', 'payment', 'method'],
};

const CLIENT_SYNONYMS: Record<string, string[]> = {
  name: ['name', 'client name', 'contact', 'full name'],
  email: ['email', 'email address'],
  phone: ['phone', 'phone number', 'mobile', 'tel'],
  company: ['company', 'business', 'organization'],
  status: ['status', 'stage'],
};

export const TRACKER_SYNONYMS: Record<TrackerCategory, Record<string, string[]>> = {
  inventory: INVENTORY_SYNONYMS,
  sales: SALES_SYNONYMS,
  clients: CLIENT_SYNONYMS,
};

export const TRACKER_FIELDS: Record<TrackerCategory, TrackerField[]> = {
  inventory: INVENTORY_FIELDS,
  sales: SALES_FIELDS,
  clients: CLIENT_FIELDS,
};

// Turn raw CSV rows + a guessed column map into row objects ready to insert,
// per category (numbers/dates parsed, unmapped/unparseable cells left out).
function rowsToRecords(
  category: TrackerCategory,
  dataRows: string[][],
  colMap: Partial<Record<string, number>>
): Record<string, unknown>[] {
  const numericKeys = new Set(
    category === 'inventory'
      ? ['quantity', 'unit_price', 'reorder_point']
      : category === 'sales'
      ? ['quantity', 'amount']
      : []
  );
  const dateKeys = new Set(category === 'sales' ? ['sale_date'] : []);

  const out: Record<string, unknown>[] = [];
  for (const row of dataRows) {
    const record: Record<string, unknown> = {};
    for (const [key, col] of Object.entries(colMap)) {
      const raw = row[col as number];
      if (raw === undefined || raw === '') continue;
      if (numericKeys.has(key)) {
        const n = parseNumeric(raw);
        if (n !== null) record[key] = n;
      } else if (dateKeys.has(key)) {
        const d = parseDate(raw);
        if (d !== null) record[key] = d;
      } else {
        record[key] = raw.trim();
      }
    }
    // Skip rows missing a required field (name for inventory/clients, amount+date for sales).
    if (category === 'inventory' && !record.name) continue;
    if (category === 'clients' && !record.name) continue;
    if (category === 'sales' && (record.amount === undefined || !record.sale_date)) continue;
    out.push(record);
  }
  return out;
}

export function guessTrackerMapping(
  category: TrackerCategory,
  headers: string[]
): Partial<Record<string, number>> {
  return guessColumnMap(headers, TRACKER_SYNONYMS[category]);
}

// Bulk-import CSV rows for a category. Inventory/Clients upsert (by sku/email,
// matching the unique constraints in migration_009); Sales always inserts —
// it's an append-only log, not a snapshot to overwrite.
export async function bulkImportTracker(
  category: TrackerCategory,
  userId: string,
  filename: string,
  dataRows: string[][],
  colMap: Partial<Record<string, number>>
): Promise<number> {
  const records = rowsToRecords(category, dataRows, colMap);
  if (records.length === 0) return 0;

  const connectionId = await ensureCsvConnection(userId, filename);
  const table = category === 'inventory' ? 'inventory_items' : category === 'sales' ? 'sales_log' : 'clients';
  const rows = records.map((r) => ({ ...r, user_id: userId, connection_id: connectionId }));

  if (category === 'sales') {
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw error;
    return rows.length;
  }

  // Rows with a null sku/email never conflict with each other (Postgres treats
  // NULLs as distinct under a unique constraint), so upsert alone is safe here —
  // no separate insert path needed for rows missing the conflict key.
  const onConflict = category === 'inventory' ? 'user_id,sku' : 'user_id,email';
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw error;
  return rows.length;
}

async function ensureCsvConnection(userId: string, filename: string): Promise<string | undefined> {
  const { data: existing } = await supabase
    .from('connections')
    .select('id')
    .eq('user_id', userId)
    .eq('provider', 'csv')
    .limit(1)
    .maybeSingle();

  const now = new Date().toISOString();
  if (existing?.id) {
    await supabase
      .from('connections')
      .update({ display_name: filename, last_synced_at: now, status: 'connected', updated_at: now })
      .eq('id', existing.id);
    return existing.id as string;
  }
  const { data: inserted } = await supabase
    .from('connections')
    .insert({ user_id: userId, provider: 'csv', display_name: filename, last_synced_at: now })
    .select('id')
    .single();
  return inserted?.id;
}
