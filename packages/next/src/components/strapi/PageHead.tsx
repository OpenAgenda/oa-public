import {
  Box,
  Heading,
  HeadingProps,
  Image,
  Flex,
  Grid,
  ButtonProps,
  type HTMLChakraProps,
} from '@openagenda/uikit';

import { color } from 'utils/strapi';
import CTAButtons from './CTAButtons';
import SegmentContainer from './SegmentContainer';
import StrapiMarkdown from './StrapiMarkdown';
import VideoPlayer from './VideoPlayer';

import type { Color } from './types';
import MultiColorText from './MultiColorText';

interface TextPart {
  id: number;
  text: string;
  color: {
    id: number;
    documentId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  } | null;
}

interface PageHeadProps {
  colorVariant?: string;
  background?: any;
  fontColor?: Color;
  title: string;
  description: string;
  fontSize?: HeadingProps['size'];
  CTAs?: Array<{
    link: string;
    label: string;
    color?: Color;
    variant?: ButtonProps['variant'];
  }>;
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
  coloredTitle?: TextPart[];
  fullHeight?: boolean;
}

const gap = {
  base: 8,
  sm: 12,
  md: 24,
  lg: 12,
  xl: 24,
  '2xl': 36,
};

interface TitleProps {
  coloredTitle?: TextPart[];
  fontSize?: HeadingProps['size'];
  fontColor?: Color;
  title: string;
  textAlign?: HTMLChakraProps<'div'>['textAlign'];
}

const Title = ({
  coloredTitle,
  fontSize,
  fontColor,
  title,
  textAlign = 'center',
}: TitleProps) => {
  const headingSize = fontSize || '5xl';

  if (coloredTitle?.length) {
    return (
      <MultiColorText
        as="h1"
        TextParts={coloredTitle}
        fontWeight={600}
        size={headingSize}
        textAlign={textAlign}
      />
    );
  }

  return (
    <Heading
      as="h1"
      size={headingSize}
      color={[color(fontColor), 'solid'].join('.')}
      fontWeight={600}
      textAlign={textAlign}
    >
      {title}
    </Heading>
  );
};

interface ContentProps {
  title: string;
  coloredTitle?: TextPart[];
  description?: string;
  CTAs?: Array<{
    link: string;
    label: string;
    color?: Color;
    variant?: ButtonProps['variant'];
  }>;
  fontColor?: Color;
  fontSize?: HeadingProps['size'];
  image?: {
    url: string;
    alternativeText?: string;
    width?: string;
    height?: string;
  };
  video?: string;
}

const Description = ({ mt = undefined, fontColor, description }) =>
  description ? (
    <StrapiMarkdown
      mt={mt}
      flex={null}
      color={[color(fontColor) || 'gray.600', 'solid'].join('.')}
    >
      {description}
    </StrapiMarkdown>
  ) : null;

// CSS Grid layout for the video case: single column (stacked) below 2xl,
// multi-column (row) at 2xl+.  Reproduces the original two-branch JS layout
// (`useBreakpointValue`) without hydration layout shift.
const VideoContent = ({
  title,
  coloredTitle,
  description,
  CTAs = [],
  fontColor,
  fontSize,
  image,
  video,
}: ContentProps) => {
  const hasImage = !!image;

  return (
    <Grid
      height="100%"
      gridTemplateAreas={{
        base: '"title" "desc" "video" "ctas"',
        '2xl': hasImage
          ? '"title video image" "desc video image" "ctas video image"'
          : '"title video" "desc video" "ctas video"',
      }}
      gridTemplateColumns={{
        base: '1fr',
        '2xl': hasImage ? '1fr 1fr 1fr' : '1fr 1fr',
      }}
      maxW={{ base: '5xl', '2xl': 'none' }}
      mx={{ base: 'auto', '2xl': 0 }}
      px={{ base: 8, '2xl': 36 }}
      py={{ base: 14, '2xl': 36 }}
      rowGap={{ base: 2, '2xl': 0 }}
      columnGap={{ base: 0, '2xl': 36 }}
      alignContent="center"
      alignItems="center"
      justifyItems={{ base: 'center', '2xl': 'stretch' }}
    >
      <Box gridArea="title" justifySelf={{ base: 'center', '2xl': 'stretch' }}>
        <Title
          coloredTitle={coloredTitle}
          fontSize={{ base: fontSize || '5xl', '2xl': '5xl' }}
          fontColor={fontColor}
          title={title}
          textAlign={{ base: 'center', '2xl': 'left' }}
        />
      </Box>
      <Box gridArea="desc" mt={{ base: 12, '2xl': 7 }}>
        <Description fontColor={fontColor} description={description} />
      </Box>
      <Flex
        gridArea="video"
        w={{ base: '70%', '2xl': 'auto' }}
        justifyContent="center"
        alignSelf="center"
      >
        <VideoPlayer video={video} />
      </Flex>
      <Box gridArea="ctas" mt={{ base: 2, '2xl': 9 }}>
        <CTAButtons
          CTAs={CTAs}
          justify={{ base: 'center', '2xl': 'flex-start' }}
        />
      </Box>
      {hasImage ? (
        <Flex
          gridArea="image"
          display={{ base: 'none', '2xl': 'flex' }}
          justifyContent="center"
          alignSelf="center"
        >
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
    </Grid>
  );
};

const Content = ({
  title,
  coloredTitle,
  description,
  CTAs = [],
  fontColor,
  fontSize,
  image,
  video,
}: ContentProps) => {
  const itemsCount = 1 + (image ? 1 : 0) + (video ? 1 : 0);

  if (video) {
    return (
      <VideoContent
        title={title}
        coloredTitle={coloredTitle}
        description={description}
        CTAs={CTAs}
        fontColor={fontColor}
        fontSize={fontSize}
        image={image}
        video={video}
      />
    );
  }

  return (
    <Flex height="100%" alignItems="center" gap={gap} p={gap} direction="row">
      <Flex
        flex="1"
        alignItems={{
          base: 'center',
          lg: itemsCount === 1 ? 'center' : 'start',
        }}
        textAlign={{
          base: 'center',
          lg: itemsCount === 1 ? 'center' : 'start',
        }}
        direction="column"
        justifyContent="center"
      >
        <Title
          coloredTitle={coloredTitle}
          fontSize={{ base: '2xl', xl: '4xl', '2xl': '5xl' }}
          fontColor={fontColor}
          title={title}
          textAlign="left"
        />
        <Description mt={7} fontColor={fontColor} description={description} />
        {CTAs && CTAs.length > 0 ? <CTAButtons CTAs={CTAs} mt={9} /> : null}
      </Flex>
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
  const {
    fontColor,
    background,
    additionalTopPadding,
    fullHeight = true,
  } = props;
  return (
    <SegmentContainer
      fullWidth
      fontColor={fontColor}
      background={background}
      fullHeight={fullHeight}
      additionalTopPadding={additionalTopPadding}
    >
      <Content {...props} />
    </SegmentContainer>
  );
}
