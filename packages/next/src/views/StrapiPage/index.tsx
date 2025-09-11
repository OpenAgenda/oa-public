import { Noto_Sans, Ubuntu_Sans } from 'next/font/google';
import { Global } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import PageHead from 'components/strapi/PageHead';
import HighlightCardSet from 'components/strapi/HighlightCardSet';
import Navbar from 'components/Navbar';
import TabSet from 'components/strapi/TabSet';
import ReferenceSet from 'components/strapi/ReferenceSet';
import SplitHeroSegment from 'components/strapi/SplitHeroSegment';
import useCrispClient from 'hooks/useCrispClient';
import Footer from 'components/strapi/Footer';
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

      {Segments.map((Segment) => {
        const { id } = Segment;
        const Component = {
          'segments.highlight-card-set': HighlightCardSet,
          'segments.page-head': PageHead,
          'segments.tab-set': TabSet,
          'segments.reference-set': ReferenceSet,
          'components.split-hero': SplitHeroSegment,
        }[Segment['__component']];

        return <Component key={id} {...Segment} />;
      })}

      {footer && <Footer {...footer} />}
    </>
  );
}

StrapiPage.fetchLocale = fetchLocale;
