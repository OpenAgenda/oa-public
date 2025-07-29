import { Noto_Sans, Ubuntu_Sans } from 'next/font/google';
import { Global } from '@openagenda/uikit';
import PageHead from 'components/strapi/PageHead';
import HighlightCardSet from 'components/strapi/HighlightCardSet';
import TabSet from 'components/strapi/TabSet';
import ReferenceSet from 'components/strapi/ReferenceSet';
import SplitHeroSegment from 'components/strapi/SplitHeroSegment';
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
  const { title, description, keywords, Segments, themeColor } = page;

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

  return (
    <>
      <Metas title={title} description={description} keywords={keywords} />
      <Global
        styles={{
          html: {
            backgroundColor: 'white',
            ':root': {
              '--font-noto-sans': notoSans.style.fontFamily,
              '--font-ubuntu-sans': ubuntuSans.style.fontFamily,
            },
          },
          backgroundColor: 'white',
        }}
      />

      {Segments.map((Segment, i) => {
        const { id, backgroundColor } = Segment;
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
            backgroundColor={backgroundColor || colors[i % 2].segment}
            componentsBackgroundColor={colors[i % 2].component}
            colorVariant={backgroundColor ? 'solid' : 'subtle'}
          />
        );
      })}

      {footer && <Footer {...footer} />}
    </>
  );
}

StrapiPage.fetchLocale = fetchLocale;
