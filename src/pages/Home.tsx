import { motion } from 'motion/react';
import { Button } from '../components/Button';

export default function Home({ onLogin }: { onLogin: () => void }) {
  return (
    <>
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
                <Button size="lg" variant="outline" onClick={() => window.location.href = '/how-it-works'}>See How It Works</Button>
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
    </>
  );
}
