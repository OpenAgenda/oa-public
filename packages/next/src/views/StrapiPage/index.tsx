import { Noto_Sans, Ubuntu_Sans } from 'next/font/google';
import { Global } from '@openagenda/uikit';
import PageHead from 'components/strapi/PageHead';
import ModularSet from 'components/strapi/ModularSet';
import HighlightCardSet from 'components/strapi/HighlightCardSet';
import CarouselSet from 'components/strapi/CarouselSet';
import TabSet from 'components/strapi/TabSet';
import ReferenceSet from 'components/strapi/ReferenceSet';
import fetchLocale from './locales';

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
});

const ubuntuSans = Ubuntu_Sans({
  variable: '--font-ubuntu',
  subsets: ['latin'],
});

export default function StrapiPage({ page }) {
  const { Segments } = page;

  return (
    <>
      <Global
        styles={{
          ':root': {
            '--font-noto-sans': notoSans.style.fontFamily,
            '--font-ubuntu-sans': ubuntuSans.style.fontFamily,
          },
        }}
      />

      {Segments.map((Segment) => {
        const { id } = Segment;
        const Component = {
          'segments.highlight-card-set': HighlightCardSet,
          'segments.page-head': PageHead,
          'segments.modular-set': ModularSet,
          'segments.carousel-set': CarouselSet,
          'segments.tab-set': TabSet,
          'segments.reference-set': ReferenceSet,
        }[Segment['__component']];

        return <Component key={id} {...Segment} />;
      })}
    </>
  );
}

StrapiPage.fetchLocale = fetchLocale;
