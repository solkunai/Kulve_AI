import React, { useState } from 'react';
import { 
  Check, 
  ChevronDown, 
  ArrowRight, 
  Star, 
  Zap, 
  BarChart3, 
  Image as ImageIcon, 
  Send, 
  Printer, 
  Globe, 
  Search, 
  Mail, 
  Layout,
  Menu,
  X,
  Palette,
  Facebook,
  Instagram,
  Linkedin,
  Twitter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-sm',
      outline: 'border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5',
      ghost: 'text-gray-600 hover:text-brand-blue hover:bg-gray-50',
    };
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg font-bold',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-button font-semibold transition-all active:scale-[0.98] disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn('bg-white border border-gray-100 rounded-brand shadow-[0_1px_3px_rgba(0,0,0,0.08)]', className)}>
    {children}
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold text-gray-900 group-hover:text-brand-blue transition-colors">{question}</span>
        <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform duration-300', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page ---

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
              <span className="font-bold text-xl text-white">K</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-brand-navy">Kulve</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">How It Works</a>
            <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-semibold text-gray-600 hover:text-brand-blue transition-colors">Log In</button>
            <Button onClick={onLogin} size="sm">Get Started</Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 w-full bg-white border-b border-gray-100 p-4 flex flex-col gap-4 md:hidden"
            >
              <a href="#features" className="text-lg font-medium p-2">Features</a>
              <a href="#pricing" className="text-lg font-medium p-2">Pricing</a>
              <a href="#how-it-works" className="text-lg font-medium p-2">How It Works</a>
              <a href="#faq" className="text-lg font-medium p-2">FAQ</a>
              <hr />
              <Button onClick={onLogin} variant="outline">Log In</Button>
              <Button onClick={onLogin}>Get Started</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-brand-navy leading-[1.1] tracking-tight">
                Your Entire Marketing Team — <span className="text-brand-blue">Powered by AI</span>
              </h1>
              <p className="mt-8 text-xl text-gray-600 leading-relaxed max-w-xl">
                Kulve gives local businesses a complete marketing engine. Brand strategy, social media graphics, outreach campaigns, flyers, websites — all generated automatically from your brand kit. Set it up once, and let it run.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={onLogin}>Get Started Free</Button>
                <Button size="lg" variant="outline">See How It Works</Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <img 
                  src="https://picsum.photos/seed/dashboard/1200/800" 
                  alt="Kulve Dashboard Preview" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -inset-4 bg-brand-blue/5 rounded-3xl -z-10 blur-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by 500+ local businesses</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale">
            {['Bakery', 'Gym', 'Salon', 'Law Firm', 'Restaurant'].map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                <span className="font-bold text-lg">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-brand-navy tracking-tight">Up and Running in 4 Steps</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Enter Your Brand Kit', desc: 'Upload your logo, pick your colors and fonts, describe your business and ideal customer. This is the foundation Kulve uses to generate everything.', icon: Palette },
              { step: '2', title: 'AI Builds Your Materials', desc: 'Kulve instantly generates a marketing plan, social media graphics with captions, flyers, business cards, email templates, and outreach sequences — all matching your brand.', icon: Zap },
              { step: '3', title: 'Review & Approve', desc: 'Browse your generated content in the dashboard. Approve what you love, request tweaks on anything that needs adjusting. You\'re always in control.', icon: Check },
              { step: '4', title: 'Outreach Runs on Autopilot', desc: 'Kulve sends personalized emails, LinkedIn messages, and social DMs to your target audience daily. You get leads while you focus on running your business.', icon: Send },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-brand-blue text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  <item.icon className="w-6 h-6 text-brand-blue" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-brand-navy tracking-tight">Everything Your Business Needs to Grow</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'AI Marketing Plans', desc: 'Get a complete monthly marketing strategy tailored to your industry, audience, and goals. Updated every month automatically.', icon: Layout },
              { title: 'Branded Social Graphics', desc: 'Scroll-stopping social media posts with your brand colors, fonts, and logo baked in. Captions included and ready to post.', icon: ImageIcon },
              { title: 'Automated Outreach', desc: 'Personalized cold emails, LinkedIn messages, and DMs sent to hundreds of potential customers daily. All on autopilot.', icon: Send },
              { title: 'Flyers & Business Cards', desc: 'Professional print-ready designs generated from your brand kit. Download, print, or share digitally.', icon: Printer },
              { title: 'Website Creation', desc: 'A fully designed, mobile-responsive business website built from your brand information. Live in minutes.', icon: Globe },
              { title: 'SEO & Analytics', desc: 'Built-in search engine optimization and performance tracking. Know exactly what\'s working and what to improve.', icon: BarChart3 },
              { title: 'Email Newsletters', desc: 'Automated email campaigns and drip sequences to nurture leads and keep customers engaged.', icon: Mail },
              { title: 'Social Media Scheduling', desc: 'Connect your accounts and let Kulve post your approved content on a daily schedule.', icon: Zap },
              { title: 'Pitch Decks & Banners', desc: 'Investor-ready pitch decks and promotional banners generated from your business info and brand kit.', icon: Layout },
            ].map((feature, i) => (
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-brand-navy tracking-tight">Simple Pricing, Serious Results</h2>
            <p className="mt-4 text-xl text-gray-600">No contracts. Cancel anytime. Every plan includes your AI-powered marketing engine.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-end">
            {/* Starter */}
            <Card className="p-8 flex flex-col h-full">
              <h3 className="text-xl font-bold text-brand-navy">Starter</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-brand-navy">$250</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1">
                {['AI-generated marketing plan', 'Social media content strategy', '5 branded social media graphics', '500 outreach emails per month', 'Basic analytics dashboard', 'Email support'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-10 w-full" onClick={onLogin}>Get Started</Button>
            </Card>

            {/* Growth */}
            <Card className="p-8 flex flex-col h-full border-2 border-brand-blue relative shadow-xl scale-105 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-brand-navy">Growth</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-brand-navy">$500</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1">
                {['Everything in Starter, plus:', '12 branded graphics per month', 'Ready-to-post content with captions', '2 flyer designs', 'Business card design', '2,000 outreach emails per month', 'LinkedIn outreach messages', 'Newsletter templates', 'Priority support'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-10 w-full" onClick={onLogin}>Get Started</Button>
            </Card>

            {/* Scale */}
            <Card className="p-8 flex flex-col h-full">
              <h3 className="text-xl font-bold text-brand-navy">Scale</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-brand-navy">$1,500</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mt-8 space-y-4 flex-1">
                {['Everything in Growth, plus:', '30 graphics (daily content)', 'Auto-scheduled posting', 'Full website design & creation', 'Investor pitch deck', 'Promotional banners', 'Brand kit creation', '5,000+ outreach across channels', 'Dedicated account manager'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-600">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-10 w-full" onClick={onLogin}>Contact Us</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-navy tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <FAQItem 
              question="How does Kulve generate my marketing materials?" 
              answer="Kulve uses advanced AI models trained on high-performing marketing data. By analyzing your brand kit—logo, colors, fonts, and business description—it creates cohesive designs and copy that perfectly match your brand identity." 
            />
            <FAQItem 
              question="Can I edit the content before it goes out?" 
              answer="Absolutely. You have full control. Every piece of content generated sits in your dashboard for review. You can approve it as-is, request an AI revision, or manually edit any part of the design or text." 
            />
            <FAQItem 
              question="What kind of businesses is Kulvé for?"
              answer="Kulvé works for any type of business — restaurants, dental offices, law firms, gyms, salons, real estate, retail, non-profits, construction, auto shops, and more. If you have a business, Kulvé can power your entire marketing operation."
            />
            <FAQItem 
              question="How does the outreach work? Will I get flagged as spam?" 
              answer="Our outreach engine uses personalized, low-volume sending patterns that mimic human behavior. We prioritize quality over quantity, ensuring your messages land in the inbox and start real conversations." 
            />
            <FAQItem 
              question="Can I upgrade or downgrade my plan anytime?" 
              answer="Yes, you can change your plan at any time from your account settings. Changes are reflected immediately, and billing is prorated." 
            />
            <FAQItem 
              question="Do I need any design or marketing experience?" 
              answer="None at all. Kulve is designed to be your entire marketing department. If you can fill out a simple form about your business, you can run a professional-grade marketing operation." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-navy text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                  <span className="font-bold text-xl text-white">K</span>
                </div>
                <span className="text-2xl font-bold tracking-tight">Kulve</span>
              </div>
              <p className="text-gray-400 max-w-xs leading-relaxed">
                Cultivate your brand. Automate your reach. The AI-powered marketing engine for local businesses.
              </p>
              <div className="mt-8 flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-blue transition-colors"><Instagram className="w-5 h-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2026 Kulve. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Status</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
