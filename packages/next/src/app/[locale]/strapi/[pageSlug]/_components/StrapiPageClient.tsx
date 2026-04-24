'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { Noto_Sans, Ubuntu_Sans } from 'next/font/google';
import useUser from '@/src/hooks/useUser';
import useCrispClient from '@/src/hooks/useCrispClient';
import {
  LoggedUserWelcome,
  shouldDisplayLoggedUserWelcome,
} from '@/src/components/strapi/LoggedUserWelcome';
import type { StrapiPageData } from '@/src/components/strapi/types';

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
});

const ubuntuSans = Ubuntu_Sans({
  variable: '--font-ubuntu',
  subsets: ['latin'],
});

const STRAPI_ROOT_CSS = `:root{--font-noto-sans:${notoSans.style.fontFamily};--font-ubuntu-sans:${ubuntuSans.style.fontFamily};background:white;}`;

interface StrapiPageClientProps {
  page: Pick<StrapiPageData, 'navFontColor' | 'navSticky'>;
  children: React.ReactNode;
}

export default function StrapiPageClient({
  page,
  children,
}: StrapiPageClientProps) {
  useCrispClient();
  const { user } = useUser();
  const [displayWelcome, setDisplayWelcome] = useState(false);

  useEffect(() => {
    setDisplayWelcome(shouldDisplayLoggedUserWelcome(user));
  }, [user]);

  const onCloseWelcome = useCallback(() => setDisplayWelcome(false), []);

  const { navFontColor, navSticky } = page;

  // Drives the spacer on the first segment via SegmentContainer's
  // `additionalTopPadding` CSS var, so server-rendered segments don't need
  // to know about the (client-only) welcome banner state.
  const welcomeSpacerStyle = {
    '--oa-welcome-spacer': displayWelcome ? '24px' : '0px',
  } as CSSProperties;

  return (
    <div style={welcomeSpacerStyle}>
      <style>{STRAPI_ROOT_CSS}</style>
      {displayWelcome ? (
        <LoggedUserWelcome
          compressibleTop={!navSticky && !!navFontColor ? 50 : 0}
          top={navSticky ? 12 : 0}
          user={user}
          onClose={onCloseWelcome}
        />
      ) : null}
      {children}
    </div>
  );
}
