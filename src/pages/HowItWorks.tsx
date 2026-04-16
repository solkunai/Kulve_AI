import { motion } from 'motion/react';
import { Palette, Zap, Check, Send } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { step: '1', title: 'Enter Your Brand Kit', desc: 'Upload your logo, pick your colors and fonts, describe your business and ideal customer. This is the foundation Kulve uses to generate everything.', icon: Palette },
    { step: '2', title: 'AI Builds Your Materials', desc: 'Kulve instantly generates a marketing plan, social media graphics with captions, flyers, business cards, email templates, and outreach sequences — all matching your brand.', icon: Zap },
    { step: '3', title: 'Review & Approve', desc: 'Browse your generated content in the dashboard. Approve what you love, request tweaks on anything that needs adjusting. You\'re always in control.', icon: Check },
    { step: '4', title: 'Outreach Runs on Autopilot', desc: 'Kulve sends personalized emails, LinkedIn messages, and social DMs to your target audience daily. You get leads while you focus on running your business.', icon: Send },
  ];

  return (
    <section className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-brand-navy tracking-tight">Up and Running in 4 Steps</h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">From brand kit to full marketing autopilot in minutes — no design skills or marketing experience needed.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, i) => (
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
  );
}
