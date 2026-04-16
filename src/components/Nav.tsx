import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from './Button';

export function Nav({ onLogin }: { onLogin: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
            <span className="font-bold text-xl text-white">K</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-navy">Kulve</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/features" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">Features</Link>
          <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">Pricing</Link>
          <Link to="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">How It Works</Link>
          <Link to="/faq" className="text-sm font-medium text-gray-600 hover:text-brand-blue transition-colors">FAQ</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={onLogin} className="text-sm font-semibold text-gray-600 hover:text-brand-blue transition-colors">Log In</button>
          <Button onClick={onLogin} size="sm">Get Started</Button>
        </div>

        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 w-full bg-white border-b border-gray-100 p-4 flex flex-col gap-4 md:hidden"
          >
            <Link to="/features" className="text-lg font-medium p-2" onClick={() => setIsMenuOpen(false)}>Features</Link>
            <Link to="/pricing" className="text-lg font-medium p-2" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
            <Link to="/how-it-works" className="text-lg font-medium p-2" onClick={() => setIsMenuOpen(false)}>How It Works</Link>
            <Link to="/faq" className="text-lg font-medium p-2" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
            <hr />
            <Button onClick={onLogin} variant="outline">Log In</Button>
            <Button onClick={onLogin}>Get Started</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
