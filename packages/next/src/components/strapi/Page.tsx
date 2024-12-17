import FeatureCardSet from 'components/strapi/FeatureCardSet';

export default function StrapiPage({ page, assetsBasePath }) {
  const { title, Segments } = page;

  return (
    <div>
      <h1>{title}</h1>
      {Segments.map((Segment) => {
        const { id } = Segment;
        const Component = {
          'segments.feature-card-set': FeatureCardSet,
        }[Segment['__component']];

        return (
          <Component key={id} assetsBasePath={assetsBasePath} {...Segment} />
        );
      })}
    </div>
  );
}
