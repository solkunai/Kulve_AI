import { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Download, Edit2, Check, X, Upload, Image as ImageIcon } from 'lucide-react';
import { downloadWithWatermark } from '../../lib/watermark';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { generateFlyerContent, generateBusinessCardContent, type FlyerContent, type BusinessCardContent } from '../../lib/flyersAndCards';
import { generateImage } from '../../lib/images';
import { FLYER_TEMPLATES, CARD_TEMPLATES, type FlyerData, type CardData } from '../../components/graphics/flyerTemplates';

type Tab = 'flyers' | 'cards';
type ContentStyle = 'branded' | 'photo';

export default function FlyersAndCards() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('flyers');
  const [loading, setLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<any>(null);
  const [contentStyle, setContentStyle] = useState<ContentStyle>('branded');
  const [userPlan, setUserPlan] = useState<string | null>(null);

  // Flyer brief form
  const [flyerBrief, setFlyerBrief] = useState({
    purpose: '',
    details: '',
    offer: '',
  });

  // Card brief form
  const [cardBrief, setCardBrief] = useState({
    name: '',
    title: '',
    tagline: '',
  });

  // Flyer state
  const [flyers, setFlyers] = useState<(FlyerContent & { imageUrl?: string; templateIndex?: number })[]>([]);
  // Card state
  const [cards, setCards] = useState<(BusinessCardContent & { imageUrl?: string; templateIndex?: number })[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('brand_kits').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setBrandKit(data); });
    supabase.from('profiles').select('plan').eq('id', user.id).single()
      .then(({ data }) => { if (data?.plan) setUserPlan(data.plan); });
  }, [user]);

  const handleGenerateFlyers = async () => {
    if (!user || !brandKit) return;
    setLoading(true);
    setFlyers([]);

    // Pass brief + brand kit contact info to the AI
    const briefContext = {
      ...brandKit,
      flyer_purpose: flyerBrief.purpose,
      flyer_details: flyerBrief.details,
      flyer_offer: flyerBrief.offer,
    };
    const result = await generateFlyerContent(briefContext);
    setFlyers(result.map((f, i) => ({ ...f, templateIndex: i % FLYER_TEMPLATES.length })));

    // Fetch industry-relevant images
    result.forEach(async (flyer, idx) => {
      const imageUrl = await generateImage(flyer.imagePrompt, `${brandKit.business_name} ${brandKit.industry}`, brandKit.industry, 'landscape');
      if (imageUrl) {
        setFlyers(prev => prev.map((f, i) => i === idx ? { ...f, imageUrl } : f));
      }
    });

    setLoading(false);
  };

  const handleGenerateCards = async () => {
    if (!user || !brandKit) return;
    setLoading(true);
    setCards([]);

    const briefContext = {
      ...brandKit,
      card_name: cardBrief.name,
      card_title: cardBrief.title,
      card_tagline: cardBrief.tagline,
    };
    const result = await generateBusinessCardContent(briefContext);
    setCards(result.map((c, i) => ({ ...c, templateIndex: i % CARD_TEMPLATES.length })));

    // Fetch industry-relevant images
    result.forEach(async (card, idx) => {
      const imageUrl = await generateImage(card.imagePrompt, `${brandKit.business_name} ${brandKit.industry}`, brandKit.industry, 'landscape');
      if (imageUrl) {
        setCards(prev => prev.map((c, i) => i === idx ? { ...c, imageUrl } : c));
      }
    });

    setLoading(false);
  };

  const buildFlyerData = (flyer: FlyerContent & { imageUrl?: string }): FlyerData => ({
    headline: flyer.headline,
    offer: flyer.offer,
    offerDetails: flyer.offerDetails,
    bulletPoints: flyer.bulletPoints,
    cta: flyer.cta,
    tagline: flyer.tagline,
    address: flyer.address,
    phone: flyer.phone,
    website: flyer.website,
    hours: flyer.hours,
    logoUrl: brandKit?.logo_url || undefined,
    imageUrl: flyer.imageUrl || undefined,
    businessName: brandKit?.business_name || 'Your Business',
    brandColors: {
      primary: brandKit?.primary_color || '#3b6dca',
      secondary: brandKit?.secondary_color || '#1a1f36',
      accent: brandKit?.accent_color || '#10b981',
    },
    headingFont: brandKit?.heading_font || 'Inter',
    bodyFont: brandKit?.body_font || 'Inter',
  });

  const buildCardData = (card: BusinessCardContent & { imageUrl?: string }): CardData => ({
    name: card.name,
    title: card.title,
    tagline: card.tagline,
    phone: card.phone,
    email: card.email,
    website: card.website,
    logoUrl: brandKit?.logo_url || undefined,
    imageUrl: card.imageUrl || undefined,
    businessName: brandKit?.business_name || 'Your Business',
    brandColors: {
      primary: brandKit?.primary_color || '#3b6dca',
      secondary: brandKit?.secondary_color || '#1a1f36',
      accent: brandKit?.accent_color || '#10b981',
    },
    headingFont: brandKit?.heading_font || 'Inter',
    bodyFont: brandKit?.body_font || 'Inter',
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Flyers & Business Cards</h1>
        <p className="text-gray-500">AI-generated print materials using your brand kit.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('flyers')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'flyers' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Flyers
        </button>
        <button
          onClick={() => setTab('cards')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'cards' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Business Cards
        </button>
      </div>

      {/* Style Toggle */}
      {brandKit && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 mr-2">Style:</span>
          <button
            onClick={() => setContentStyle('branded')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${contentStyle === 'branded' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
            Branded Template
          </button>
          <button
            onClick={() => setContentStyle('photo')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${contentStyle === 'photo' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" />
            Photo Style
          </button>
        </div>
      )}

      {!brandKit && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-800 font-semibold">Set up your Brand Kit first to generate materials.</p>
        </div>
      )}

      {/* Flyer brief form */}
      {tab === 'flyers' && brandKit && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Flyer Details</h2>
          <p className="text-sm text-gray-500 -mt-2">Tell us what the flyer is for and we'll design it.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">What's the flyer for?</label>
            <select
              value={flyerBrief.purpose}
              onChange={(e) => setFlyerBrief(f => ({ ...f, purpose: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white"
            >
              <option value="">Select type...</option>
              <option value="Promotion / Discount">Promotion / Discount</option>
              <option value="Event">Event</option>
              <option value="Grand Opening">Grand Opening</option>
              <option value="Menu / Services">Menu / Services</option>
              <option value="Seasonal Special">Seasonal Special</option>
              <option value="Loyalty Program">Loyalty Program</option>
              <option value="General Info">General Info</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Key details</label>
            <textarea
              value={flyerBrief.details}
              onChange={(e) => setFlyerBrief(f => ({ ...f, details: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none"
              placeholder="e.g. Summer BBQ event on July 4th from 12-6pm. Live music, kids activities, free samples of new menu items."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Special offer <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={flyerBrief.offer}
              onChange={(e) => setFlyerBrief(f => ({ ...f, offer: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
              placeholder="e.g. 20% off with this flyer, Free appetizer, BOGO deal"
            />
          </div>

          <button
            onClick={handleGenerateFlyers}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Flyers</>
            )}
          </button>
        </div>
      )}

      {/* Business card brief form */}
      {tab === 'cards' && brandKit && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Business Card Details</h2>
          <p className="text-sm text-gray-500 -mt-2">Enter the info you want on the card. Contact details are pulled from your Brand Kit.</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name on card</label>
              <input
                type="text"
                value={cardBrief.name}
                onChange={(e) => setCardBrief(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                placeholder="e.g. John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title / Role</label>
              <input
                type="text"
                value={cardBrief.title}
                onChange={(e) => setCardBrief(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                placeholder="e.g. Owner & Head Chef"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={cardBrief.tagline}
              onChange={(e) => setCardBrief(f => ({ ...f, tagline: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
              placeholder="e.g. Handcrafted with love since 2020"
            />
          </div>

          {/* Show what contact info will be used */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Contact info from Brand Kit</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <span>{brandKit.business_phone || '⚠️ No phone — add in Brand Kit'}</span>
              <span>{brandKit.business_email || '⚠️ No email — add in Brand Kit'}</span>
              <span>{brandKit.business_website || '⚠️ No website — add in Brand Kit'}</span>
              <span>{brandKit.business_address || '⚠️ No address — add in Brand Kit'}</span>
            </div>
          </div>

          <button
            onClick={handleGenerateCards}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Business Cards</>
            )}
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Designing your {tab === 'flyers' ? 'flyers' : 'business cards'}...</p>
          <p className="text-gray-400 text-sm mt-1">This takes about 15-30 seconds</p>
        </div>
      )}

      {/* FLYERS */}
      {tab === 'flyers' && flyers.length > 0 && !loading && (
        <div className="grid md:grid-cols-2 gap-8">
          {flyers.map((flyer, i) => {
            if (contentStyle === 'photo') {
              return (
                <PhotoStyleFlyer
                  key={i}
                  flyer={flyer}
                  brandKit={brandKit}
                  userPlan={userPlan}
                  onImageUpload={(url) => setFlyers(prev => prev.map((f, idx) => idx === i ? { ...f, imageUrl: url } : f))}
                  onFieldEdit={(key, value) => setFlyers(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: value } : f))}
                />
              );
            }

            const templateFn = FLYER_TEMPLATES[flyer.templateIndex ?? 0];
            const flyerData = buildFlyerData(flyer);
            const html = templateFn(flyerData);
            const dims = { width: 792, height: 612 };
            const previewWidth = 380;
            const scale = previewWidth / dims.width;
            const previewHeight = dims.height * scale;

            return (
              <FlyerCard
                key={i}
                html={html}
                dims={dims}
                previewWidth={previewWidth}
                previewHeight={previewHeight}
                scale={scale}
                businessName={flyerData.businessName}
                format="flyer"
                onShuffle={() => {
                  setFlyers(prev => prev.map((f, idx) => idx === i ? { ...f, templateIndex: ((f.templateIndex ?? 0) + 1) % FLYER_TEMPLATES.length } : f));
                }}
                onImageUpload={(url) => {
                  setFlyers(prev => prev.map((f, idx) => idx === i ? { ...f, imageUrl: url } : f));
                }}
                editFields={[
                  { label: 'Headline', key: 'headline', value: flyer.headline },
                  { label: 'Offer', key: 'offer', value: flyer.offer },
                  { label: 'Offer Details', key: 'offerDetails', value: flyer.offerDetails },
                  { label: 'CTA Button', key: 'cta', value: flyer.cta },
                  { label: 'Tagline', key: 'tagline', value: flyer.tagline },
                  { label: 'Address', key: 'address', value: flyer.address },
                  { label: 'Phone', key: 'phone', value: flyer.phone },
                  { label: 'Website', key: 'website', value: flyer.website },
                  { label: 'Hours', key: 'hours', value: flyer.hours },
                ]}
                onFieldEdit={(key, value) => {
                  setFlyers(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: value } : f));
                }}
                userPlan={userPlan}
              />
            );
          })}
        </div>
      )}

      {/* CARDS */}
      {tab === 'cards' && cards.length > 0 && !loading && (
        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((card, i) => {
            const templateFn = CARD_TEMPLATES[card.templateIndex ?? 0];
            const cardData = buildCardData(card);
            const html = templateFn(cardData);
            const dims = { width: 630, height: 360 };
            const previewWidth = 380;
            const scale = previewWidth / dims.width;
            const previewHeight = dims.height * scale;

            return (
              <FlyerCard
                key={i}
                html={html}
                dims={dims}
                previewWidth={previewWidth}
                previewHeight={previewHeight}
                scale={scale}
                businessName={cardData.businessName}
                format="card"
                onShuffle={() => {
                  setCards(prev => prev.map((c, idx) => idx === i ? { ...c, templateIndex: ((c.templateIndex ?? 0) + 1) % CARD_TEMPLATES.length } : c));
                }}
                onImageUpload={(url) => {
                  setCards(prev => prev.map((c, idx) => idx === i ? { ...c, imageUrl: url } : c));
                }}
                editFields={[
                  { label: 'Name', key: 'name', value: card.name },
                  { label: 'Title', key: 'title', value: card.title },
                  { label: 'Tagline', key: 'tagline', value: card.tagline },
                  { label: 'Phone', key: 'phone', value: card.phone },
                  { label: 'Email', key: 'email', value: card.email },
                  { label: 'Website', key: 'website', value: card.website },
                ]}
                onFieldEdit={(key, value) => {
                  setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: value } : c));
                }}
                userPlan={userPlan}
              />
            );
          })}
        </div>
      )}

      {/* Empty states */}
      {tab === 'flyers' && flyers.length === 0 && !loading && brandKit && (
        <EmptyState type="flyers" />
      )}
      {tab === 'cards' && cards.length === 0 && !loading && brandKit && (
        <EmptyState type="business cards" />
      )}
    </div>
  );
}

// --- Sub-components ---

function FlyerCard({ html, dims, previewWidth, previewHeight, scale, businessName, format, onShuffle, onImageUpload, editFields, onFieldEdit, userPlan }: {
  html: string;
  dims: { width: number; height: number };
  previewWidth: number;
  previewHeight: number;
  scale: number;
  businessName: string;
  format: 'flyer' | 'card';
  onShuffle: () => void;
  onImageUpload?: (url: string) => void;
  editFields?: { label: string; key: string; value: string }[];
  onFieldEdit?: (key: string, value: string) => void;
  userPlan?: string | null;
}) {
  const graphicRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    const reader = new FileReader();
    reader.onload = (ev) => onImageUpload(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!graphicRef.current) return;
    setDownloading(true);
    try {
      await downloadWithWatermark(
        graphicRef.current,
        `${businessName.replace(/\s+/g, '-').toLowerCase()}-${format}-${Date.now()}.png`,
        userPlan,
        { width: dims.width, height: dims.height, pixelRatio: 1 }
      );
    } catch (err) {
      console.error('Download failed:', err);
    }
    setDownloading(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Preview */}
      <div className="relative bg-gray-50 flex items-center justify-center p-6" style={{ minHeight: previewHeight + 48 }}>
        <div style={{ width: previewWidth, height: previewHeight, overflow: 'hidden', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          <div
            style={{ width: dims.width, height: dims.height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        {/* Hidden full-size for download */}
        <div
          ref={graphicRef}
          style={{ position: 'absolute', left: '-9999px', top: 0, width: dims.width, height: dims.height }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
          {format === 'flyer' ? 'Flyer' : 'Business Card'}
        </div>
      </div>

      {/* Edit panel */}
      {editing && editFields && onFieldEdit && (
        <div className="px-4 py-4 border-t border-gray-100 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Edit Text</span>
            <button onClick={() => setEditing(false)} className="text-xs text-brand-blue font-semibold hover:underline">Done</button>
          </div>
          {editFields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
              {field.value.length > 50 ? (
                <textarea
                  value={field.value}
                  onChange={(e) => onFieldEdit(field.key, e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => onFieldEdit(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Saving...' : 'Download PNG'}
        </button>
        {editFields && (
          <button
            onClick={() => setEditing(!editing)}
            className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium border rounded-lg transition-colors ${editing ? 'bg-brand-blue text-white border-brand-blue' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        )}
        {onImageUpload && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Image
          </button>
        )}
        <button
          onClick={onShuffle}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Shuffle
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  );
}

function PhotoStyleFlyer({ flyer, brandKit, onImageUpload, onFieldEdit, userPlan }: {
  flyer: FlyerContent & { imageUrl?: string };
  brandKit: any;
  onImageUpload: (url: string) => void;
  onFieldEdit: (key: string, value: string) => void;
  userPlan?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!ref.current) return;
    setDownloading(true);
    try {
      await downloadWithWatermark(ref.current, `flyer-photo-${Date.now()}.png`, userPlan);
    } catch (err) { console.error(err); }
    setDownloading(false);
  };

  const primary = brandKit?.primary_color || '#3b6dca';
  const headingFont = brandKit?.heading_font || 'Inter';
  const bodyFont = brandKit?.body_font || 'Inter';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Photo flyer preview */}
      <div ref={ref} className="relative" style={{ width: '100%', aspectRatio: '4/3' }}>
        {/* Background photo */}
        {flyer.imageUrl ? (
          <img src={flyer.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 text-white">
          {/* Top: Logo + business name */}
          <div className="flex items-center gap-3">
            {brandKit?.logo_url && (
              <img src={brandKit.logo_url} alt="" className="w-12 h-12 object-contain rounded-lg" />
            )}
            <span className="text-lg font-bold" style={{ fontFamily: headingFont }}>{brandKit?.business_name}</span>
          </div>

          {/* Center: Headline + offer */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold leading-tight" style={{ fontFamily: headingFont }}>{flyer.headline}</h2>
            {flyer.offer && (
              <div className="inline-block px-6 py-2 rounded-lg text-lg font-bold" style={{ backgroundColor: primary }}>
                {flyer.offer}
              </div>
            )}
            {flyer.offerDetails && (
              <p className="text-white/80 text-sm max-w-md mx-auto" style={{ fontFamily: bodyFont }}>{flyer.offerDetails}</p>
            )}
          </div>

          {/* Bottom: Contact info + CTA */}
          <div className="flex items-end justify-between">
            <div className="text-xs text-white/70 space-y-0.5" style={{ fontFamily: bodyFont }}>
              {flyer.address && <p>{flyer.address}</p>}
              {flyer.phone && <p>{flyer.phone}</p>}
              {flyer.website && <p>{flyer.website}</p>}
              {flyer.hours && <p>{flyer.hours}</p>}
            </div>
            {flyer.cta && (
              <span className="px-5 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: primary, fontFamily: bodyFont }}>
                {flyer.cta}
              </span>
            )}
          </div>
        </div>

        {/* Upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="absolute top-3 right-3 p-2 bg-black/50 rounded-lg text-white/80 hover:text-white hover:bg-black/70 transition-colors z-10"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => onImageUpload(ev.target?.result as string);
          reader.readAsDataURL(file);
        }} />
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> {downloading ? 'Saving...' : 'Download PNG'}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">No {type} yet</h2>
      <p className="text-gray-500 mt-2">Click "Generate" to create {type} from your brand kit.</p>
    </div>
  );
}
