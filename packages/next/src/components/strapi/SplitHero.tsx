import { Box, Flex, H2, Image } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import StrapiMarkdown from './StrapiMarkdown';
import CTAButtons from './CTAButtons';

interface SplitHeroProps {
  title?: string;
  description?: string;
  image?: any;
  coverImage?: boolean;
  text?: string;
  imagePosition?: string;
  background?: any;
  fontColor?: any;
  CTAs?: any[];
  TitleComponent?: React.ComponentType<any>;
}

export default function SplitHero({
  title,
  image,
  text,
  imagePosition = 'left',
  coverImage = false,
  background,
  CTAs,
  TitleComponent = H2,
}: SplitHeroProps) {
  // When coverImage is true, use a special layout with overlapping text
  if (coverImage && image) {
    return (
      <Flex
        display={{ md: 'flex' }}
        direction={{
          base: 'column',
          md: imagePosition === 'left' ? 'row' : 'row-reverse',
        }}
      >
        <Box flex={{ md: 1 }} overflow="hidden">
          <Image
            src={`${image.url}`}
            alt={image.alternativeText}
            width="100%"
            height="100%"
            objectFit="cover"
            borderRadius={0}
          />
        </Box>

        {/* Content container with overlap */}
        <Flex
          flex={{ md: 1 }}
          alignItems="center"
          justify={{ md: imagePosition === 'left' ? 'start' : 'end' }}
        >
          <Box
            bg={color(background?.name ?? 'white', 500)}
            my={{ md: 14, base: 6 }}
            px={{ md: 12, base: 6 }}
            py={{ md: 10 }}
            ml={imagePosition === 'left' ? { md: -16 } : {}}
            mr={imagePosition === 'right' ? { md: -16 } : {}}
            zIndex={2}
          >
            <TitleComponent
              mb="4"
              fontWeight={600}
              textAlign={{ base: 'center', md: 'left' }}
            >
              {title}
            </TitleComponent>
            <StrapiMarkdown>{text}</StrapiMarkdown>
            {CTAs && CTAs.length > 0 && (
              <Box mt={6}>
                <CTAButtons
                  CTAs={CTAs}
                  justify={{
                    base: 'center',
                    md: imagePosition === 'left' ? 'start' : 'end',
                  }}
                />
              </Box>
            )}
          </Box>
        </Flex>
      </Flex>
    );
  }

  // Default layout when coverImage is false
  return (
    <Flex
      gap={14}
      direction={{
        base: 'column',
        md: imagePosition === 'left' ? 'row' : 'row-reverse',
      }}
      align="center"
      justify={!image ? 'center' : 'flex-start'}
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
      <Box
        flex="1"
        maxWidth={!image ? '800px' : '100%'}
        mx={{ base: 4, '2xl': 0 }}
      >
        <TitleComponent
          mb="4"
          fontWeight={600}
          textAlign={!image ? 'center' : { base: 'center', md: 'left' }}
        >
          {title}
        </TitleComponent>
        <StrapiMarkdown textAlign={!image ? 'center' : undefined}>
          {text}
        </StrapiMarkdown>
        {CTAs && CTAs.length > 0 && (
          <Box mt={6}>
            <CTAButtons
              CTAs={CTAs}
              justify={!image ? 'center' : { base: 'center', md: 'flex-start' }}
            />
          </Box>
        )}
      </Box>
    </Flex>
  );
}
