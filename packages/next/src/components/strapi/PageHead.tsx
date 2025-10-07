import {
  Box,
  Heading,
  HeadingProps,
  Image,
  Flex,
  useBreakpointValue,
} from '@openagenda/uikit';

import { color } from 'utils/strapi';
import CTAButtons from './CTAButtons';
import SegmentContainer from './SegmentContainer';
import StrapiMarkdown from './StrapiMarkdown';
import VideoPlayer from './VideoPlayer';

import type { Color } from './types';

interface PageHeadProps {
  colorVariant?: string;
  background?: any;
  fontColor?: Color;
  title: string;
  description: string;
  fontSize?: HeadingProps['size'];
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
  xl: 24,
  '2xl': 36,
};

const TextContent = ({
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
      size={fontSize || '5xl'}
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
    {CTAs && CTAs.length > 0 ? <CTAButtons CTAs={CTAs} mt={9} /> : null}
  </Flex>
);

const Content = ({
  title,
  description,
  CTAs = [],
  fontColor,
  fontSize,
  image,
  video,
}: Pick<
  PageHeadProps,
  | 'title'
  | 'description'
  | 'CTAs'
  | 'fontColor'
  | 'fontSize'
  | 'image'
  | 'video'
>) => {
  const itemsCount = 1 + (image ? 1 : 0) + (video ? 1 : 0);

  if (useBreakpointValue({ base: true, '2xl': false }) && video) {
    return (
      <Box maxW="5xl" m="auto" height="100%" p={8}>
        <Flex
          height="100%"
          gap={2}
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Heading
            as="h1"
            size={fontSize || '5xl'}
            color={[color(fontColor), 'solid'].join('.')}
            fontWeight={600}
            textAlign="center"
          >
            {title}
          </Heading>
          {description ? (
            <StrapiMarkdown
              mt={12}
              flex={null}
              color={[color(fontColor) || 'gray.600', 'solid'].join('.')}
            >
              {description}
            </StrapiMarkdown>
          ) : null}
          <VideoPlayer />
          {CTAs?.length ?? 0 > 0 ? (
            <CTAButtons CTAs={CTAs} justify="center" mt={2} />
          ) : null}
        </Flex>
      </Box>
    );
  }

  return (
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
      <TextContent
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
  );
};

export default function PageHead(props: PageHeadProps) {
  const { fontColor, background, additionalTopPadding } = props;
  return (
    <SegmentContainer
      fullWidth
      fontColor={fontColor}
      background={background}
      fullHeight
      additionalTopPadding={additionalTopPadding}
    >
      <Content {...props} />
    </SegmentContainer>
  );
}
