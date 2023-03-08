import { NextRequest, NextResponse } from 'next/server';
import getPreferredLocale from 'utils/getPreferredLocale';
import getSession from 'utils/getSession';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'config/constants';

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
  const userLocale = getSession(req.cookies)?.user?.culture;
  const nextLocale = req.nextUrl.locale;
  const qsLocale = req.nextUrl.searchParams.get('lang');

  const defaultLocale = userLocale || DEFAULT_LOCALE;

  const locale = getPreferredLocale(qsLocale, nextLocale, userLocale);

  if (nextLocale === 'default' && locale !== defaultLocale && SUPPORTED_LOCALES.includes(locale)) {
    if (qsLocale === locale) {
      req.nextUrl.searchParams.delete('lang');
    }

    return NextResponse.redirect(
      new URL(`/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url),
    );
  }
}
