import { HStack } from '@openagenda/uikit';
import FeatureCard from './FeatureCard';

export default function FeatureCardSet({ Features }) {
  return (
    <HStack gap={8}>
      {Features.map((Feature) => (
        <FeatureCard key={Feature.id} {...Feature} />
      ))}
    </HStack>
  );
}
