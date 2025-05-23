import { Noto_Sans, Ubuntu_Sans } from 'next/font/google';
import { Global, Box } from '@openagenda/uikit';
import PageHead from 'components/strapi/PageHead';
import ModularSet from 'components/strapi/ModularSet';
import FeatureCardSet from 'components/strapi/FeatureCardSet';
import CarouselSet from 'components/strapi/CarouselSet';
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
      {Segments.map((Segment) => {
        const { id } = Segment;
        const Component = {
          'segments.feature-card-set': FeatureCardSet,
          'segments.page-head': PageHead,
          'segments.modular-set': ModularSet,
          'segments.carousel-set': CarouselSet,
        }[Segment['__component']];

        return (
          <Box key={id}>
            <Global
              key={id}
              styles={{
                ':root': {
                  '--font-noto-sans': notoSans.style.fontFamily,
                  '--font-ubuntu-sans': ubuntuSans.style.fontFamily,
                },
              }}
            />
            <Component key={id} {...Segment} />
          </Box>
        );
      })}
    </>
  );
}

StrapiPage.fetchLocale = fetchLocale;
