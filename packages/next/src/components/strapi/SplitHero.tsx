import { Box, Flex, H3, Image } from '@openagenda/uikit';
import StrapiMarkdown from './StrapiMarkdown';
import CTAButtons from './CTAButtons';

interface SplitHeroProps {
  title?: string;
  description?: string;
  image?: any;
  text?: string;
  imagePosition?: string;
  CTAs?: any[];
}

export default function SplitHero({
  title,
  image,
  text,
  imagePosition = 'left',
  CTAs,
}: SplitHeroProps) {
  return (
    <Flex
      gap={14}
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
        {CTAs && CTAs.length > 0 && (
          <Box mt={6}>
            <CTAButtons CTAs={CTAs} />
          </Box>
        )}
      </Box>
    </Flex>
  );
}
