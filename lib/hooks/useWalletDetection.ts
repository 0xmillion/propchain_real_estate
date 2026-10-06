'use client';

import { useState, useEffect } from 'react';

export interface DetectedWallet {
  id: string;
  name: string;
  icon: string;
}

// ── Wallet provider shapes ────────────────────────────────────────────────────
// These are purposely minimal — we only care about the detection flags.

interface EvmProvider {
  isMetaMask?: boolean;
  isRabby?: boolean;
  isCoinbaseWallet?: boolean;
  isCoinbaseBrowser?: boolean;
  isBraveWallet?: boolean;
  isTrust?: boolean;
  isTrustWallet?: boolean;
  isOKExWallet?: boolean;
  isOkxWallet?: boolean;
  isBitKeep?: boolean;
  isBitgetWallet?: boolean;
  providers?: EvmProvider[];
}

interface SolanaProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isGlow?: boolean;
}

interface TronLinkProvider {
  isTronLink?: boolean;
}

interface TronWebProvider {
  isTronLink?: boolean;
}

interface TonProvider {
  isTonkeeper?: boolean;
  isMyTonWallet?: boolean;
  isOpenMask?: boolean;
}

interface TokenPocketProvider {
  tron?: unknown;
}

interface OkxWalletProvider {
  tron?: unknown;
}

interface BitkeepProvider {
  tron?: unknown;
}

interface PhantomProvider {
  solana?: SolanaProvider;
}

// Augment the browser Window type so we can access wallet globals
// without any `any` casts.
interface WalletWindow extends Window {
  ethereum?: EvmProvider;
  solana?: SolanaProvider;
  phantom?: PhantomProvider;
  tronLink?: TronLinkProvider;
  tronWeb?: TronWebProvider;
  tokenpocket?: TokenPocketProvider;
  okxwallet?: OkxWalletProvider;
  bitkeep?: BitkeepProvider;
  tonkeeper?: unknown;
  mytonwallet?: unknown;
  openmask?: unknown;
  ton?: TonProvider;
}

/**
 * Detects installed browser crypto wallet extensions by probing
 * well-known provider flags on the window object.
 *
 * Runs once on mount (client-side only) and re-checks on focus so
 * a user who installs a wallet mid-session gets updated feedback.
 */
export function useWalletDetection() {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [checked, setChecked] = useState(false);

  const detect = () => {
    if (typeof window === 'undefined') return;

    const w = window as WalletWindow;
    const found: DetectedWallet[] = [];

    // ── EVM wallets (window.ethereum) ─────────────────────────────────────
    if (w.ethereum) {
      const providers: EvmProvider[] = w.ethereum.providers ?? [w.ethereum];

      for (const p of providers) {
        if (p.isMetaMask && !p.isRabby && !p.isBraveWallet) {
          if (!found.find((x) => x.id === 'metamask')) {
            found.push({ id: 'metamask', name: 'MetaMask', icon: '🦊' });
          }
        }
        if (p.isRabby) {
          if (!found.find((x) => x.id === 'rabby')) {
            found.push({ id: 'rabby', name: 'Rabby', icon: '🐇' });
          }
        }
        if (p.isCoinbaseWallet || p.isCoinbaseBrowser) {
          if (!found.find((x) => x.id === 'coinbase')) {
            found.push({ id: 'coinbase', name: 'Coinbase', icon: '🔵' });
          }
        }
        if (p.isBraveWallet) {
          if (!found.find((x) => x.id === 'brave')) {
            found.push({ id: 'brave', name: 'Brave Wallet', icon: '🦁' });
          }
        }
        if (p.isTrust || p.isTrustWallet) {
          if (!found.find((x) => x.id === 'trust')) {
            found.push({ id: 'trust', name: 'Trust Wallet', icon: '🛡️' });
          }
        }
        if (p.isOKExWallet || p.isOkxWallet) {
          if (!found.find((x) => x.id === 'okx')) {
            found.push({ id: 'okx', name: 'OKX Wallet', icon: '⭕' });
          }
        }
        if (p.isBitKeep || p.isBitgetWallet) {
          if (!found.find((x) => x.id === 'bitget')) {
            found.push({ id: 'bitget', name: 'Bitget', icon: '💎' });
          }
        }
      }
    }

    // ── Solana wallets ────────────────────────────────────────────────────
    if (w.solana) {
      if (w.solana.isPhantom) {
        found.push({ id: 'phantom', name: 'Phantom', icon: '👻' });
      }
      if (w.solana.isSolflare) {
        found.push({ id: 'solflare', name: 'Solflare', icon: '🌟' });
      }
      if (w.solana.isGlow) {
        found.push({ id: 'glow', name: 'Glow', icon: '✨' });
      }
    }

    // Phantom may also inject under window.phantom.solana
    const phantomSol = w.phantom?.solana;
    if (phantomSol?.isPhantom && !found.find((x) => x.id === 'phantom')) {
      found.push({ id: 'phantom', name: 'Phantom', icon: '👻' });
    }

    // ── Tron wallets ──────────────────────────────────────────────────────
    if (w.tronLink?.isTronLink ?? w.tronLink ?? w.tronWeb?.isTronLink) {
      found.push({ id: 'tronlink', name: 'TronLink', icon: '⚡' });
    }

    // TokenPocket (EVM + Tron)
    if (w.tokenpocket && !found.find((x) => x.id === 'tokenpocket')) {
      found.push({ id: 'tokenpocket', name: 'TokenPocket', icon: '🎒' });
    }

    // OKX Wallet — Tron-only mode
    if (w.okxwallet?.tron && !found.find((x) => x.id === 'okx')) {
      found.push({ id: 'okx', name: 'OKX Wallet', icon: '⭕' });
    }

    // Bitget Wallet — Tron-only mode
    if (w.bitkeep?.tron && !found.find((x) => x.id === 'bitget')) {
      found.push({ id: 'bitget', name: 'Bitget', icon: '💎' });
    }

    // ── TON wallets ───────────────────────────────────────────────────────
    if (w.tonkeeper || w.ton?.isTonkeeper) {
      found.push({ id: 'tonkeeper', name: 'Tonkeeper', icon: '💎' });
    }

    if (w.mytonwallet || w.ton?.isMyTonWallet) {
      found.push({ id: 'mytonwallet', name: 'MyTonWallet', icon: '💠' });
    }

    if (w.openmask || w.ton?.isOpenMask) {
      found.push({ id: 'openmask', name: 'OpenMask', icon: '🔓' });
    }

    // Generic TON Wallet fallback (official TON Foundation extension)
    if (
      w.ton &&
      !found.find((x) => x.id === 'tonkeeper') &&
      !found.find((x) => x.id === 'mytonwallet') &&
      !found.find((x) => x.id === 'openmask')
    ) {
      found.push({ id: 'ton-wallet', name: 'TON Wallet', icon: '🔷' });
    }

    setWallets(found);
    setChecked(true);
  };

  useEffect(() => {
    const timer = setTimeout(detect, 300);
    window.addEventListener('focus', detect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', detect);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { wallets, checked };
}
