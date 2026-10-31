'use client';

import { useEffect } from 'react';
import { useWalletDetection } from './useWalletDetection';

// ── Minimal inline UA parser — no extra dependency needed ─────────────────────

function getBrowser(ua: string): { name: string; version: string } {
  const tests: [RegExp, string][] = [
    [/Edg\/([0-9.]+)/, 'Edge'],
    [/OPR\/([0-9.]+)/, 'Opera'],
    [/Opera\/([0-9.]+)/, 'Opera'],
    [/SamsungBrowser\/([0-9.]+)/, 'Samsung Browser'],
    [/UCBrowser\/([0-9.]+)/, 'UC Browser'],
    [/YaBrowser\/([0-9.]+)/, 'Yandex'],
    [/Firefox\/([0-9.]+)/, 'Firefox'],
    [/CriOS\/([0-9.]+)/, 'Chrome iOS'],
    [/FxiOS\/([0-9.]+)/, 'Firefox iOS'],
    [/Chrome\/([0-9.]+)/, 'Chrome'],
    [/Safari\/([0-9.]+)/, 'Safari'],
  ];

  for (const [regex, name] of tests) {
    const match = ua.match(regex);
    if (match) return { name, version: match[1].split('.')[0] };
  }
  return { name: 'Unknown', version: '' };
}

function getOS(ua: string): string {
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
  if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1';
  if (/Windows NT 6\.1/.test(ua)) return 'Windows 7';
  if (/Windows/.test(ua)) return 'Windows';
  if (/iPhone OS/.test(ua)) return `iOS ${ua.match(/iPhone OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.') ?? ''}`;
  if (/iPad/.test(ua)) return `iPadOS ${ua.match(/CPU OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.') ?? ''}`;
  if (/Android ([0-9.]+)/.test(ua)) return `Android ${ua.match(/Android ([0-9.]+)/)?.[1] ?? ''}`;
  if (/Mac OS X ([0-9_]+)/.test(ua)) return `macOS ${ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.') ?? ''}`;
  if (/Linux/.test(ua)) return 'Linux';
  if (/CrOS/.test(ua)) return 'ChromeOS';
  return 'Unknown';
}

function getDeviceType(ua: string): { type: string; vendor: string } {
  if (/iPad/.test(ua)) return { type: 'tablet', vendor: 'Apple' };
  if (/iPhone/.test(ua)) return { type: 'mobile', vendor: 'Apple' };
  if (/Samsung|SM-[A-Z]/.test(ua)) return { type: 'mobile', vendor: 'Samsung' };
  if (/Pixel/.test(ua)) return { type: 'mobile', vendor: 'Google' };
  if (/Huawei|HiSilicon/.test(ua)) return { type: 'mobile', vendor: 'Huawei' };
  if (/Xiaomi|MIUI/.test(ua)) return { type: 'mobile', vendor: 'Xiaomi' };
  if (/OnePlus/.test(ua)) return { type: 'mobile', vendor: 'OnePlus' };
  if (/Android/.test(ua)) return { type: 'mobile', vendor: 'Android' };
  if (/Mobi|Mobile/.test(ua)) return { type: 'mobile', vendor: '' };
  if (/Tablet/.test(ua)) return { type: 'tablet', vendor: '' };
  return { type: 'desktop', vendor: '' };
}

// ── Session-guard key ─────────────────────────────────────────────────────────
const SESSION_KEY = 'pc_visitor_tracked';

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Fires once per browser session (guarded by sessionStorage).
 * Waits for wallet detection to settle (300 ms + 400 ms grace),
 * then POSTs browser/device/wallet data to /api/track which
 * appends the server-side IP & country and forwards to Telegram.
 */
export function useVisitorTracking() {
  const { wallets, checked } = useWalletDetection();

  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;

    // One notification per browser session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Wait until wallet detection has finished, then give an extra
    // 400 ms grace period in case a wallet provider registers late.
    if (!checked) return;

    const timer = setTimeout(async () => {
      // Double-check — another effect run may have fired in the meantime
      if (sessionStorage.getItem(SESSION_KEY)) return;

      const ua = navigator.userAgent;
      const browser = getBrowser(ua);
      const os = getOS(ua);
      const device = getDeviceType(ua);

      const payload = {
        browser: browser.name,
        browserVersion: browser.version,
        os,
        deviceType: device.type,
        deviceVendor: device.vendor,
        screenResolution: `${window.screen.width}×${window.screen.height}`,
        language: navigator.language || 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
        page: window.location.href,
        referrer: document.referrer,
        wallets: wallets.map((w) => w.name),
        walletCount: wallets.length,
        timestamp: new Date().toUTCString(),
      };

      try {
        const res = await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          // Mark as sent so we don't fire again this session
          sessionStorage.setItem(SESSION_KEY, '1');
        }
      } catch {
        // Silent fail — never surface tracking errors to the user
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [checked, wallets]);
}
