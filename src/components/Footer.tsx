import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram } from 'lucide-react';
import { KulveLogo } from './KulveLogo';

const C = { ink: '#0A0E1A' };

export function Footer() {
  return (
    <footer className="pt-16 pb-10 px-6 md:px-14" style={{ background: C.ink, color: 'white' }}>
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/">
              <KulveLogo theme="dark" size={28} />
            </Link>
            <p className="mt-5 max-w-xs leading-relaxed text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Turn your business into a brand. Outreach, content, voice, scheduling, billing — all on one platform.
            </p>
            <div className="mt-7 flex gap-3">
              {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm">Platform</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm">Company</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div
          className="pt-7 flex flex-col md:flex-row justify-between items-center gap-3 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
        >
          <p>© 2026 Kulvé. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Status</a>
            <a href="#" className="hover:text-white transition-colors">Changelog</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
