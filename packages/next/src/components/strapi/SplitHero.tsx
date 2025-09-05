import { Box, Flex, H2, Image } from '@openagenda/uikit';
import StrapiMarkdown from './StrapiMarkdown';
import CTAButtons from './CTAButtons';

interface SplitHeroProps {
  title?: string;
  description?: string;
  image?: any;
  text?: string;
  imagePosition?: string;
  fontColor?: any;
  CTAs?: any[];
  TitleComponent?: React.ComponentType<any>;
}

export default function SplitHero({
  title,
  image,
  text,
  imagePosition = 'left',
  CTAs,
  TitleComponent = H2,
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
        <TitleComponent mb="4" fontWeight={600}>
          {title}
        </TitleComponent>
        <StrapiMarkdown>{text}</StrapiMarkdown>
        {CTAs && CTAs.length > 0 && (
          <Box mt={6}>
            <CTAButtons
              CTAs={CTAs}
              justify={{ base: 'center', md: 'flex-start' }}
            />
          </Box>
        )}
      </Box>
    </Flex>
  );
}
