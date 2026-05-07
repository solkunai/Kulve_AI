import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { KulveLogo } from './KulveLogo';

// Direction A · Bold Statement palette
const C = {
  ink: '#0A0E1A',
  text: '#0F1729',
  muted: '#525C6E',
  border: '#E4E7EC',
  paper: '#FFFFFF',
};

export function Nav({ onLogin }: { onLogin: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Send users to the homepage hero waitlist field. If already on /, scroll to top.
  const goToWaitlist = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="sticky top-0 z-50" style={{ background: C.paper }}>
      {/* Utility bar */}
      <div
        className="hidden md:flex justify-between items-center text-xs"
        style={{ background: C.ink, color: '#C8CEDC', padding: '7px 56px' }}
      >
        <span>Now in private beta · invitations sent weekly</span>
        <div className="flex gap-[18px]">
          <a href="#" className="hover:text-white transition-colors">Status</a>
          <a href="#" className="hover:text-white transition-colors">Changelog</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
        </div>
      </div>

      {/* Nav row */}
      <header
        className="flex items-center justify-between px-6 md:px-14 py-4"
        style={{ borderBottom: `1px solid ${C.border}`, background: C.paper }}
      >
        <div className="flex items-center gap-9">
          <Link to="/">
            <KulveLogo />
          </Link>
          <nav className="hidden lg:flex gap-6 text-sm font-medium" style={{ color: C.muted }}>
            <Link to="/features" className="hover:text-gray-900 transition-colors">Platform</Link>
            <Link to="/how-it-works" className="hover:text-gray-900 transition-colors">Solutions</Link>
            <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link to="/faq" className="hover:text-gray-900 transition-colors">Customers</Link>
            <a href="#" className="hover:text-gray-900 transition-colors">Docs</a>
          </nav>
        </div>

        <div className="hidden md:flex gap-2.5 items-center">
          <button
            onClick={onLogin}
            className="px-3.5 py-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: C.text }}
          >
            Sign in
          </button>
          <button
            onClick={goToWaitlist}
            className="px-4 py-2 text-sm font-semibold rounded-md transition-opacity hover:opacity-90"
            style={{ background: C.ink, color: 'white' }}
          >
            Join the waitlist →
          </button>
        </div>

        <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden border-b p-4 flex flex-col gap-3"
            style={{ borderColor: C.border, background: C.paper }}
          >
            <Link to="/features" className="text-base font-medium p-2" onClick={() => setIsMenuOpen(false)}>Platform</Link>
            <Link to="/how-it-works" className="text-base font-medium p-2" onClick={() => setIsMenuOpen(false)}>Solutions</Link>
            <Link to="/pricing" className="text-base font-medium p-2" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
            <Link to="/faq" className="text-base font-medium p-2" onClick={() => setIsMenuOpen(false)}>Customers</Link>
            <hr style={{ borderColor: C.border }} />
            <button
              onClick={() => { setIsMenuOpen(false); onLogin(); }}
              className="px-4 py-2.5 rounded-md text-sm font-medium border"
              style={{ borderColor: C.border, color: C.text }}
            >
              Sign in
            </button>
            <button
              onClick={() => { setIsMenuOpen(false); goToWaitlist(); }}
              className="px-4 py-2.5 rounded-md text-sm font-semibold"
              style={{ background: C.ink, color: 'white' }}
            >
              Join the waitlist →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
