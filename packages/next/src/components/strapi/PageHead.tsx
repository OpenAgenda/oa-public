import { Box, Heading, HeadingProps, Image, Flex } from '@openagenda/uikit';

import { color } from 'utils/strapi';
import CTAButtons from './CTAButtons';
import SegmentContainer from './SegmentContainer';
import StrapiMarkdown from './StrapiMarkdown';
import VideoPlayer from './VideoPlayer';

const PageHeadContent = ({
  title,
  description,
  CTAs,
  alignItems,
  fontColor,
  fontSize,
}: Pick<
  PageHeadProps,
  'title' | 'description' | 'CTAs' | 'fontColor' | 'fontSize' | 'alignItems'
>) => (
  <Flex
    flex="1"
    alignItems={alignItems}
    textAlign={alignItems}
    direction="column"
    justifyContent="center"
  >
    <Heading
      as="h1"
      size={(fontSize?.name || '5xl') as HeadingProps['size']}
      color={[color(fontColor), 'solid'].join('.')}
      fontWeight={600}
    >
      {title}
    </Heading>
    {description ? (
      <StrapiMarkdown
        color={[color(fontColor) || 'gray.600', 'solid'].join('.')}
        mt={7}
        flex={null}
      >
        {description}
      </StrapiMarkdown>
    ) : null}
    {CTAs && CTAs.length > 0 ? (
      <Box mt={9}>
        <CTAButtons CTAs={CTAs} />
      </Box>
    ) : null}
  </Flex>
);

import type { Color } from './types';

interface PageHeadProps {
  colorVariant?: string;
  background?: any;
  fontColor?: Color;
  title: string;
  description: string;
  fontSize?: Color;
  CTAs?: any[];
  video?: string;
  image?: {
    url: string;
    alternativeText?: string;
    width?: string;
    height?: string;
  };
  alignItems?: {
    base?: string;
    md?: string;
    lg?: string;
  };
  additionalTopPadding?: any;
}

const gap = {
  base: 8,
  sm: 12,
  md: 24,
  lg: 12,
  xl: '24',
  '2xl': '36',
};

export default function PageHead({
  title,
  description,
  CTAs,
  video,
  image,
  fontColor,
  background,
  additionalTopPadding,
}: PageHeadProps) {
  const itemsCount = 1 + (image ? 1 : 0) + (video ? 1 : 0);

  return (
    <SegmentContainer
      fullWidth
      fontColor={fontColor}
      background={background}
      fullHeight
      additionalTopPadding={additionalTopPadding}
    >
      <Flex
        height="100%"
        alignItems="center"
        gap={gap}
        p={gap}
        direction={{
          base: 'column',
          lg: 'row',
        }}
      >
        <PageHeadContent
          title={title}
          description={description}
          CTAs={CTAs}
          alignItems={{
            base: 'center',
            lg: itemsCount === 1 ? 'center' : 'start',
          }}
          fontColor={fontColor}
        />
        {video ? (
          <Flex flex="1">
            <VideoPlayer />
          </Flex>
        ) : null}
        {image ? (
          <Flex flex="1" justifyContent="center">
            <Image
              src={image.url}
              alt={image.alternativeText}
              maxW={{ lg: 'full' }}
              maxH={{ base: 'full', lg: undefined }}
              w={{ lg: image.width }}
              h={{ base: image.height, lg: undefined }}
              objectFit="contain"
            />
          </Flex>
        ) : null}
      </Flex>
    </SegmentContainer>
  );
}
