'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useWalletDetection } from '@/lib/hooks/useWalletDetection';

/**
 * WalletStatusBar
 *
 * A slim status strip that shows which crypto wallet extensions are
 * installed in the user's browser. Renders nothing until detection
 * is complete (avoids SSR mismatch).
 *
 * States:
 *  • Checking  – skeleton pulse while window probing runs
 *  • No Wallet – single "No Wallet Detected" pill
 *  • Installed – one badge per detected wallet
 */
export function WalletStatusBar({ className }: { className?: string }) {
  const { wallets, checked } = useWalletDetection();

  return (
    <div
      className={cn(
        'w-full flex items-center justify-end gap-2 px-4 py-1 text-[11px] font-outfit font-semibold',
        className,
      )}
      style={{
        background: 'rgba(2, 6, 23, 0.85)',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
      }}
      aria-live="polite"
      aria-label="Wallet detection status"
    >
      {/* Left label */}
      <span className="flex items-center gap-1 text-white/30 uppercase tracking-widest text-[9px] mr-1">
        <Wallet className="w-3 h-3" />
        Browser Wallets
      </span>

      {/* Content area */}
      <AnimatePresence mode="wait">
        {!checked ? (
          /* ── Skeleton ── */
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-1.5"
          >
            {[60, 80].map((w) => (
              <span
                key={w}
                className="h-5 rounded-full animate-pulse"
                style={{
                  width: w,
                  background: 'rgba(99,102,241,0.12)',
                }}
              />
            ))}
          </motion.div>
        ) : wallets.length === 0 ? (
          /* ── No wallet ── */
          <motion.div
            key="none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border"
              style={{
                background: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.25)',
                color: 'rgba(252,165,165,0.85)',
              }}
            >
              <XCircle className="w-3 h-3" />
              No Wallet Detected
            </span>
          </motion.div>
        ) : (
          /* ── Installed wallets ── */
          <motion.div
            key="wallets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap items-center gap-1.5"
          >
            {wallets.map((wallet, i) => (
              <motion.span
                key={wallet.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border"
                style={{
                  background: 'rgba(212,175,55,0.08)',
                  borderColor: 'rgba(212,175,55,0.22)',
                  color: 'rgba(240,202,42,0.9)',
                }}
                title={`${wallet.name} is installed`}
              >
                <span role="img" aria-hidden="true" className="text-[11px]">
                  {wallet.icon}
                </span>
                <CheckCircle2
                  className="w-2.5 h-2.5 flex-shrink-0"
                  style={{ color: 'rgba(74,222,128,0.8)' }}
                />
                {wallet.name} Installed
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WalletStatusBar;
