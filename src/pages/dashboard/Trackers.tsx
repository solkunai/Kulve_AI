import { useState, useEffect } from 'react';
import { Package, Receipt, Users, Plus, Upload, Search, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { TrackerFormModal } from '../../components/TrackerFormModal';
import { ImportCsvModal } from '../../components/ImportCsvModal';
import {
  TRACKER_FIELDS,
  type TrackerCategory,
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  fetchSalesLog,
  createSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from '../../lib/trackers';

const TAB_CONFIG: Record<TrackerCategory, {
  label: string;
  singular: string;
  icon: typeof Package;
  emptyTitle: string;
  emptySubtitle: string;
}> = {
  inventory: {
    label: 'Inventory', singular: 'Item', icon: Package,
    emptyTitle: 'No inventory yet',
    emptySubtitle: 'Add your first item or import a CSV to get started.',
  },
  sales: {
    label: 'Sales Log', singular: 'Sale', icon: Receipt,
    emptyTitle: 'No sales logged yet',
    emptySubtitle: 'Add a sale or import your sales history.',
  },
  clients: {
    label: 'Clients', singular: 'Client', icon: Users,
    emptyTitle: 'No clients yet',
    emptySubtitle: 'Add a client or import your contact list.',
  },
};

export default function Trackers() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TrackerCategory>('inventory');
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fields = TRACKER_FIELDS[tab];
  const config = TAB_CONFIG[tab];

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const data =
      tab === 'inventory' ? await fetchInventory(user.id) :
      tab === 'sales' ? await fetchSalesLog(user.id) :
      await fetchClients(user.id);
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    setSearch('');
    setConfirmDeleteId(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab]);

  const filteredRows = search
    ? rows.filter((r) => fields.some((f) => String(r[f.key] ?? '').toLowerCase().includes(search.toLowerCase())))
    : rows;

  const openAdd = () => { setEditingRow(null); setFormOpen(true); };
  const openEdit = (row: Record<string, any>) => { setEditingRow(row); setFormOpen(true); };

  const handleSave = async (values: Record<string, unknown>) => {
    if (!user) return;
    if (editingRow) {
      if (tab === 'inventory') await updateInventoryItem(editingRow.id, values);
      else if (tab === 'sales') await updateSalesRecord(editingRow.id, values);
      else await updateClient(editingRow.id, values);
    } else {
      if (tab === 'inventory') await createInventoryItem(user.id, values);
      else if (tab === 'sales') await createSalesRecord(user.id, values);
      else await createClient(user.id, values);
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (tab === 'inventory') await deleteInventoryItem(id);
    else if (tab === 'sales') await deleteSalesRecord(id);
    else await deleteClient(id);
    setConfirmDeleteId(null);
    await load();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trackers</h1>
        <p className="text-gray-500">Keep your inventory, sales, and clients in one place — no spreadsheets required.</p>
      </div>

      <div className="flex gap-2">
        {(Object.keys(TAB_CONFIG) as TrackerCategory[]).map((t) => {
          const Icon = TAB_CONFIG[t].icon;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                tab === t ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4 inline mr-2" /> {TAB_CONFIG[t].label}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${config.label.toLowerCase()}...`}
              className="pl-9 pr-3 h-9 rounded-lg border border-gray-200 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-blue bg-white border border-brand-blue/20 rounded-lg hover:bg-brand-blue/5"
            >
              <Upload className="w-4 h-4" /> Import CSV
            </button>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90"
            >
              <Plus className="w-4 h-4" /> Add {config.singular}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center">
            <config.icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {rows.length === 0 ? config.emptyTitle : 'No matches'}
            </h3>
            <p className="text-sm text-gray-500">
              {rows.length === 0 ? config.emptySubtitle : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  {fields.map((f) => <th key={f.key} className="px-6 py-3">{f.label}</th>)}
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {fields.map((f) => (
                      <td key={f.key} className="px-6 py-4 text-gray-900">
                        {f.key === 'status' ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            row.status === 'active' ? 'bg-green-50 text-green-700' :
                            row.status === 'lead' ? 'bg-amber-50 text-amber-700' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            {row.status}
                          </span>
                        ) : f.type === 'number' && row[f.key] != null ? (
                          Number(row[f.key]).toLocaleString('en-US')
                        ) : (
                          row[f.key] ?? '—'
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {confirmDeleteId === row.id ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="text-xs text-gray-500">Delete?</span>
                          <button onClick={() => handleDelete(row.id)} className="text-xs font-semibold text-red-600 hover:text-red-700">
                            Yes
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-500 hover:text-gray-700">
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-gray-100 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDeleteId(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TrackerFormModal
        open={formOpen}
        title={editingRow ? `Edit ${config.singular}` : `Add ${config.singular}`}
        fields={fields}
        initialValues={editingRow ? Object.fromEntries(fields.map((f) => [f.key, editingRow[f.key]])) : undefined}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <ImportCsvModal
        open={importOpen}
        category={tab}
        onClose={() => setImportOpen(false)}
        onImported={() => { setImportOpen(false); load(); }}
      />
    </div>
  );
}
