import { NextRequest, NextResponse } from 'next/server';
import getPreferredLocale from 'utils/getPreferredLocale';
import { DEFAULT_LOCALE } from 'config/constants';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith('/_next')
    || req.nextUrl.pathname.includes('/api/')
    || PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return;
  }

  // req.cookies.get('NEXT_LOCALE');
  const nextLocale = req.nextUrl.locale;
  const qsLocale = req.nextUrl.searchParams.get('lang');

  const locale = getPreferredLocale(req.nextUrl.locale, req.nextUrl.searchParams.get('lang'));

  if (nextLocale === 'default' && locale !== DEFAULT_LOCALE) {
    if (qsLocale === locale) {
      req.nextUrl.searchParams.delete('lang');
    }

    return NextResponse.redirect(
      new URL(`/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url),
    );
  }
}
