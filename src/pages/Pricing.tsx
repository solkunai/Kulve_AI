import { Check } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function Pricing({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-brand-navy tracking-tight">Simple Pricing, Serious Results</h1>
          <p className="mt-6 text-xl text-gray-600">No contracts. Cancel anytime. Every plan includes your AI-powered marketing engine.</p>
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
  );
}
