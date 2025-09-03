import { Noto_Sans, Ubuntu_Sans } from 'next/font/google';
import { Global, chakra } from '@openagenda/uikit';
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
    themeColor,
    navFontColor,
    BackgroundGradient,
    logoVariant,
  } = page;

  const colors = [
    {
      segment: themeColor,
      component: { name: 'white' },
    },
    {
      segment: { name: 'white' },
      component: themeColor,
    },
  ];

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
            },
          },
        }}
      />
      <chakra.div
        backgroundColor={themeColor ? color(themeColor, 500) : null}
        backgroundImage={
          BackgroundGradient
            ? `linear-gradient(${BackgroundGradient.direction}, ${BackgroundGradient.Colors.map((c) => `{colors.${color(c.name, 500)}}`).join(', ')})`
            : null
        }
      >
        <Navbar
          discreet={!!navFontColor}
          fontColor={
            navFontColor?.name === 'white' ? 'oaWhite' : navFontColor?.name
          }
          logoVariant={logoVariant}
        />

        {Segments.map((Segment, i) => {
          const { id } = Segment;
          const Component = {
            'segments.highlight-card-set': HighlightCardSet,
            'segments.page-head': PageHead,
            'segments.tab-set': TabSet,
            'segments.reference-set': ReferenceSet,
            'components.split-hero': SplitHeroSegment,
          }[Segment['__component']];

          return (
            <Component
              key={id}
              {...Segment}
              backgroundColor={colors[i % 2].segment}
              componentBackgroundColor={colors[i % 2].component}
              colorVariant={
                Segment['__component'] === 'segments.page-head'
                  ? 'solid'
                  : 'subtle'
              }
            />
          );
        })}

        {footer && <Footer {...footer} backgroundColor={colors[0].segment} />}
      </chakra.div>
    </>
  );
}

StrapiPage.fetchLocale = fetchLocale;
