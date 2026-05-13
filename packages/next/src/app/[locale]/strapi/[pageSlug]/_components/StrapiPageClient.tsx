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
  variable: '--font-ubuntu-sans',
  subsets: ['latin'],
});

const STRAPI_ROOT_CSS = `:root{--font-noto-sans:${notoSans.style.fontFamily};--font-ubuntu-sans:${ubuntuSans.style.fontFamily};background:white;}`;

// Matches the navbar's row height (see `<Flex h="50px">` in Navbar/index.tsx).
// Used for the banner's sticky offset and for the first-segment padding that
// compensates for the navbar overlay.
const NAVBAR_HEIGHT_PX = 50;

// Visible gap between the navbar and the welcome banner when both are shown.
const NAVBAR_BANNER_GAP_PX = 16;

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
  const [welcomeHeight, setWelcomeHeight] = useState(0);

  useEffect(() => {
    setDisplayWelcome(shouldDisplayLoggedUserWelcome(user));
  }, [user]);

  const onCloseWelcome = useCallback(() => setDisplayWelcome(false), []);

  const { navFontColor, navSticky } = page;
  const navbarOverlays = !!navFontColor || !!navSticky;
  // The announcement is rendered inside the `<header>` (see Navbar), and
  // publishes its height in `--oa-announcement-h`. How that height affects
  // the welcome banner's offset depends on the navbar position mode:
  //
  // - sticky (navSticky=true): the `<header>` uses `mb: -50px` which exactly
  //   cancels the nav row in the flow. Siblings start at `y=H_announcement`,
  //   so the welcome's `mt` only needs `NAVBAR_HEIGHT + GAP` to clear the
  //   full header (`50 + H_ann + 16`) regardless of the announcement height.
  // - absolute (navFontColor && !navSticky): the `<header>` is out of flow
  //   entirely. Siblings start at `y=0`, so the welcome's `mt` must include
  //   the announcement height to clear the visible navbar+announcement.
  // - relative (in flow, no overlay): the `<header>` (nav row +
  //   announcement) already pushes siblings below; the welcome only needs
  //   the gap.
  const navIsAbsolute = !!navFontColor && !navSticky;
  const initialTopBase = navbarOverlays
    ? NAVBAR_HEIGHT_PX + NAVBAR_BANNER_GAP_PX
    : NAVBAR_BANNER_GAP_PX;
  const bannerInitialTop = navIsAbsolute
    ? `calc(${initialTopBase}px + var(--oa-announcement-h, 0px))`
    : initialTopBase;
  // When the navbar is sticky, the welcome stays stuck below it as the user
  // scrolls; the stuck offset must clear `nav row + announcement`. Otherwise
  // the welcome slides up to a small gap once the navbar leaves the screen.
  const bannerStuckTop = navSticky
    ? `calc(${
        NAVBAR_HEIGHT_PX + NAVBAR_BANNER_GAP_PX
      }px + var(--oa-announcement-h, 0px))`
    : `${NAVBAR_BANNER_GAP_PX}px`;

  // First-segment padding pushes the hero content below the navbar (and the
  // banner when shown), while the segment's own bg extends to y=0 — the
  // banner is an overlay (height:0) so it doesn't push the segment in flow.
  // When the navbar is absolute we must also clear the announcement height.
  const welcomePx = displayWelcome && welcomeHeight > 0 ? welcomeHeight : 0;
  const navSpacer = navIsAbsolute
    ? `calc(${initialTopBase + welcomePx}px + var(--oa-announcement-h, 0px))`
    : `${initialTopBase + welcomePx}px`;

  // `display: flow-root` establishes a BFC so the banner's `mt` (which gives
  // it its initial flow position before sliding) doesn't margin-collapse out
  // of the wrapper, which would make the banner stick immediately at scroll 0.
  const rootStyle = {
    display: 'flow-root',
    '--oa-nav-spacer': navSpacer,
  } as CSSProperties;

  return (
    <div style={rootStyle}>
      <style>{STRAPI_ROOT_CSS}</style>
      {displayWelcome ? (
        <LoggedUserWelcome
          initialTop={bannerInitialTop}
          stuckTop={bannerStuckTop}
          user={user}
          onClose={onCloseWelcome}
          onHeightChange={setWelcomeHeight}
        />
      ) : null}
      {children}
    </div>
  );
}
