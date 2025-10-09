import {
  Box,
  Heading,
  HeadingProps,
  Image,
  Flex,
  useBreakpointValue,
  ButtonProps,
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
  textAlign?: string;
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

const Description = ({ mt, fontColor, description }) =>
  description ? (
    <StrapiMarkdown
      mt={mt}
      flex={null}
      color={[color(fontColor) || 'gray.600', 'solid'].join('.')}
    >
      {description}
    </StrapiMarkdown>
  ) : null;

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

  const isSmall = useBreakpointValue({ base: true, lg: false });
  const isRegular = useBreakpointValue({ lg: true, '2xl': false });

  if ((isSmall || isRegular) && video) {
    return (
      <Box maxW="5xl" m="auto" height="100%" p={8}>
        <Flex
          height="100%"
          gap={2}
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Title
            coloredTitle={coloredTitle}
            fontSize={fontSize}
            fontColor={fontColor}
            title={title}
            textAlign="center"
          />

          <Description
            mt={12}
            fontColor={fontColor}
            description={description}
          />
          <VideoPlayer video={video} />
          <CTAButtons CTAs={CTAs} justify="center" mt={2} />
        </Flex>
      </Box>
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
      {video ? (
        <Flex flex="1">
          <VideoPlayer video={video} />
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
