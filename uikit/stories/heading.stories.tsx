import { H1, H2, H3, H4, H5, H6, VStack } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Heading',
  decorators: [Provider],
};

export function All() {
  return (
    <VStack gap="4">
      <H1>This is a h1</H1>
      <H2>This is a h2</H2>
      <H3>This is a h3</H3>
      <H4>This is a h4</H4>
      <H5>This is a h5</H5>
      <H6>This is a h6</H6>

      <H1 size="xl">This is a h1 with an overridden size</H1>
    </VStack>
  );
}

All.storyName = 'Heading';
