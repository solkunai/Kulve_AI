import { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Mail, Download, Edit2 } from 'lucide-react';
import { downloadWithWatermark } from '../../lib/watermark';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { generateNewsletter } from '../../lib/content';
import { generateImage } from '../../lib/images';

export default function NewsletterContent() {
  const { user } = useAuth();
  const [newsletter, setNewsletter] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefForm, setBriefForm] = useState({
    occasion: '',
    details: '',
    offer: '',
    extras: '',
  });
  const [copied, setCopied] = useState(false);
  const [brandKit, setBrandKit] = useState<any>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [savedNewsletters, setSavedNewsletters] = useState<{ id: string; title: string; content: string; created_at: string }[]>([]);
  const emailRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [editingNewsletter, setEditingNewsletter] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [templateStyle, setTemplateStyle] = useState<'classic' | 'modern' | 'minimal' | 'bold' | 'magazine' | 'luxury'>('classic');

  useEffect(() => {
    if (!user) return;

    supabase.from('profiles').select('plan').eq('id', user.id).single()
      .then(({ data }) => { if (data?.plan) setUserPlan(data.plan); });

    supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setBrandKit(data);
      });

    supabase
      .from('generated_content')
      .select('id, title, content, created_at')
      .eq('user_id', user.id)
      .eq('type', 'newsletter')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setSavedNewsletters(data.map(d => ({ ...d, content: (d.content as any).text || '' })));
      });
  }, [user]);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    setNewsletter('');
    setHeaderImage(null);

    const { data: bk } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!bk) {
      setNewsletter('Please set up your brand kit first.');
      setLoading(false);
      return;
    }

    // Build a detailed brief from the form
    const brief = [
      briefForm.occasion && `This newsletter is about: ${briefForm.occasion}`,
      briefForm.details && `Key details to include: ${briefForm.details}`,
      briefForm.offer && `Special offer/promotion: ${briefForm.offer}`,
      briefForm.extras && `Also mention: ${briefForm.extras}`,
    ].filter(Boolean).join('. ') || undefined;

    const result = await generateNewsletter(bk, brief);
    setNewsletter(result);

    // Fetch a header image
    const imgQuery = briefForm.occasion || briefForm.details || bk.industry || 'business newsletter';
    generateImage(imgQuery, `${bk.business_name} ${bk.industry}`, bk.industry, 'landscape').then(url => {
      if (url) setHeaderImage(url);
    });

    const title = `Newsletter${briefForm.occasion ? ` — ${briefForm.occasion}` : ''} — ${new Date().toLocaleDateString()}`;
    await supabase.from('generated_content').insert({
      user_id: user.id,
      type: 'newsletter',
      title,
      content: { text: result },
    });

    setSavedNewsletters(prev => [{ id: crypto.randomUUID(), title, content: result, created_at: new Date().toISOString() }, ...prev]);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newsletter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyHtml = () => {
    if (!emailRef.current) return;
    navigator.clipboard.writeText(emailRef.current.innerHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async () => {
    if (!emailRef.current) return;
    try {
      await downloadWithWatermark(emailRef.current, `newsletter-${Date.now()}.png`, userPlan);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setHeaderImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const parsed = parseNewsletter(newsletter);
  const bk = brandKit;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletters</h1>
          <p className="text-gray-500">AI-generated email newsletters styled with your brand.</p>
        </div>
      </div>

      {/* Newsletter brief form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-gray-900">Newsletter Brief</h2>
        <p className="text-sm text-gray-500 -mt-2">Tell us what this newsletter is about and we'll write it for you.</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">What's the occasion?</label>
          <select
            value={briefForm.occasion}
            onChange={(e) => setBriefForm(f => ({ ...f, occasion: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white"
          >
            <option value="">Select type...</option>
            <option value="Promotion / Sale">Promotion / Sale</option>
            <option value="Event">Event</option>
            <option value="Announcement">Announcement</option>
            <option value="Monthly Update">Monthly Update</option>
            <option value="Holiday Special">Holiday Special</option>
            <option value="New Product / Service">New Product / Service</option>
            <option value="Customer Appreciation">Customer Appreciation</option>
            <option value="Tips & Education">Tips & Education</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Key details to include</label>
          <textarea
            value={briefForm.details}
            onChange={(e) => setBriefForm(f => ({ ...f, details: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none"
            placeholder="e.g. Summer fundraiser on June 15th from 6-9pm at Lincoln Park. Live music, croissant bar, $20 entry fee. All proceeds go to local food bank."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Special offer or promotion <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            value={briefForm.offer}
            onChange={(e) => setBriefForm(f => ({ ...f, offer: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
            placeholder="e.g. 15% off with code SUMMER, Early bird tickets $15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Anything else to mention? <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            value={briefForm.extras}
            onChange={(e) => setBriefForm(f => ({ ...f, extras: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
            placeholder="e.g. New hours starting next week, hiring for summer, parking info"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !brandKit}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Newsletter</>
          )}
        </button>
      </div>

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Writing your newsletter...</p>
          <p className="text-gray-400 text-sm mt-1">This takes about 15-30 seconds</p>
        </div>
      )}

      {newsletter && !loading && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Newsletter Preview</span>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
              </button>
              <button onClick={copyHtml} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="w-4 h-4" /> Copy HTML
              </button>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4" /> {headerImage ? 'Swap Image' : 'Upload Image'}
              </button>
              <button
                onClick={() => setEditingNewsletter(!editingNewsletter)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm border rounded-lg transition-colors ${editingNewsletter ? 'bg-brand-blue text-white border-brand-blue' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                <Edit2 className="w-4 h-4" /> {editingNewsletter ? 'Done' : 'Edit'}
              </button>
              <button onClick={downloadImage} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors">
                <Download className="w-4 h-4" /> Download PNG
              </button>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Edit panel */}
          {editingNewsletter && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Edit Newsletter Content</span>
                <span className="text-xs text-gray-400">Markdown supported (# headings, **bold**, - bullets)</span>
              </div>
              <textarea
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                rows={16}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm font-mono focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-y"
              />
            </div>
          )}

          {/* Template selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600 mr-1">Template:</span>
            {([
              { id: 'classic', label: 'Classic' },
              { id: 'modern', label: 'Modern' },
              { id: 'minimal', label: 'Minimal' },
              { id: 'bold', label: 'Bold' },
              { id: 'magazine', label: 'Magazine' },
              { id: 'luxury', label: 'Luxury' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTemplateStyle(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${templateStyle === t.id ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Email preview */}
          <div className="bg-gray-100 rounded-2xl p-8 flex justify-center">
            <div ref={emailRef} style={{ width: 600, fontFamily: `'${bk?.body_font || 'Inter'}', sans-serif`, backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
              {renderNewsletterTemplate(templateStyle, { parsed, bk, headerImage, markdownToHtml })}
            </div>
          </div>
        </div>
      )}

      {/* Previous newsletters */}
      {savedNewsletters.length > 0 && !loading && !newsletter && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Previous Newsletters</h2>
          {savedNewsletters.map((saved) => (
            <button
              key={saved.id}
              onClick={() => setNewsletter(saved.content)}
              className="w-full text-left bg-white border border-gray-100 rounded-xl p-5 hover:border-brand-blue/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{saved.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(saved.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty + no brand kit */}
      {!brandKit && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-800 font-semibold">Set up your Brand Kit first to generate newsletters.</p>
        </div>
      )}
    </div>
  );
}

// --- Helpers ---

interface ParsedNewsletter {
  subject: string;
  body: string;
  cta: string;
}

function parseNewsletter(raw: string): ParsedNewsletter {
  let subject = '';
  let cta = '';
  let body = raw;

  // Try to extract subject line
  const subjectMatch = raw.match(/\*\*Subject(?:\s*Line)?[:\s]*\*\*\s*(.+)/i) || raw.match(/^#\s*(.+)/m);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
    body = body.replace(subjectMatch[0], '');
  }

  // Try to extract CTA
  const ctaMatch = raw.match(/\*\*CTA[:\s]*\*\*\s*(.+)/i) || raw.match(/\[(.+?)\]\(.*?\)/);
  if (ctaMatch) {
    cta = ctaMatch[1].trim();
    body = body.replace(ctaMatch[0], '');
  }

  // Clean up preview text line
  body = body.replace(/\*\*Preview(?:\s*Text)?[:\s]*\*\*\s*.+/i, '');

  return { subject, body: body.trim(), cta };
}

interface TemplateProps {
  parsed: ParsedNewsletter;
  bk: any;
  headerImage: string | null;
  markdownToHtml: (md: string) => string;
}

function renderNewsletterTemplate(style: string, { parsed, bk, headerImage, markdownToHtml }: TemplateProps) {
  const primary = bk?.primary_color || '#3b6dca';
  const secondary = bk?.secondary_color || '#1a1f36';
  const accent = bk?.accent_color || '#10b981';
  const name = bk?.business_name || 'Your Business';
  const logo = bk?.logo_url;
  const headingFont = bk?.heading_font || 'Inter';
  const bodyFont = bk?.body_font || 'Inter';

  const imgBlock = headerImage
    ? <div style={{ width: '100%', height: 220, overflow: 'hidden' }}><img src={headerImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /></div>
    : <div style={{ width: '100%', height: 220, background: secondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 64, fontWeight: 900, fontFamily: headingFont }}>{name.charAt(0)}</span></div>;

  const ctaBtn = (bg: string, color: string = '#fff', radius: number = 8) => parsed.cta ? (
    <div style={{ padding: '0 32px 32px', textAlign: 'center' as const }}>
      <div style={{ display: 'inline-block', background: bg, color, padding: '14px 40px', borderRadius: radius, fontSize: 15, fontWeight: 800, letterSpacing: 0.5, fontFamily: bodyFont }}>{parsed.cta}</div>
    </div>
  ) : null;

  const footer = (bg: string, textColor: string = 'rgba(255,255,255,0.6)') => (
    <div style={{ background: bg, padding: '20px 32px', textAlign: 'center' as const }}>
      <div style={{ color: textColor, fontSize: 12, fontFamily: bodyFont }}>{name}</div>
      <div style={{ color: textColor, opacity: 0.5, fontSize: 10, marginTop: 4, fontFamily: bodyFont }}>You received this because you subscribed. Unsubscribe anytime.</div>
    </div>
  );

  switch (style) {
    // CLASSIC — colored header bar, image, body, CTA, dark footer
    case 'classic':
      return <>
        <div style={{ background: primary, padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {logo && <img src={logo} style={{ width: 36, height: 36, objectFit: 'contain' as const, borderRadius: 6 }} />}
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, fontFamily: headingFont }}>{name}</span>
        </div>
        {imgBlock}
        <div style={{ padding: '32px 32px 24px' }}>
          {parsed.subject && <div style={{ fontSize: 11, color: primary, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 2, marginBottom: 8, fontFamily: bodyFont }}>{parsed.subject}</div>}
          <div style={{ fontSize: 15, lineHeight: 1.7, color: '#333', fontFamily: bodyFont }} dangerouslySetInnerHTML={{ __html: markdownToHtml(parsed.body) }} />
        </div>
        {ctaBtn(accent)}
        {footer(secondary)}
      </>;

    // MODERN — full-width image hero with overlay text, clean body
    case 'modern':
      return <>
        <div style={{ position: 'relative', width: '100%', height: 280, overflow: 'hidden' }}>
          {headerImage ? <img src={headerImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /> : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end', padding: 32 }}>
            {logo && <img src={logo} style={{ width: 40, height: 40, objectFit: 'contain' as const, borderRadius: 8, marginBottom: 12 }} />}
            <div style={{ color: '#fff', fontSize: 24, fontWeight: 800, lineHeight: 1.3, fontFamily: headingFont }}>{parsed.subject || name}</div>
          </div>
        </div>
        <div style={{ padding: '32px 32px 24px' }}>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: '#444', fontFamily: bodyFont }} dangerouslySetInnerHTML={{ __html: markdownToHtml(parsed.body) }} />
        </div>
        {ctaBtn(primary, '#fff', 50)}
        {footer('#f8f9fa', '#999')}
      </>;

    // MINIMAL — no image, lots of whitespace, understated elegance
    case 'minimal':
      return <>
        <div style={{ padding: '40px 40px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          {logo && <img src={logo} style={{ width: 28, height: 28, objectFit: 'contain' as const, borderRadius: 4 }} />}
          <span style={{ fontSize: 14, fontWeight: 600, color: '#999', fontFamily: bodyFont }}>{name}</span>
        </div>
        <div style={{ padding: '32px 40px 8px' }}>
          {parsed.subject && <div style={{ fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1.3, marginBottom: 24, fontFamily: headingFont }}>{parsed.subject}</div>}
          <div style={{ width: 40, height: 3, background: primary, marginBottom: 24, borderRadius: 2 }} />
          <div style={{ fontSize: 15, lineHeight: 1.9, color: '#555', fontFamily: bodyFont }} dangerouslySetInnerHTML={{ __html: markdownToHtml(parsed.body) }} />
        </div>
        {parsed.cta && (
          <div style={{ padding: '16px 40px 40px' }}>
            <div style={{ display: 'inline-block', border: `2px solid ${primary}`, color: primary, padding: '12px 32px', borderRadius: 4, fontSize: 14, fontWeight: 700, fontFamily: bodyFont }}>{parsed.cta}</div>
          </div>
        )}
        <div style={{ padding: '20px 40px', borderTop: '1px solid #eee' }}>
          <div style={{ color: '#bbb', fontSize: 11, fontFamily: bodyFont }}>{name} · Unsubscribe</div>
        </div>
      </>;

    // BOLD — dark background, bright accents, strong typography
    case 'bold':
      return <>
        <div style={{ background: secondary, padding: '32px', textAlign: 'center' as const }}>
          {logo && <img src={logo} style={{ width: 48, height: 48, objectFit: 'contain' as const, borderRadius: 8, margin: '0 auto 16px' }} />}
          {parsed.subject && <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.2, fontFamily: headingFont }}>{parsed.subject}</div>}
          {parsed.subject && <div style={{ width: 60, height: 4, background: accent, margin: '16px auto 0', borderRadius: 2 }} />}
        </div>
        {imgBlock}
        <div style={{ background: '#fff', padding: '32px 32px 24px' }}>
          <div style={{ fontSize: 15, lineHeight: 1.7, color: '#333', fontFamily: bodyFont }} dangerouslySetInnerHTML={{ __html: markdownToHtml(parsed.body) }} />
        </div>
        {ctaBtn(accent, '#fff', 4)}
        {footer(secondary)}
      </>;

    // MAGAZINE — side-by-side image + text, editorial feel
    case 'magazine':
      return <>
        <div style={{ background: '#fff', padding: '24px 32px', borderBottom: `3px solid ${primary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {logo && <img src={logo} style={{ width: 32, height: 32, objectFit: 'contain' as const, borderRadius: 4 }} />}
            <span style={{ fontSize: 16, fontWeight: 800, color: secondary, fontFamily: headingFont }}>{name}</span>
          </div>
          {parsed.subject && <span style={{ fontSize: 11, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 2, fontFamily: bodyFont }}>{parsed.subject}</span>}
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '45%', minHeight: 300, overflow: 'hidden' }}>
            {headerImage ? <img src={headerImage} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} /> : <div style={{ width: '100%', height: '100%', background: `linear-gradient(180deg, ${primary}22, ${primary}44)` }} />}
          </div>
          <div style={{ width: '55%', padding: '32px 28px' }}>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: '#444', fontFamily: bodyFont }} dangerouslySetInnerHTML={{ __html: markdownToHtml(parsed.body) }} />
            {parsed.cta && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'inline-block', background: primary, color: '#fff', padding: '10px 28px', borderRadius: 4, fontSize: 13, fontWeight: 700, fontFamily: bodyFont }}>{parsed.cta}</div>
              </div>
            )}
          </div>
        </div>
        {footer('#f8f9fa', '#999')}
      </>;

    // LUXURY — Warm off-white, light weight heading, text links, no buttons
    case 'luxury':
      return <>
        <div style={{ padding: '40px 0 32px', textAlign: 'center' as const }}>
          {logo && <img src={logo} style={{ width: 80, height: 'auto', maxHeight: 60, objectFit: 'contain' as const, margin: '0 auto 24px' }} />}
          <div style={{ width: 40, height: 1, background: '#D4C5B9', margin: '0 auto' }} />
        </div>
        {headerImage && (
          <div style={{ padding: '0 40px', marginBottom: 32 }}>
            <img src={headerImage} style={{ width: '100%', height: 240, objectFit: 'cover' as const, borderRadius: 4 }} />
          </div>
        )}
        <div style={{ padding: '0 60px 8px' }}>
          {parsed.subject && <div style={{ fontSize: 26, fontWeight: 300, color: '#2C2C2C', lineHeight: 1.4, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 24, textAlign: 'center' as const, fontFamily: headingFont }}>{parsed.subject}</div>}
          <div style={{ width: 40, height: 3, background: primary, margin: '0 auto 24px', borderRadius: 2 }} />
          <div style={{ fontSize: 14, lineHeight: 1.9, color: '#666', letterSpacing: 0.3, fontFamily: bodyFont }} dangerouslySetInnerHTML={{ __html: markdownToHtml(parsed.body) }} />
        </div>
        {parsed.cta && (
          <div style={{ padding: '16px 60px 40px', textAlign: 'center' as const }}>
            <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: 3, color: '#2C2C2C', borderBottom: '1px solid #2C2C2C', paddingBottom: 2, fontFamily: bodyFont }}>{parsed.cta}</span>
          </div>
        )}
        <div style={{ padding: '20px 60px', borderTop: '1px solid #eee' }}>
          <div style={{ color: '#AAA', fontSize: 11, textAlign: 'center' as const, fontFamily: bodyFont }}>{name} · Unsubscribe</div>
        </div>
      </>;

    default:
      return null;
  }
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gm, '<h3 style="font-size:18px;font-weight:700;margin:20px 0 8px;color:#1a1f36;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size:22px;font-weight:800;margin:24px 0 10px;color:#1a1f36;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-size:28px;font-weight:900;margin:0 0 16px;color:#1a1f36;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li style="margin:4px 0;padding-left:8px;">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="padding-left:16px;margin:12px 0;">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin:12px 0;">')
    .replace(/\n/g, '<br>');
}
