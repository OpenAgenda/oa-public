import { HStack } from '@openagenda/uikit';
import FeatureCard from './FeatureCard';

export default function FeatureCardSet({ Features, assetsBasePath }) {
  return (
    <HStack spacing={8}>
      {Features.map((Feature) => (
        <FeatureCard
          key={Feature.id}
          assetsBasePath={assetsBasePath}
          {...Feature}
        />
      ))}
    </HStack>
  );
}
