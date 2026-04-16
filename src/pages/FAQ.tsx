import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../lib/utils';

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

export default function FAQ() {
  return (
    <section className="pt-32 pb-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-brand-navy tracking-tight">Frequently Asked Questions</h1>
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
            question="What kind of businesses is Kulve for?"
            answer="Kulve is built specifically for local businesses like bakeries, gyms, law firms, salons, and restaurants. It's designed to handle the marketing needs of businesses that serve a specific geographic community."
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
  );
}
