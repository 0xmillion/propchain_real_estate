'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ConnectWalletButton } from 'wallet-connect-modal';
import 'wallet-connect-modal/dist/wallets/phantom/styles.css';
import 'wallet-connect-modal/dist/wallets/metamask/styles.css';
import 'wallet-connect-modal/dist/wallets/rabby/styles.css';
import 'wallet-connect-modal/dist/wallets/tronlink/styles.css';
import 'wallet-connect-modal/dist/wallets/bitget/styles.css';
import 'wallet-connect-modal/dist/wallets/coinbase/styles.css';
import 'wallet-connect-modal/dist/wallets/solflare/styles.css';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Properties', href: '/properties' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'Whitepaper', href: '/whitepaper' },
];

// Live market ticker items — distinct institutional data feel
const tickerItems = [
  { label: 'Dubai RE Index', value: '+2.4%', up: true },
  { label: 'PropChain Yield', value: '8.5% avg', up: true },
  { label: 'AED/USD', value: '3.6725', up: false },
  { label: 'Assets on Chain', value: 'AED 50M+', up: true },
  { label: 'VARA Licensed', value: '#VA-2024-001', up: null },
  { label: 'Active Investors', value: '2,400+', up: true },
  { label: 'Marina Heights', value: '8.2% yield', up: true },
  { label: 'DIFC Penthouse', value: '10.2% yield', up: true },
];

function PropChainLogo({ className }: { className?: string }) {
  return (
    <a
      href="/"
      className={cn('flex items-center gap-3 group', className)}
      aria-label="PropChain – Home"
    >
      {/* Logo mark: Geometric chain-link diamond */}
      <div className="relative w-9 h-9 flex-shrink-0">
        {/* Outer gradient ring */}
        <div
          className="absolute inset-0 rounded-lg rotate-45 transition-all duration-500 group-hover:rotate-[55deg]"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #6366f1 100%)',
            padding: '1.5px',
          }}
        >
          <div className="w-full h-full rounded-[6px] bg-obsidian-950 flex items-center justify-center -rotate-45 group-hover:-rotate-[55deg] transition-all duration-500">
            <span
              className="font-outfit font-black text-[15px] leading-none"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PC
            </span>
          </div>
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="font-outfit font-black text-lg text-white tracking-tight leading-none">
          Prop<span className="text-gradient-gold">Chain</span>
        </span>
        <span className="text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5"
          style={{ color: 'rgba(99,102,241,0.7)' }}>
          Real Estate Protocol
        </span>
      </div>
    </a>
  );
}

function MarketTicker() {
  return (
    <div
      className="w-full overflow-hidden border-b"
      style={{
        background: 'rgba(2, 6, 23, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.15)',
        backdropFilter: 'blur(12px)',
      }}
      aria-hidden="true"
    >
      <div className="flex items-center h-8">
        {/* Live label */}
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-4 h-full border-r"
          style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.08)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-400">Live</span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-6 text-[10px] font-semibold whitespace-nowrap">
                <span className="text-white/30 uppercase tracking-wider">{item.label}</span>
                <span
                  className={cn(
                    'font-bold',
                    item.up === true ? 'text-gold-400' : item.up === false ? 'text-white/60' : 'text-indigo-400'
                  )}
                >
                  {item.value}
                </span>
                {item.up === true && <TrendingUp className="w-2.5 h-2.5 text-gold-400" />}
                <span className="text-white/10 ml-4">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTicker, setShowTicker] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setShowTicker(y < 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Market Ticker Strip */}
      <AnimatePresence>
        {showTicker && (
          <motion.div
            initial={{ height: 32, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <MarketTicker />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Nav */}
      <nav
        className={cn(
          'transition-all duration-500',
          scrolled
            ? 'mx-6 my-2 rounded-2xl'
            : 'px-0'
        )}
        style={scrolled ? {
          background: 'rgba(2, 6, 23, 0.88)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.05)',
        } : {}}
        aria-label="Main navigation"
      >
        <div className={cn(
          'container-xl flex items-center justify-between transition-all duration-500',
          scrolled ? 'h-16 px-6' : 'h-20 py-4'
        )}>
          <PropChainLogo />

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative px-5 py-2 text-white/60 hover:text-white font-outfit text-sm font-medium transition-colors duration-200 group"
                >
                  {link.label}
                  {/* Underline hover effect */}
                  <span className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-gold-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <ConnectWalletButton userId="intel" />
            {/* Distinctive CTA: dual-accent gradient button */}
            <a
              href="/register"
              className="relative inline-flex items-center gap-2 px-6 py-2.5 font-outfit text-sm font-black text-obsidian-950 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 group"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F0CA2A 60%, #818cf8 100%)',
                boxShadow: '0 4px 20px rgba(212,175,55,0.3), 0 0 0 1px rgba(212,175,55,0.2)',
              }}
            >
              <span className="relative z-10">Invest Now</span>
              <ArrowUpRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              {/* Shimmer overlay */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
            </a>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white rounded-xl hover:bg-white/5 transition-colors border border-white/10"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-4 right-4 lg:hidden rounded-2xl overflow-hidden z-40"
            style={{
              background: 'rgba(4, 4, 20, 0.97)',
              backdropFilter: 'blur(32px)',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="p-5 space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between w-full p-3.5 text-white/70 hover:text-white hover:bg-indigo-500/10 rounded-xl transition-all"
                >
                  <span className="font-outfit font-semibold text-sm">{link.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-30" />
                </motion.a>
              ))}
              <div className="pt-4 mt-2 border-t border-white/5 flex flex-col gap-2.5">
                <a
                  href="/signin"
                  className="w-full py-3.5 text-center text-white/60 hover:text-white font-outfit text-sm font-semibold bg-white/5 rounded-xl border border-white/10"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="w-full py-3.5 text-center font-outfit font-black text-sm text-obsidian-950 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37, #F0CA2A 60%, #818cf8)',
                  }}
                >
                  Invest Now
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
