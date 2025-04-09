import { Box } from '@openagenda/uikit';
import PageHead from 'components/strapi/PageHead';
import ModularSet from 'components/strapi/ModularSet';
import FeatureCardSet from 'components/strapi/FeatureCardSet';
import CarouselSet from 'components/strapi/CarouselSet';

export default function StrapiPage({ page }) {
  const { title, Segments } = page;

  return (
    <>
      {title ? <h1>{title}</h1> : null}
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
            <Component key={id} {...Segment} />
          </Box>
        );
      })}
    </>
  );
}
