import { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Instagram, Facebook, Linkedin, Lock, Upload, Image as ImageIcon, Edit2, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { generateSocialPosts, type SocialPost } from '../../lib/content';
import { canGenerate, getPlanUpgradeMessage, type PlanType } from '../../lib/plans';
import { generateImage } from '../../lib/images';
import GraphicPreview from '../../components/graphics/GraphicPreview';
import type { GraphicFormat, TemplateStyle, GraphicData } from '../../components/graphics/templates';
import { ALL_STYLES } from '../../components/graphics/templates';

const platformIcon = (platform: string) => {
  switch (platform) {
    case 'Instagram': return Instagram;
    case 'Facebook': return Facebook;
    case 'LinkedIn': return Linkedin;
    default: return Instagram;
  }
};

const platformColor = (platform: string) => {
  switch (platform) {
    case 'Instagram': return 'bg-pink-50 text-pink-600';
    case 'Facebook': return 'bg-blue-50 text-blue-600';
    case 'LinkedIn': return 'bg-sky-50 text-sky-600';
    default: return 'bg-gray-50 text-gray-600';
  }
};

interface PostWithImage extends SocialPost {
  userImage?: string; // base64 data URL from user upload
  editingCaption?: boolean;
  editedCaption?: string;
}

export default function SocialContent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<PlanType>('free');
  const [postsGenerated, setPostsGenerated] = useState(0);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [brandKit, setBrandKit] = useState<any>(null);
  const [styleOverrides, setStyleOverrides] = useState<Record<number, number>>({});
  const [contentStyle, setContentStyle] = useState<'branded' | 'photo'>('branded');

  useEffect(() => {
    if (!user) return;

    // Get user plan
    supabase
      .from('profiles')
      .select('plan, usage_counts')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUserPlan((data.plan as PlanType) || 'free');
          setPostsGenerated(data.usage_counts?.social_posts || 0);
        }
      });

    // Get brand kit for graphic rendering
    supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setBrandKit(data);
      });

    // Load saved social posts
    supabase
      .from('generated_content')
      .select('content')
      .eq('user_id', user.id)
      .eq('type', 'social_post')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.content) {
          const saved = (data.content as any).posts;
          if (Array.isArray(saved)) setPosts(saved);
        }
      });
  }, [user]);

  const generationCheck = canGenerate(userPlan, 'social_posts', {
    marketing_plans: 0,
    graphics: 0,
    social_posts: postsGenerated,
    outreach_emails: 0,
    newsletters: 0,
    period_start: '',
  });

  const handleGenerate = async () => {
    if (!user) return;
    if (!generationCheck.allowed) return;

    setLoading(true);
    setPosts([]);

    const { data: brandKit } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!brandKit) {
      setLoading(false);
      return;
    }

    const result = await generateSocialPosts(brandKit, 6);
    setPosts(result);

    // Generate DALL-E images for each post in parallel
    const imagePromises = result.map((post) =>
      generateImage(post.imagePrompt, `${brandKit.business_name} ${brandKit.industry}`).catch(() => null)
    );

    // Update posts as images come in (don't block UI)
    imagePromises.forEach(async (promise, idx) => {
      const imageUrl = await promise;
      if (imageUrl) {
        setPosts(prev => prev.map((p, i) => i === idx ? { ...p, userImage: imageUrl } : p));
      }
    });

    // Save to database
    await supabase.from('generated_content').insert({
      user_id: user.id,
      type: 'social_post',
      title: `Social Posts — ${new Date().toLocaleDateString()}`,
      content: { posts: result },
    });

    // Increment usage count
    const newCount = postsGenerated + result.length;
    setPostsGenerated(newCount);
    await supabase
      .from('profiles')
      .update({ usage_counts: { social_posts: newCount } })
      .eq('id', user.id);

    setLoading(false);
  };

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPosts(prev => prev.map((p, i) => i === index ? { ...p, userImage: e.target?.result as string } : p));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setPosts(prev => prev.map((p, i) => i === index ? { ...p, userImage: undefined } : p));
  };

  const toggleEditCaption = (index: number) => {
    setPosts(prev => prev.map((p, i) => i === index ? {
      ...p,
      editingCaption: !p.editingCaption,
      editedCaption: p.editedCaption ?? p.caption,
    } : p));
  };

  const updateCaption = (index: number, value: string) => {
    setPosts(prev => prev.map((p, i) => i === index ? { ...p, editedCaption: value } : p));
  };

  const saveCaption = (index: number) => {
    setPosts(prev => prev.map((p, i) => i === index ? {
      ...p,
      caption: p.editedCaption || p.caption,
      editingCaption: false,
    } : p));
  };

  const copyCaption = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Content</h1>
          <p className="text-gray-500">AI-generated posts with captions ready to copy and post. <span className="text-xs text-gray-400">({postsGenerated} generated this month)</span></p>
        </div>
        {generationCheck.allowed ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Posts</>
            )}
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
            <Lock className="w-4 h-4" /> Monthly Limit Reached
          </div>
        )}
      </div>

      {!generationCheck.allowed && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <Lock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-800 font-semibold">{getPlanUpgradeMessage(userPlan, 'social posts')}</p>
        </div>
      )}

      {/* Style Toggle */}
      {posts.length > 0 && !loading && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 mr-2">Style:</span>
          <button
            onClick={() => setContentStyle('branded')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${contentStyle === 'branded' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
            Branded Graphics
          </button>
          <button
            onClick={() => setContentStyle('photo')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${contentStyle === 'photo' ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" />
            Photo + Text Overlay
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Creating your social media posts...</p>
          <p className="text-gray-400 text-sm mt-1">This takes about 15-30 seconds</p>
        </div>
      )}

      {posts.length > 0 && !loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => {
            const Icon = platformIcon(post.platform);
            const platformToFormat: Record<string, GraphicFormat> = {
              Instagram: 'instagram',
              Facebook: 'facebook',
              LinkedIn: 'facebook', // same aspect ratio
            };
            const format: GraphicFormat = platformToFormat[post.platform] || 'instagram';
            // Force each post to use a different template style, allow override via shuffle
            const styleIndex = styleOverrides[i] ?? (i % ALL_STYLES.length);
            const templateStyle: TemplateStyle = ALL_STYLES[styleIndex];

            // Build graphic data from brand kit + AI content
            const graphicData: GraphicData | null = brandKit ? {
              headline: post.headline || post.caption.split('\n')[0].slice(0, 60),
              body: post.body || '',
              cta: post.cta || '',
              logoUrl: brandKit.logo_url || undefined,
              userImageUrl: post.userImage || undefined,
              businessName: brandKit.business_name || 'Your Business',
              brandColors: {
                primary: brandKit.primary_color || '#3b6dca',
                secondary: brandKit.secondary_color || '#1a1f36',
                accent: brandKit.accent_color || '#10b981',
              },
              headingFont: brandKit.heading_font || 'Inter',
              bodyFont: brandKit.body_font || 'Inter',
            } : null;

            return (
              <div key={i}>
                {/* Platform + time header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${platformColor(post.platform)}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{post.platform}</span>
                  </div>
                  <span className="text-xs text-gray-400">{post.bestTime}</span>
                </div>

                {/* Post content — branded graphic or photo overlay */}
                {contentStyle === 'photo' ? (
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                    {/* Photo with text overlay */}
                    <div className="relative aspect-square bg-gray-900">
                      {post.userImage ? (
                        <img src={post.userImage} alt="" className="w-full h-full object-cover opacity-70" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                      )}
                      {/* Text overlay */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                        {brandKit?.logo_url && (
                          <img src={brandKit.logo_url} alt="" className="w-10 h-10 object-contain mb-3 rounded" />
                        )}
                        <h3 className="text-white font-bold text-xl leading-tight" style={{ fontFamily: brandKit?.heading_font || 'Inter' }}>
                          {post.headline || post.caption.split('\n')[0].slice(0, 60)}
                        </h3>
                        {post.body && (
                          <p className="text-white/80 text-sm mt-2" style={{ fontFamily: brandKit?.body_font || 'Inter' }}>
                            {post.body}
                          </p>
                        )}
                        {post.cta && (
                          <span
                            className="inline-block mt-3 px-4 py-1.5 rounded-lg text-sm font-semibold"
                            style={{
                              backgroundColor: brandKit?.primary_color || '#3b6dca',
                              color: '#fff',
                              fontFamily: brandKit?.body_font || 'Inter',
                              width: 'fit-content',
                            }}
                          >
                            {post.cta}
                          </span>
                        )}
                      </div>
                      {/* Upload/swap photo button */}
                      <button
                        onClick={() => fileInputRefs.current[i]?.click()}
                        className="absolute top-3 right-3 p-2 bg-black/50 rounded-lg text-white/80 hover:text-white hover:bg-black/70 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <input
                        ref={el => { fileInputRefs.current[i] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(i, file);
                        }}
                      />
                    </div>
                    {/* Caption */}
                    <div className="p-4">
                      {post.editingCaption ? (
                        <div className="space-y-2">
                          <textarea
                            value={post.editedCaption || post.caption}
                            onChange={(e) => updateCaption(i, e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none"
                          />
                          <button onClick={() => saveCaption(i)} className="text-xs text-brand-blue font-medium">Save</button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed line-clamp-4">{post.caption}</p>
                      )}
                    </div>
                    <div className="px-4 pb-3 flex items-center gap-2">
                      <button onClick={() => toggleEditCaption(i)} className="text-xs text-gray-400 hover:text-brand-blue"><Edit2 className="w-3 h-3 inline mr-1" />Edit</button>
                    </div>
                  </div>
                ) : graphicData ? (
                  <GraphicPreview
                    format={format}
                    style={templateStyle}
                    data={graphicData}
                    caption={post.caption}
                    onCaptionEdit={(newCaption) => {
                      setPosts(prev => prev.map((p, idx) => idx === i ? { ...p, caption: newCaption } : p));
                    }}
                    onImageUpload={(imageUrl) => {
                      setPosts(prev => prev.map((p, idx) => idx === i ? { ...p, userImage: imageUrl } : p));
                    }}
                    onGraphicTextEdit={(field, value) => {
                      setPosts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
                    }}
                  />
                ) : (
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden p-6">
                    <p className="text-sm text-gray-500 mb-2">Set up your Brand Kit to see branded graphics.</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.caption}</p>
                  </div>
                )}

                {/* Shuffle style + Copy caption */}
                <div className="mt-2 px-1 flex items-center justify-between">
                  <button
                    onClick={() => copyCaption(i, post.caption)}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    {copiedId === i ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Caption</>}
                  </button>
                  <button
                    onClick={() => setStyleOverrides(prev => ({
                      ...prev,
                      [i]: ((prev[i] ?? (i % ALL_STYLES.length)) + 1) % ALL_STYLES.length,
                    }))}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Shuffle Style
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {posts.length === 0 && !loading && generationCheck.allowed && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No posts yet</h2>
          <p className="text-gray-500 mt-2">Click "Generate Posts" to create social media content from your brand kit.</p>
        </div>
      )}
    </div>
  );
}
