import { Heading, HStack } from '@openagenda/uikit';
import Modular from './Modular';
import SegmentContainer from './SegmentContainer';
import CTAButton from './CTAButton';

export default function ModularSet({ title, Components, CTA }) {
  return (
    <SegmentContainer>
      <Heading as="h2" size="xl" textAlign="center">
        {title}
      </Heading>
      <HStack spacing={8} p={8}>
        {Components.map((Component) => (
          <Modular key={Component.id} {...Component} />
        ))}
      </HStack>
      {CTA ? (
        <HStack justify="center" w="full">
          <CTAButton {...CTA} />
        </HStack>
      ) : null}
    </SegmentContainer>
  );
}
