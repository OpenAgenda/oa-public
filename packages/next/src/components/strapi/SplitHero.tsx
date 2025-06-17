import { Box, Flex, H3, Image } from '@openagenda/uikit';
import StrapiMarkdown from './StrapiMarkdown';

export default function SplitHero({
  title,
  image,
  text,
  imagePosition = 'left',
}) {
  return (
    <Flex
      gap="8"
      direction={{
        base: 'column',
        md: imagePosition === 'left' ? 'row' : 'row-reverse',
      }}
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
      <Box flex="1">
        <H3 mb="4">{title}</H3>
        <StrapiMarkdown>{text}</StrapiMarkdown>
      </Box>
    </Flex>
  );
}
