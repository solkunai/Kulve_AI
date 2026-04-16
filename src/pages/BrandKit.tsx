import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { generateOutreachEmail } from '../lib/outreach';
import { Upload, X } from 'lucide-react';
import FontPicker from '../components/FontPicker';
import ColorPicker from '../components/ColorPicker';
import { analyzeBrandKitFile } from '../lib/brandAnalyzer';

const FONT_OPTIONS = [
  'Inter', 'Poppins', 'Playfair Display', 'Montserrat', 'Roboto', 'Lato', 'Open Sans', 'Raleway',
  'Merriweather', 'Oswald', 'Nunito', 'Bebas Neue', 'DM Sans', 'Space Grotesk', 'Outfit',
  'Archivo', 'Cabin', 'Cormorant Garamond', 'Crimson Text', 'Dancing Script', 'Fira Sans',
  'Josefin Sans', 'Karla', 'Libre Baskerville', 'Manrope', 'Mulish', 'Noto Sans', 'PT Sans',
  'Quicksand', 'Source Sans 3', 'Work Sans', 'Rubik', 'Sora', 'Urbanist', 'Barlow',
  'Custom (enter below)',
];
const INDUSTRY_OPTIONS = ['Restaurant', 'Bakery', 'Salon', 'Gym', 'Law Firm', 'Real Estate', 'Dentist', 'Auto Shop', 'Retail', 'Other'];

export default function BrandKit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const brandKitInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMessage, setAnalyzeMessage] = useState('');

  const [form, setForm] = useState({
    business_name: '',
    industry: '',
    description: '',
    target_customer: '',
    tone_of_voice: 'Professional',
    primary_color: '#3b6dca',
    secondary_color: '#1a1f36',
    accent_color: '#10b981',
    heading_font: 'Inter',
    body_font: 'Inter',
    social_instagram: '',
    social_facebook: '',
    social_linkedin: '',
    social_x: '',
    social_tiktok: '',
    // Contact Info
    business_address: '',
    business_city: '',
    business_state: '',
    business_zip: '',
    business_country: 'US',
    business_phone: '',
    business_email: '',
    business_website: '',
    business_hours: '',
    // Marketing Preferences
    main_goal: '',
    unique_selling_point: '',
    platforms: [] as string[],
    posting_frequency: 'Daily',
    upcoming_events: '',
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            business_name: data.business_name || '',
            industry: data.industry || '',
            description: data.description || '',
            target_customer: data.target_customer || '',
            tone_of_voice: data.tone_of_voice || 'Professional',
            primary_color: data.primary_color || '#3b6dca',
            secondary_color: data.secondary_color || '#1a1f36',
            accent_color: data.accent_color || '#10b981',
            heading_font: data.heading_font || 'Inter',
            body_font: data.body_font || 'Inter',
            social_instagram: data.social_instagram || '',
            social_facebook: data.social_facebook || '',
            social_linkedin: data.social_linkedin || '',
            social_x: data.social_x || '',
            social_tiktok: data.social_tiktok || '',
            business_address: data.business_address || '',
            business_city: data.business_city || '',
            business_state: data.business_state || '',
            business_zip: data.business_zip || '',
            business_country: data.business_country || 'US',
            business_phone: data.business_phone || '',
            business_email: data.business_email || '',
            business_website: data.business_website || '',
            business_hours: data.business_hours || '',
            main_goal: data.main_goal || '',
            unique_selling_point: data.unique_selling_point || '',
            platforms: data.platforms || [],
            posting_frequency: data.posting_frequency || 'Daily',
            upcoming_events: data.upcoming_events || '',
          });
          if (data.logo_url) setLogoPreview(data.logo_url);
        }
        setLoading(false);
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSaving(true);

    const { data: existing } = await supabase
      .from('brand_kits')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const payload: Record<string, any> = { ...form, user_id: user.id, updated_at: new Date().toISOString() };

    // Upload logo if a new file was selected
    if (logoFile) {
      const ext = logoFile.name.split('.').pop();
      const path = `${user.id}/logo.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, logoFile, { upsert: true });

      if (uploadError) {
        setError('Failed to upload logo: ' + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
      payload.logo_url = urlData.publicUrl;
      setLogoPreview(urlData.publicUrl);
    }

    // Auto-assign outreach email for new brand kits
    if (!existing) {
      payload.outreach_email = await generateOutreachEmail(form.business_name);
    }

    const { error } = existing
      ? await supabase.from('brand_kits').update(payload).eq('id', existing.id)
      : await supabase.from('brand_kits').insert(payload);

    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    setSaving(false);
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };
  const togglePlatform = (platform: string) => setForm((f) => ({
    ...f,
    platforms: f.platforms.includes(platform)
      ? f.platforms.filter((p) => p !== platform)
      : [...f.platforms, platform],
  }));

  const handleBrandKitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setAnalyzeMessage(`Analyzing ${file.name}...`);

    try {
      const result = await analyzeBrandKitFile(file);

      // Auto-fill form with extracted data
      setForm(f => ({
        ...f,
        ...(result.primary_color && { primary_color: result.primary_color }),
        ...(result.secondary_color && { secondary_color: result.secondary_color }),
        ...(result.accent_color && { accent_color: result.accent_color }),
        ...(result.heading_font && { heading_font: result.heading_font }),
        ...(result.body_font && { body_font: result.body_font }),
        ...(result.tone_of_voice && { tone_of_voice: result.tone_of_voice }),
        ...(result.business_name && !f.business_name && { business_name: result.business_name }),
        ...(result.industry && !f.industry && { industry: result.industry }),
        ...(result.description && !f.description && { description: result.description }),
        ...(result.target_customer && !f.target_customer && { target_customer: result.target_customer }),
      }));

      // If it's an image, also set it as a potential logo
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
        setLogoFile(file);
      }

      const fieldsFound = [
        result.primary_color && 'colors',
        result.heading_font && 'fonts',
        result.business_name && 'business name',
        result.tone_of_voice && 'tone',
      ].filter(Boolean);

      setAnalyzeMessage(fieldsFound.length > 0
        ? `Extracted: ${fieldsFound.join(', ')}. Review and adjust below.`
        : 'File analyzed but no brand data could be extracted. Try a different file or enter manually.');
    } catch {
      setAnalyzeMessage('Could not analyze file. Try a different format.');
    }

    setAnalyzing(false);
    if (brandKitInputRef.current) brandKitInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">Your Brand Kit</h1>
        <p className="text-gray-600 mb-8">This is the foundation Kulve uses to generate all your marketing materials.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          {/* Upload Existing Brand Kit */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-bold text-brand-navy">Upload Existing Brand Kit</h2>
            <p className="text-sm text-gray-500 -mt-2">Have a brand kit already? Upload it and we'll extract your colors, fonts, and brand info automatically.</p>

            <div
              onClick={() => brandKitInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-blue/50 hover:bg-brand-blue/5 transition-all"
            >
              {analyzing ? (
                <>
                  <div className="w-10 h-10 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mb-3"></div>
                  <p className="text-sm font-medium text-gray-600">{analyzeMessage}</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700">Click to upload your brand kit</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG, or HTML — we'll extract colors, fonts, and more</p>
                </>
              )}
            </div>
            <input
              ref={brandKitInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.html,.htm"
              className="hidden"
              onChange={handleBrandKitUpload}
            />

            {analyzeMessage && !analyzing && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {analyzeMessage}
              </div>
            )}
          </section>

          {/* Logo Upload */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-brand-navy">Logo</h2>
            <div>
              {logoPreview ? (
                <div className="relative inline-block">
                  <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-brand-blue/50 transition-colors cursor-pointer bg-gray-50/50"
                >
                  <Upload className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Click to upload your logo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, SVG or JPG up to 5MB</p>
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoSelect}
              />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-brand-navy">Business Info</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
              <input type="text" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="Joe's Bakery" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
              <select value={form.industry} onChange={(e) => update('industry', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white">
                <option value="">Select industry...</option>
                {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Description</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} required rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none" placeholder="We're a family-owned bakery specializing in artisan sourdough and custom cakes..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Customer</label>
              <textarea value={form.target_customer} onChange={(e) => update('target_customer', e.target.value)} required rows={2} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none" placeholder="Health-conscious families in the Austin area, ages 25-45..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone of Voice</label>
              <select value={form.tone_of_voice} onChange={(e) => update('tone_of_voice', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white">
                {['Professional', 'Friendly', 'Bold', 'Playful', 'Luxury', 'Casual'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </section>

          {/* Brand Colors */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-brand-navy">Brand Colors</h2>
            <div className="grid grid-cols-3 gap-4">
              <ColorPicker label="Primary" value={form.primary_color as string} onChange={(c) => update('primary_color', c)} />
              <ColorPicker label="Secondary" value={form.secondary_color as string} onChange={(c) => update('secondary_color', c)} />
              <ColorPicker label="Accent" value={form.accent_color as string} onChange={(c) => update('accent_color', c)} />
            </div>
            {/* Color preview strip */}
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div style={{ background: form.primary_color as string, flex: 1 }} />
              <div style={{ background: form.secondary_color as string, flex: 1 }} />
              <div style={{ background: form.accent_color as string, flex: 1 }} />
            </div>
          </section>

          {/* Fonts */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-brand-navy">Fonts</h2>
            <p className="text-sm text-gray-500 -mt-3">Search from 200+ Google Fonts. Fonts load automatically.</p>
            <div className="grid grid-cols-2 gap-4">
              <FontPicker label="Heading Font" value={form.heading_font} onChange={(f) => update('heading_font', f)} />
              <FontPicker label="Body Font" value={form.body_font} onChange={(f) => update('body_font', f)} />
            </div>
            {/* Font preview */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p style={{ fontFamily: `'${form.heading_font}', sans-serif`, fontSize: 22, fontWeight: 700, color: form.secondary_color as string }}>
                The quick brown fox jumps
              </p>
              <p style={{ fontFamily: `'${form.body_font}', sans-serif`, fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                Over the lazy dog. This is how your body text will look across your marketing materials, website, and all generated content.
              </p>
            </div>
          </section>

          {/* Contact Info */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-brand-navy">Contact Info</h2>
            <p className="text-sm text-gray-500 -mt-2">Used on flyers, business cards, and newsletters.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
              <input type="text" value={form.business_address} onChange={(e) => update('business_address', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="123 Main Street" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input type="text" value={form.business_city} onChange={(e) => update('business_city', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="Pittsburgh" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input type="text" value={form.business_state} onChange={(e) => update('business_state', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="PA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
                <input type="text" value={form.business_zip} onChange={(e) => update('business_zip', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="15201" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <select value={form.business_country} onChange={(e) => update('business_country', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input type="tel" value={form.business_phone} onChange={(e) => update('business_phone', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={form.business_email} onChange={(e) => update('business_email', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="hello@yourbusiness.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input type="text" value={form.business_website} onChange={(e) => update('business_website', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="www.yourbusiness.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Hours</label>
                <input type="text" value={form.business_hours} onChange={(e) => update('business_hours', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder="Mon-Fri 7am-6pm | Sat 8am-4pm" />
              </div>
            </div>
          </section>

          {/* Marketing Preferences */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-brand-navy">Marketing Preferences</h2>
            <p className="text-sm text-gray-500 -mt-2">Help us generate better content by telling us about your goals.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">What's your main goal?</label>
              <select value={form.main_goal} onChange={(e) => update('main_goal', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white">
                <option value="">Select a goal...</option>
                <option value="More customers">Get more customers</option>
                <option value="Brand awareness">Build brand awareness</option>
                <option value="Event promotion">Promote an event or launch</option>
                <option value="Retain customers">Retain existing customers</option>
                <option value="Online presence">Build online presence</option>
                <option value="Lead generation">Generate leads</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">What makes you different?</label>
              <textarea value={form.unique_selling_point} onChange={(e) => update('unique_selling_point', e.target.value)} required rows={2} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none" placeholder="We're the only bakery in town that uses 100% organic ingredients and offers same-day custom orders..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Which platforms matter most?</label>
              <div className="flex flex-wrap gap-2">
                {['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X (Twitter)', 'Email'].map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.platforms.includes(platform)
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue/50'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">How often do you want to post?</label>
              <select value={form.posting_frequency} onChange={(e) => update('posting_frequency', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white">
                <option value="Daily">Daily</option>
                <option value="3-5x per week">3-5x per week</option>
                <option value="1-2x per week">1-2x per week</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Anything coming up? <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={form.upcoming_events} onChange={(e) => update('upcoming_events', e.target.value)} rows={2} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none" placeholder="Grand opening next month, seasonal sale in June, new menu launching..." />
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-brand-navy">Social Links</h2>
            {[
              { label: 'Instagram', field: 'social_instagram', placeholder: 'https://instagram.com/yourbusiness' },
              { label: 'Facebook', field: 'social_facebook', placeholder: 'https://facebook.com/yourbusiness' },
              { label: 'LinkedIn', field: 'social_linkedin', placeholder: 'https://linkedin.com/company/yourbusiness' },
              { label: 'X (Twitter)', field: 'social_x', placeholder: 'https://x.com/yourbusiness' },
              { label: 'TikTok', field: 'social_tiktok', placeholder: 'https://tiktok.com/@yourbusiness' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input type="url" value={form[field as keyof typeof form]} onChange={(e) => update(field, e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none" placeholder={placeholder} />
              </div>
            ))}
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Brand Kit'}
          </Button>
        </form>
      </div>
    </div>
  );
}
