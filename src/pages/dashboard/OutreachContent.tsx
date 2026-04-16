import { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Send, Edit2, Check, Search, Upload, Mail, Globe, Phone, MapPin, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { findAndPitchProspects, writeOutreachEmails, type Prospect } from '../../lib/prospecting';
import { sendOutreachEmail, isEmailConfigured } from '../../lib/email';

type Tab = 'prospects' | 'my-contacts';

export default function OutreachContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('prospects');
  const [loading, setLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<any>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('');
  const [searchZip, setSearchZip] = useState('');
  const [searchCountry, setSearchCountry] = useState('US');
  const [customCategory, setCustomCategory] = useState('');
  const [status, setStatus] = useState('');

  // Email sending
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);
  const [sendResults, setSendResults] = useState<Record<number, { success: boolean; error?: string }>>({});

  // CSV upload
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvContacts, setCsvContacts] = useState<{ name: string; email: string; business?: string; emailSubject?: string; emailBody?: string; generated?: boolean }[]>([]);
  const [generatingEmails, setGeneratingEmails] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setBrandKit(data);
          setSearchCity(data.business_city || '');
          setSearchState(data.business_state || '');
          setSearchZip(data.business_zip || '');
          setSearchCountry(data.business_country || 'US');
        }
      });
  }, [user]);

  const buildLocationString = () => {
    const parts = [searchCity, searchState, searchZip].filter(Boolean);
    return parts.join(', ');
  };

  const handleFindProspects = async () => {
    const location = buildLocationString();
    if (!brandKit || !location) return;
    setLoading(true);
    setStatus('Finding local businesses...');
    setProspects([]);

    const customCats = customCategory.trim()
      ? customCategory.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    try {
      const results = await findAndPitchProspects(
        brandKit,
        location,
        customCats,
        (progressStatus) => setStatus(progressStatus)
      );
      setProspects(results);
      setStatus(`Found ${results.length} prospects with personalized pitches`);
    } catch (err) {
      console.error('Prospecting error:', err);
      setStatus('Something went wrong. Try again.');
    }

    setLoading(false);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

      const nameIdx = headers.findIndex(h => h.includes('name'));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const bizIdx = headers.findIndex(h => h.includes('business') || h.includes('company'));

      if (emailIdx === -1) {
        setStatus('CSV must have an "email" column');
        return;
      }

      const contacts = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        return {
          name: nameIdx >= 0 ? cols[nameIdx] : '',
          email: cols[emailIdx],
          business: bizIdx >= 0 ? cols[bizIdx] : undefined,
        };
      }).filter(c => c.email && c.email.includes('@'));

      setCsvContacts(contacts);
      setStatus(`Loaded ${contacts.length} contacts from CSV`);
    };
    reader.readAsText(file);
  };

  const updateProspect = (index: number, field: keyof Prospect, value: string) => {
    setProspects(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleSendEmail = async (index: number) => {
    const prospect = prospects[index];
    if (!prospect.email || !brandKit) return;

    setSendingIndex(index);

    const fromSlug = brandKit.outreach_email || `${brandKit.business_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}@outreach.kulve.us`;

    const result = await sendOutreachEmail({
      fromName: brandKit.business_name,
      fromSlug,
      toEmail: prospect.email,
      toName: prospect.name,
      subject: prospect.emailSubject,
      body: prospect.emailBody,
    });

    setSendResults(prev => ({ ...prev, [index]: result }));
    setSendingIndex(null);

    if (result.success) {
      // Update prospect status
      setProspects(prev => prev.map((p, i) => i === index ? { ...p, status: 'sent' } : p));

      // Track in Supabase
      if (user) {
        await supabase.from('outreach_messages').insert({
          user_id: user.id,
          from_email: fromSlug,
          to_email: prospect.email,
          to_name: prospect.name,
          subject: prospect.emailSubject,
          body: prospect.emailBody,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Outreach</h1>
        <p className="text-gray-500">Find local businesses to partner with and send personalized pitches.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('prospects')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'prospects' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          AI Prospecting
        </button>
        <button
          onClick={() => setTab('my-contacts')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'my-contacts' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          My Contacts
        </button>
      </div>

      {!brandKit && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-800 font-semibold">Set up your Brand Kit first (including your address) to find local prospects.</p>
        </div>
      )}

      {/* AI PROSPECTING TAB */}
      {tab === 'prospects' && brandKit && (
        <>
          {/* Search form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Find Local Partners & Clients</h2>
            <p className="text-sm text-gray-500 -mt-2">We'll search for businesses near you that would benefit from your products/services, then write personalized pitch emails for each one.</p>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  placeholder="Pittsburgh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  placeholder="PA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
                <input
                  type="text"
                  value={searchZip}
                  onChange={(e) => setSearchZip(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  placeholder="15201"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <select
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="NL">Netherlands</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Types of businesses to find <span className="text-gray-400 font-normal">(optional — AI picks if blank)</span>
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                placeholder="e.g. wedding venues, coffee shops, restaurants (comma separated)"
              />
            </div>

            <button
              onClick={handleFindProspects}
              disabled={loading || !searchCity}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> {status || 'Searching...'}</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Find Prospects & Write Pitches</>
              )}
            </button>
          </div>

          {/* Status */}
          {status && !loading && prospects.length > 0 && (
            <div className="text-sm text-gray-500 text-center">{status}</div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">{status || 'Finding prospects...'}</p>
              <p className="text-gray-400 text-sm mt-1">Searching the web and writing personalized pitches — this takes 30-60 seconds</p>
            </div>
          )}

          {/* Prospect results */}
          {prospects.length > 0 && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{prospects.length} Prospects Found</h2>
              </div>

              {prospects.map((prospect, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  {/* Header — always visible */}
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Globe className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{prospect.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">{prospect.type}</span>
                            {prospect.address && <span className="truncate"><MapPin className="w-3 h-3 inline" /> {prospect.address}</span>}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-brand-blue font-medium mt-2 ml-[52px]">{prospect.pitchAngle}</p>
                    </div>
                    {expandedIndex === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  {/* Expanded — email preview + actions */}
                  {expandedIndex === i && (
                    <div className="border-t border-gray-100">
                      {/* Contact info */}
                      <div className="px-5 py-3 bg-gray-50 space-y-2">
                        <div className="flex flex-wrap gap-4 text-sm">
                          {prospect.phone && (
                            <span className="text-gray-600"><Phone className="w-3.5 h-3.5 inline mr-1" />{prospect.phone}</span>
                          )}
                          {prospect.website && (
                            <a href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                              <ExternalLink className="w-3.5 h-3.5 inline mr-1" />{prospect.website.replace(/^https?:\/\//, '').slice(0, 40)}
                            </a>
                          )}
                        </div>
                        {/* Email — found or manual entry */}
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {prospect.email ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700 font-medium">{prospect.email}</span>
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Found</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="email"
                                placeholder="Enter email address..."
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                onBlur={(e) => {
                                  if (e.target.value) updateProspect(i, 'email', e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    if (val) updateProspect(i, 'email', val);
                                  }
                                }}
                              />
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">Not found — enter manually</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email preview / edit */}
                      <div className="p-5 space-y-3">
                        {editingIndex === i ? (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                              <input
                                type="text"
                                value={prospect.emailSubject}
                                onChange={(e) => updateProspect(i, 'emailSubject', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Email Body</label>
                              <textarea
                                value={prospect.emailBody}
                                onChange={(e) => updateProspect(i, 'emailBody', e.target.value)}
                                rows={8}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-y"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Pitch Angle</label>
                              <input
                                type="text"
                                value={prospect.pitchAngle}
                                onChange={(e) => updateProspect(i, 'pitchAngle', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                              />
                            </div>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-blue hover:underline"
                            >
                              <Check className="w-4 h-4" /> Done Editing
                            </button>
                          </>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Preview</div>
                            <div className="text-sm font-semibold text-gray-900 mb-2">Subject: {prospect.emailSubject}</div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{prospect.emailBody}</div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2">
                        {sendResults[i]?.success ? (
                          <div className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" /> Sent
                          </div>
                        ) : sendingIndex === i ? (
                          <div className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSendEmail(i)}
                            disabled={!prospect.email || prospect.status === 'sent'}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" /> {prospect.email ? 'Send Email' : 'No Email Found'}
                          </button>
                        )}
                        {sendResults[i]?.error && (
                          <div className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {sendResults[i].error}
                          </div>
                        )}
                        <button
                          onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                          className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium border rounded-lg transition-colors ${editingIndex === i ? 'bg-brand-blue text-white border-brand-blue' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`Subject: ${prospect.emailSubject}\n\n${prospect.emailBody}`);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Mail className="w-4 h-4" /> Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {prospects.length === 0 && !loading && (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">No prospects yet</h2>
              <p className="text-gray-500 mt-2">Enter your location and click "Find Prospects" to discover local businesses to partner with.</p>
            </div>
          )}
        </>
      )}

      {/* MY CONTACTS TAB */}
      {tab === 'my-contacts' && (
        <>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Upload Your Contacts</h2>
            <p className="text-sm text-gray-500 -mt-2">Upload a CSV with your customer/contact list. Must have an "email" column. Optional: "name" and "business" columns.</p>

            <div
              onClick={() => csvInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-brand-blue/50 transition-colors cursor-pointer bg-gray-50/50"
            >
              <Upload className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-600">Click to upload CSV</p>
              <p className="text-xs text-gray-400 mt-1">Columns: name, email, business (email required)</p>
            </div>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
            />
          </div>

          {status && <div className="text-sm text-gray-500 text-center">{status}</div>}

          {csvContacts.length > 0 && (
            <div className="space-y-4">
              {/* Generate emails button */}
              {!csvContacts[0]?.generated && (
                <button
                  onClick={async () => {
                    if (!brandKit) return;
                    setGeneratingEmails(true);
                    setStatus('Writing personalized emails for your contacts...');

                    // Process in batches of 5
                    const updated = [...csvContacts];
                    for (let i = 0; i < updated.length; i += 5) {
                      const batch = updated.slice(i, i + 5);
                      const pitches = await writeOutreachEmails(brandKit, batch.map(c => ({
                        name: c.name || c.email.split('@')[0],
                        type: c.business || 'Contact',
                        contactName: c.name,
                      })));
                      pitches.forEach((pitch, j) => {
                        if (updated[i + j]) {
                          updated[i + j].emailSubject = pitch.emailSubject;
                          updated[i + j].emailBody = pitch.emailBody;
                          updated[i + j].generated = true;
                        }
                      });
                      setStatus(`Generated emails for ${Math.min(i + 5, updated.length)} of ${updated.length} contacts...`);
                    }
                    setCsvContacts(updated);
                    setStatus(`Generated personalized emails for ${updated.length} contacts`);
                    setGeneratingEmails(false);
                  }}
                  disabled={generatingEmails || !brandKit}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
                >
                  {generatingEmails ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> {status}</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate Personalized Emails for {csvContacts.length} Contacts</>
                  )}
                </button>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <span className="text-sm font-medium text-gray-600">{csvContacts.length} contacts loaded</span>
                  {csvContacts[0]?.generated && <span className="text-xs text-green-600 font-medium">Emails generated</span>}
                </div>
                <div className="divide-y divide-gray-100">
                  {csvContacts.slice(0, 20).map((contact, i) => (
                    <div key={i} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{contact.name || '—'}</span>
                          <span className="text-gray-400 mx-2">·</span>
                          <span className="text-sm text-gray-600">{contact.email}</span>
                          {contact.business && <span className="text-gray-400 mx-2">·</span>}
                          {contact.business && <span className="text-sm text-gray-500">{contact.business}</span>}
                        </div>
                        {contact.generated && contact.emailSubject && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`Subject: ${contact.emailSubject}\n\n${contact.emailBody}`);
                              }}
                              className="text-xs text-gray-400 hover:text-brand-blue transition-colors"
                            >
                              Copy Email
                            </button>
                            <button
                              onClick={async () => {
                                if (!brandKit) return;
                                const fromSlug = brandKit.outreach_email || `outreach@outreach.kulve.us`;
                                const result = await sendOutreachEmail({
                                  fromName: brandKit.business_name,
                                  fromSlug,
                                  toEmail: contact.email,
                                  toName: contact.name,
                                  subject: contact.emailSubject!,
                                  body: contact.emailBody!,
                                });
                                if (result.success) {
                                  setCsvContacts(prev => prev.map((c, idx) => idx === i ? { ...c, generated: true } : c));
                                }
                              }}
                              className="text-xs text-white bg-brand-blue px-3 py-1 rounded-md hover:bg-brand-blue/90 transition-colors"
                            >
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                      {contact.generated && contact.emailSubject && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Subject</p>
                          <p className="text-sm font-semibold text-gray-800">{contact.emailSubject}</p>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-2 mb-1">Body</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">{contact.emailBody}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {csvContacts.length > 20 && (
                  <div className="p-3 text-center text-sm text-gray-400">Showing first 20 of {csvContacts.length}</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
