import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface TrackPayload {
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: string;
  deviceVendor: string;
  screenResolution: string;
  language: string;
  timezone: string;
  page: string;
  referrer: string;
  wallets: string[];
  walletCount: number;
  timestamp: string;
}

function formatMessage(payload: TrackPayload, ip: string, country: string, region: string): string {
  const walletStatus =
    payload.walletCount > 0
      ? `✅ ${payload.wallets.join(', ')} (${payload.walletCount})`
      : '❌ No wallet detected';

  const deviceIcon =
    payload.deviceType === 'mobile'
      ? '📱'
      : payload.deviceType === 'tablet'
        ? '📟'
        : '🖥️';

  return [
    `🌐 <b>New Visitor — PropChain</b>`,
    ``,
    `${deviceIcon} <b>Device</b>: ${payload.deviceType} ${payload.deviceVendor ? `(${payload.deviceVendor})` : ''}`.trim(),
    `🖥 <b>OS</b>: ${payload.os}`,
    `🌍 <b>Browser</b>: ${payload.browser} ${payload.browserVersion}`,
    ``,
    `📍 <b>IP</b>: <code>${ip}</code>`,
    `🗺 <b>Country</b>: ${country || 'Unknown'}`,
    `📌 <b>Region</b>: ${region || 'Unknown'}`,
    ``,
    `🌐 <b>Language</b>: ${payload.language}`,
    `🕐 <b>Timezone</b>: ${payload.timezone}`,
    `📐 <b>Screen</b>: ${payload.screenResolution}`,
    ``,
    `👛 <b>Wallet</b>: ${walletStatus}`,
    ``,
    `🔗 <b>Page</b>: ${payload.page}`,
    `↩️ <b>Referrer</b>: ${payload.referrer || 'Direct'}`,
    ``,
    `🕰 <b>Time</b>: ${payload.timestamp}`,
  ].join('\n');
}

export async function POST(req: NextRequest) {
  try {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ ok: false, error: 'Telegram not configured' }, { status: 500 });
    }

    const payload: TrackPayload = await req.json();

    // Extract IP from headers (Vercel / Cloudflare / Nginx proxies)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.headers.get('x-real-ip') ?? 'Unknown');

    // Country / region — injected by Vercel Edge or Cloudflare
    const country =
      req.headers.get('x-vercel-ip-country') ??
      req.headers.get('cf-ipcountry') ??
      req.headers.get('x-country') ??
      '';
    const region =
      req.headers.get('x-vercel-ip-country-region') ??
      req.headers.get('x-region') ??
      '';

    const text = formatMessage(payload, ip, country, region);

    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      },
    );

    if (!tgRes.ok) {
      const err = await tgRes.text();
      console.error('[track] Telegram error:', err);
      return NextResponse.json({ ok: false, error: err }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[track] Unexpected error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
