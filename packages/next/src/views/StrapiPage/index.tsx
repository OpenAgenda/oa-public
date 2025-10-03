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
import LoggedUserWelcome from 'components/strapi/LoggedUserWelcome';
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
    keywords,
    Segments,
    navFontColor,
    logoVariant,
    navSticky,
    navStickyBackground,
  } = page;

  useCrispClient();
  const { user } = useUser();

  return (
    <>
      <Metas title={title} description={description} keywords={keywords} />
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
      {user ? <LoggedUserWelcome top={16} user={user} /> : null}

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
            additionalTopPadding={user && index === 0 && 24}
          />
        );
      })}

      {footer && <Footer {...footer} />}
    </>
  );
}

StrapiPage.fetchLocale = fetchLocale;
