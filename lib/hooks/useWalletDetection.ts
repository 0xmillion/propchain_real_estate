'use client';

import { useState, useEffect } from 'react';

export interface DetectedWallet {
  id: string;
  name: string;
  icon: string; // emoji fallback icon
}

/**
 * Detects installed browser crypto wallet extensions by probing
 * well-known provider flags on window.ethereum / window.solana / etc.
 *
 * Runs once on mount (client-side only) and re-checks on focus so
 * a user who installs a wallet mid-session gets updated feedback.
 */
export function useWalletDetection() {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [checked, setChecked] = useState(false);

  const detect = () => {
    if (typeof window === 'undefined') return;

    const found: DetectedWallet[] = [];

    // ── EVM wallets (window.ethereum) ─────────────────────────────────────
    const eth = (window as any).ethereum;

    if (eth) {
      // Some browsers expose multiple providers via eth.providers array
      const providers: any[] = eth.providers ?? [eth];

      for (const p of providers) {
        if (p.isMetaMask && !p.isRabby && !p.isBraveWallet) {
          if (!found.find((w) => w.id === 'metamask')) {
            found.push({ id: 'metamask', name: 'MetaMask', icon: '🦊' });
          }
        }
        if (p.isRabby) {
          if (!found.find((w) => w.id === 'rabby')) {
            found.push({ id: 'rabby', name: 'Rabby', icon: '🐇' });
          }
        }
        if (p.isCoinbaseWallet || p.isCoinbaseBrowser) {
          if (!found.find((w) => w.id === 'coinbase')) {
            found.push({ id: 'coinbase', name: 'Coinbase', icon: '🔵' });
          }
        }
        if (p.isBraveWallet) {
          if (!found.find((w) => w.id === 'brave')) {
            found.push({ id: 'brave', name: 'Brave Wallet', icon: '🦁' });
          }
        }
        if (p.isTrust || p.isTrustWallet) {
          if (!found.find((w) => w.id === 'trust')) {
            found.push({ id: 'trust', name: 'Trust Wallet', icon: '🛡️' });
          }
        }
        if (p.isOKExWallet || p.isOkxWallet) {
          if (!found.find((w) => w.id === 'okx')) {
            found.push({ id: 'okx', name: 'OKX Wallet', icon: '⭕' });
          }
        }
        if (p.isBitKeep || p.isBitgetWallet) {
          if (!found.find((w) => w.id === 'bitget')) {
            found.push({ id: 'bitget', name: 'Bitget', icon: '💎' });
          }
        }
      }
    }

    // ── Solana wallets ────────────────────────────────────────────────────
    const sol = (window as any).solana;
    if (sol) {
      if (sol.isPhantom) {
        found.push({ id: 'phantom', name: 'Phantom', icon: '👻' });
      }
      if (sol.isSolflare) {
        found.push({ id: 'solflare', name: 'Solflare', icon: '🌟' });
      }
      if (sol.isGlow) {
        found.push({ id: 'glow', name: 'Glow', icon: '✨' });
      }
    }

    // Phantom may also inject under window.phantom.solana
    const phantom = (window as any).phantom?.solana;
    if (phantom?.isPhantom && !found.find((w) => w.id === 'phantom')) {
      found.push({ id: 'phantom', name: 'Phantom', icon: '👻' });
    }

    // ── Tron wallets ─────────────────────────────────────────────────────
    // TronLink is the primary extension; it injects both window.tronLink
    // and window.tronWeb. isTronLink is the official flag since v3.22.
    const tronLink = (window as any).tronLink;
    const tronWeb  = (window as any).tronWeb;

    if (tronLink?.isTronLink || tronLink || tronWeb?.isTronLink) {
      found.push({ id: 'tronlink', name: 'TronLink', icon: '⚡' });
    }

    // TokenPocket injects window.tronWeb with a isTronLink:false but
    // exposes window.tokenpocket (covers both EVM + Tron modes).
    if ((window as any).tokenpocket && !found.find((w) => w.id === 'tokenpocket')) {
      found.push({ id: 'tokenpocket', name: 'TokenPocket', icon: '🎒' });
    }

    // OKX Wallet also supports Tron; picked up above via EVM providers
    // but if only Tron mode is active it exposes window.okxwallet.tron
    if ((window as any).okxwallet?.tron && !found.find((w) => w.id === 'okx')) {
      found.push({ id: 'okx', name: 'OKX Wallet', icon: '⭕' });
    }

    // Bitget Wallet Tron injection
    if ((window as any).bitkeep?.tron && !found.find((w) => w.id === 'bitget')) {
      found.push({ id: 'bitget', name: 'Bitget', icon: '💎' });
    }

    // ── TON wallets ───────────────────────────────────────────────────────
    // TON Connect 2.0 — wallets inject window.tonkeeper, window.mytonwallet,
    // or the generic window.ton object. The official TON Connect SDK also
    // populates window.__ton_provider once a user approves a connection,
    // but we can detect the extension presence before approval via these flags.

    // Tonkeeper Browser Extension
    if ((window as any).tonkeeper || (window as any).ton?.isTonkeeper) {
      found.push({ id: 'tonkeeper', name: 'Tonkeeper', icon: '💎' });
    }

    // MyTonWallet Extension
    if ((window as any).mytonwallet || (window as any).ton?.isMyTonWallet) {
      found.push({ id: 'mytonwallet', name: 'MyTonWallet', icon: '💠' });
    }

    // OpenMask (TON extension)
    if ((window as any).openmask || (window as any).ton?.isOpenMask) {
      found.push({ id: 'openmask', name: 'OpenMask', icon: '🔓' });
    }

    // TON Wallet (official TON Foundation extension)
    // Injects window.ton without wallet-specific flags
    if (
      (window as any).ton &&
      !found.find((w) => w.id === 'tonkeeper') &&
      !found.find((w) => w.id === 'mytonwallet') &&
      !found.find((w) => w.id === 'openmask')
    ) {
      found.push({ id: 'ton-wallet', name: 'TON Wallet', icon: '🔷' });
    }

    setWallets(found);
    setChecked(true);
  };

  useEffect(() => {
    // Short delay so wallet scripts have time to inject into window
    const timer = setTimeout(detect, 300);

    // Re-detect when the tab regains focus (user may have just installed)
    window.addEventListener('focus', detect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', detect);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { wallets, checked };
}
