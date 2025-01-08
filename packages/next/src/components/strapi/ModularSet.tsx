import { Heading, HStack } from '@openagenda/uikit';
import Modular from './Modular';
import CTAButton from './CTAButton';

export default function ModularSet({ title, Components, CTA }) {
  return (
    <>
      <Heading as="h2" size="xl">
        {title}
      </Heading>
      <HStack spacing={8}>
        {Components.map((Component) => (
          <Modular key={Component.id} {...Component} />
        ))}
      </HStack>
      {CTA ? <CTAButton {...CTA} /> : null}
    </>
  );
}
