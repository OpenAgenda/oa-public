import PageHead from 'components/strapi/PageHead';
import ModularSet from 'components/strapi/ModularSet';
import FeatureCardSet from 'components/strapi/FeatureCardSet';

export default function StrapiPage({ page }) {
  const { title, Segments } = page;

  return (
    <div>
      <h1>{title}</h1>
      {Segments.map((Segment) => {
        const { id } = Segment;
        const Component = {
          'segments.feature-card-set': FeatureCardSet,
          'segments.page-head': PageHead,
          'segments.modular-set': ModularSet,
        }[Segment['__component']];

        return <Component key={id} {...Segment} />;
      })}
    </div>
  );
}
