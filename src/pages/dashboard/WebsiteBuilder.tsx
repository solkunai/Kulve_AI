import { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Download, Edit2, Check, Globe, Upload, ExternalLink, Copy, ChevronLeft, ChevronRight, Settings, Type, Palette } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { generateWebsiteCopy, type WebsiteContent } from '../../lib/content';
import { generateImage } from '../../lib/images';
import { WEBSITE_TEMPLATES, getTemplatesForIndustry } from '../../components/website/websiteTemplates';
import FontPicker from '../../components/FontPicker';
import ColorPicker from '../../components/ColorPicker';

export default function WebsiteBuilder() {
  const { user } = useAuth();
  const [brandKit, setBrandKit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [aboutImage, setAboutImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);

  const [brief, setBrief] = useState({ services: '', hours: '', specialFeatures: '' });
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  // Design overrides — these override brand kit values for the website only
  const [overrides, setOverrides] = useState({
    primaryColor: '',
    secondaryColor: '',
    accentColor: '',
    headingFont: '',
    bodyFont: '',
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('brand_kits').select('*').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setBrandKit(data);
          if (data.business_hours) setBrief(b => ({ ...b, hours: data.business_hours }));
        }
      });
    supabase.from('generated_content').select('content').eq('user_id', user.id).eq('type', 'website_copy').order('created_at', { ascending: false }).limit(1).single()
      .then(({ data }) => {
        if (data?.content) {
          const saved = (data.content as any);
          if (saved.website) setContent(saved.website);
          if (saved.heroImage) setHeroImage(saved.heroImage);
          if (saved.aboutImage) setAboutImage(saved.aboutImage);
          if (saved.templateIndex !== undefined) setTemplateIndex(saved.templateIndex);
        }
      });
  }, [user]);

  const handleGenerate = async () => {
    if (!user || !brandKit) return;
    setLoading(true);
    setContent(null);
    const result = await generateWebsiteCopy(brandKit, brief);
    if (result) {
      setContent(result);
      generateImage(`${brandKit.industry} business hero`, brandKit.business_name, brandKit.industry, 'landscape')
        .then(url => { if (url) setHeroImage(url); });
      generateImage(`${brandKit.industry} team office`, brandKit.business_name, brandKit.industry, 'landscape')
        .then(url => { if (url) setAboutImage(url); });
      await supabase.from('generated_content').insert({
        user_id: user.id, type: 'website_copy',
        title: `Website — ${new Date().toLocaleDateString()}`,
        content: { website: result, templateIndex },
      });
    }
    setLoading(false);
  };

  const updateContent = (path: string, value: any) => {
    if (!content) return;
    setContent(prev => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj: any = copy;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleImageUpload = (target: 'hero' | 'about', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (target === 'hero') setHeroImage(ev.target?.result as string);
      else setAboutImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const copyHtml = () => {
    if (!previewRef.current) return;
    navigator.clipboard.writeText(previewRef.current.innerHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    if (!previewRef.current || !brandKit) return;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${brandKit.business_name}</title><link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(brandKit.heading_font)}:wght@300;400;600;700;800;900&family=${encodeURIComponent(brandKit.body_font)}:wght@300;400;500;600&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;}</style></head><body>${previewRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${brandKit.business_name.replace(/\s+/g, '-').toLowerCase()}-website.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const bk = brandKit;
  const primary = overrides.primaryColor || bk?.primary_color || '#3b6dca';
  const secondary = overrides.secondaryColor || bk?.secondary_color || '#1a1f36';
  const accent = overrides.accentColor || bk?.accent_color || '#10b981';
  const headingFont = overrides.headingFont || bk?.heading_font || 'Inter';
  const bodyFont = overrides.bodyFont || bk?.body_font || 'Inter';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website Builder</h1>
        <p className="text-gray-500">AI-generated business website using your brand kit. Included with Scale plan.</p>
      </div>

      {!brandKit && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-800 font-semibold">Set up your Brand Kit first to generate a website.</p>
        </div>
      )}

      {brandKit && !content && !loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Website Brief</h2>
          <p className="text-sm text-gray-500 -mt-2">Tell us about your business and we'll build your website.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Services / Products you offer</label>
            <textarea value={brief.services} onChange={(e) => setBrief(b => ({ ...b, services: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none" placeholder="e.g. Teeth whitening, root canals, Invisalign, pediatric dentistry" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Hours</label>
            <input type="text" value={brief.hours} onChange={(e) => setBrief(b => ({ ...b, hours: e.target.value }))} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="e.g. Mon-Fri 9am-6pm, Sat 10am-2pm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Anything special to highlight? <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={brief.specialFeatures} onChange={(e) => setBrief(b => ({ ...b, specialFeatures: e.target.value }))} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="e.g. Free parking, same-day appointments, 20 years experience" />
          </div>
          <button onClick={handleGenerate} disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> Generate Website
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Building your website...</p>
          <p className="text-gray-400 text-sm mt-1">This takes about 20-30 seconds</p>
        </div>
      )}

      {content && !loading && (() => {
        const availableTemplates = getTemplatesForIndustry(bk?.industry);
        const safeIndex = templateIndex % availableTemplates.length;
        const currentTemplate = availableTemplates[safeIndex];
        return (
        <div className="space-y-4">
          {/* Template picker */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableTemplates.map((t, i) => (
                <button key={t.id} onClick={() => setTemplateIndex(i)} className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${i === safeIndex ? 'bg-brand-blue text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  {t.name}
                  {t.category === 'industry' && <span className="ml-1 opacity-50">&#8226;</span>}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{currentTemplate?.description}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setTemplateIndex(i => (i - 1 + availableTemplates.length) % availableTemplates.length)} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <div className="text-center min-w-48">
                <span className="text-sm font-semibold text-gray-900">{currentTemplate?.name}</span>
                <span className="text-xs text-gray-400 ml-2">{safeIndex + 1} / {availableTemplates.length}</span>
              </div>
              <button onClick={() => setTemplateIndex(i => (i + 1) % availableTemplates.length)} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(!editing)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm border rounded-lg transition-colors ${editing ? 'bg-brand-blue text-white border-brand-blue' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}><Edit2 className="w-4 h-4" /> {editing ? 'Done' : 'Content'}</button>
              <button onClick={() => setShowDesignPanel(!showDesignPanel)} className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm border rounded-lg transition-colors ${showDesignPanel ? 'bg-brand-blue text-white border-brand-blue' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}><Palette className="w-4 h-4" /> Design</button>
              <button onClick={copyHtml} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">{copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy HTML</>}</button>
              <button onClick={downloadHtml} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90"><Download className="w-4 h-4" /> Download</button>
              <button onClick={handleGenerate} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"><RefreshCw className="w-4 h-4" /> Regenerate</button>
            </div>
          </div>

          {/* Edit panel */}
          {editing && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Edit Content</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Hero Headline</label><input value={content.hero.headline} onChange={(e) => updateContent('hero.headline', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Hero Subheadline</label><input value={content.hero.subheadline} onChange={(e) => updateContent('hero.subheadline', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Hero CTA</label><input value={content.hero.cta} onChange={(e) => updateContent('hero.cta', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Contact CTA</label><input value={content.contact.cta} onChange={(e) => updateContent('contact.cta', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => heroInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"><Upload className="w-3 h-3" /> Hero Image</button>
                <button onClick={() => aboutInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"><Upload className="w-3 h-3" /> About Image</button>
                <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('hero', e)} />
                <input ref={aboutInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('about', e)} />
              </div>
            </div>
          )}

          {/* Design Panel */}
          {showDesignPanel && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Customize Design</h3>
                <button onClick={() => setOverrides({ primaryColor: '', secondaryColor: '', accentColor: '', headingFont: '', bodyFont: '' })} className="text-xs text-gray-400 hover:text-brand-blue">Reset to Brand Kit</button>
              </div>

              {/* Colors */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Colors</h4>
                <div className="grid grid-cols-3 gap-4">
                  <ColorPicker label="Primary" value={primary} onChange={(c) => setOverrides(o => ({ ...o, primaryColor: c }))} />
                  <ColorPicker label="Secondary" value={secondary} onChange={(c) => setOverrides(o => ({ ...o, secondaryColor: c }))} />
                  <ColorPicker label="Accent" value={accent} onChange={(c) => setOverrides(o => ({ ...o, accentColor: c }))} />
                </div>
                <div className="flex h-6 rounded-lg overflow-hidden mt-3">
                  <div style={{ background: primary, flex: 1 }} />
                  <div style={{ background: secondary, flex: 1 }} />
                  <div style={{ background: accent, flex: 1 }} />
                </div>
              </div>

              {/* Fonts */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Typography</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FontPicker label="Heading Font" value={headingFont} onChange={(f) => setOverrides(o => ({ ...o, headingFont: f }))} />
                  <FontPicker label="Body Font" value={bodyFont} onChange={(f) => setOverrides(o => ({ ...o, bodyFont: f }))} />
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p style={{ fontFamily: `'${headingFont}', sans-serif`, fontSize: 18, fontWeight: 700, color: secondary }}>Heading Preview</p>
                  <p style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 13, color: '#666', marginTop: 4 }}>Body text preview — this is how your website will look.</p>
                </div>
              </div>
            </div>
          )}

          {/* Website Preview */}
          <div className="bg-gray-200 rounded-2xl p-4">
            <div className="bg-gray-100 rounded-t-lg px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-gray-400 flex items-center gap-1">
                <Globe className="w-3 h-3" /> {bk?.business_website || `${bk?.business_name?.toLowerCase().replace(/\s+/g, '')}.kulve.us`}
              </div>
            </div>
            <div ref={previewRef} style={{ background: '#fff', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
              {currentTemplate?.render(content, { primary, secondary, accent, headingFont, bodyFont, heroImage, aboutImage, brandKit: bk })}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
