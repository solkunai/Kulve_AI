import { motion } from 'motion/react';
import { Layout, Image as ImageIcon, Send, Printer, Globe, BarChart3, Mail, Zap } from 'lucide-react';

export default function Features() {
  const features = [
    { title: 'AI Marketing Plans', desc: 'Get a complete monthly marketing strategy tailored to your industry, audience, and goals. Updated every month automatically.', icon: Layout },
    { title: 'Branded Social Graphics', desc: 'Scroll-stopping social media posts with your brand colors, fonts, and logo baked in. Captions included and ready to post.', icon: ImageIcon },
    { title: 'Automated Outreach', desc: 'Personalized cold emails, LinkedIn messages, and DMs sent to hundreds of potential customers daily. All on autopilot.', icon: Send },
    { title: 'Flyers & Business Cards', desc: 'Professional print-ready designs generated from your brand kit. Download, print, or share digitally.', icon: Printer },
    { title: 'Website Creation', desc: 'A fully designed, mobile-responsive business website built from your brand information. Live in minutes.', icon: Globe },
    { title: 'SEO & Analytics', desc: 'Built-in search engine optimization and performance tracking. Know exactly what\'s working and what to improve.', icon: BarChart3 },
    { title: 'Email Newsletters', desc: 'Automated email campaigns and drip sequences to nurture leads and keep customers engaged.', icon: Mail },
    { title: 'Social Media Scheduling', desc: 'Connect your accounts and let Kulve post your approved content on a daily schedule.', icon: Zap },
    { title: 'Pitch Decks & Banners', desc: 'Investor-ready pitch decks and promotional banners generated from your business info and brand kit.', icon: Layout },
  ];

  return (
    <section className="pt-32 pb-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-brand-navy tracking-tight">Everything Your Business Needs to Grow</h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">One platform replaces your entire marketing stack. Graphics, outreach, websites, and more — all powered by AI and your brand kit.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-brand-blue/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-brand-blue/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <feature.icon className="w-6 h-6 text-brand-blue group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
