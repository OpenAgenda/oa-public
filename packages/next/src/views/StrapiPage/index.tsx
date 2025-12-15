import { useCallback, useState, useEffect } from 'react';
import { Noto_Sans, Ubuntu_Sans } from 'next/font/google';
import { Global } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import useUser from 'hooks/useUser';
import PageHead from 'components/strapi/PageHead';
import HighlightCardSet from 'components/strapi/HighlightCardSet';
import Navbar from 'components/Navbar';
import TabSet from 'components/strapi/TabSet';
import ReferenceSet from 'components/strapi/ReferenceSet';
import SplitHeroSegment from 'components/strapi/SplitHeroSegment';
import AutoFeaturedCardSet from 'components/strapi/AutoFeaturedCardSet';
import useCrispClient from 'hooks/useCrispClient';
import Footer from 'components/strapi/Footer';
import {
  LoggedUserWelcome,
  shouldDisplayLoggedUserWelcome,
} from 'components/strapi/LoggedUserWelcome';
import Metas from './components/Metas';
import fetchLocale from './locales';

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
});

const ubuntuSans = Ubuntu_Sans({
  variable: '--font-ubuntu',
  subsets: ['latin'],
});

export default function StrapiPage({ page, footer }) {
  const {
    title,
    description,
    Segments,
    navFontColor,
    logoVariant,
    navSticky,
    navStickyBackground,
  } = page;

  useCrispClient();
  const { user } = useUser();
  const [displayLoggedUserWelcome, setDisplayLoggedUserWelcome] =
    useState(false);

  useEffect(() => {
    setDisplayLoggedUserWelcome(shouldDisplayLoggedUserWelcome(user));
  }, [user]);

  const onCloseLoggedUserWelcome = useCallback(() => {
    setDisplayLoggedUserWelcome(false);
  }, []);

  return (
    <>
      <Metas title={title} description={description} segment={Segments?.[0]} />
      <Global
        styles={{
          html: {
            ':root': {
              '--font-noto-sans': notoSans.style.fontFamily,
              '--font-ubuntu-sans': ubuntuSans.style.fontFamily,
              background: 'white',
            },
          },
        }}
      />
      <Navbar
        discreet={!!navFontColor}
        sticky={!!navSticky}
        stickyBackground={
          navStickyBackground ? color(navStickyBackground, 500) : undefined
        }
        colorPalette={navFontColor ? color(navFontColor) : undefined}
        logoVariant={logoVariant}
      />
      {displayLoggedUserWelcome ? (
        <LoggedUserWelcome
          compressibleTop={!navSticky && !!navFontColor ? 50 : 0} // px
          top={!!navSticky ? 12 : 0}
          user={user}
          onClose={onCloseLoggedUserWelcome}
        />
      ) : null}

      {Segments.map((Segment, index) => {
        const { id } = Segment;
        const Component = {
          'segments.highlight-card-set': HighlightCardSet,
          'segments.page-head': PageHead,
          'segments.tab-set': TabSet,
          'segments.reference-set': ReferenceSet,
          'segments.auto-featured-card-set': AutoFeaturedCardSet,
          'components.split-hero': SplitHeroSegment,
        }[Segment['__component']];

        return (
          <Component
            key={id}
            {...Segment}
            additionalTopPadding={displayLoggedUserWelcome && index === 0 && 24}
          />
        );
      })}

      {footer && <Footer {...footer} />}
    </>
  );
}

StrapiPage.fetchLocale = fetchLocale;
