import { Flex, H3, Image } from '@openagenda/uikit';
import StrapiMarkdown from './StrapiMarkdown';

export default function SplitHero({ title, image, text, direction = 'row' }) {
  return (
    <>
      <H3 mb="4" hideBelow="md">
        {title}
      </H3>
      <Flex
        gap="8"
        direction={{ base: 'column', md: direction }}
        align="center"
      >
        {image ? (
          <Image
            src={`${image.url}`}
            alt={image.alternativeText}
            borderRadius="lg"
            maxW={{ base: 'full', md: '33%' }}
            height="auto"
          />
        ) : null}
        <H3 mb="4" hideFrom="md">
          {title}
        </H3>
        <StrapiMarkdown flex="1">{text}</StrapiMarkdown>
      </Flex>
    </>
  );
}
