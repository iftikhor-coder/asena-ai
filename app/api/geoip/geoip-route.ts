import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '8.8.8.8';

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,query`);
    const geo = await res.json();

    return NextResponse.json({
      country:     geo.country     || null,
      countryCode: geo.countryCode || null,
      ip:          geo.query       || ip,
    });
  } catch {
    return NextResponse.json({ country: null, countryCode: null, ip: null });
  }
}
