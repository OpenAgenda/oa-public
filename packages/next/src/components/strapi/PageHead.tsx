import {
  chakra,
  Box,
  Grid,
  GridItem,
  Stack,
  Heading,
  HeadingProps,
  Image,
} from '@openagenda/uikit';

import { color } from 'utils/strapi';
import CTAButtons from './CTAButtons';
import SegmentContainer from './SegmentContainer';
import StrapiMarkdown from './StrapiMarkdown';
import VideoPlayer from './VideoPlayer';

const PageHeadContent = ({
  title,
  description,
  CTAs,
  centered,
  titleColor,
  descriptionColor,
  fontSize,
}: { centered?: boolean } & Pick<
  PageHeadProps,
  | 'title'
  | 'description'
  | 'CTAs'
  | 'titleColor'
  | 'descriptionColor'
  | 'fontSize'
>) => (
  <Stack
    gap={0}
    align={centered ? undefined : 'center'}
    textAlign={centered ? undefined : 'center'}
  >
    <Heading
      as="h1"
      size={(fontSize?.name || '5xl') as HeadingProps['size']}
      color={color(titleColor)}
      fontWeight={600}
    >
      {title}
    </Heading>
    <StrapiMarkdown color={color(descriptionColor) || 'gray.600'} mt={7}>
      {description}
    </StrapiMarkdown>
    {CTAs && CTAs.length > 0 ? (
      <Box mt={9}>
        <CTAButtons CTAs={CTAs} />
      </Box>
    ) : null}
  </Stack>
);

import type { Color } from './types';

interface PageHeadProps {
  backgroundColor?: any;
  titleColor?: Color;
  descriptionColor?: Color;
  title: string;
  description: string;
  fontSize?: Color;
  CTAs?: any[];
  video?: string;
  image?: {
    url: string;
    alternativeText?: string;
    width?: string;
  };
}

const StyledSegmentContainer = chakra(SegmentContainer);

export default function PageHead({
  title,
  description,
  CTAs,
  video,
  image,
  backgroundColor,
  titleColor,
  descriptionColor,
}: PageHeadProps) {
  const hasTwoColumns = Boolean(image || video);

  const templateColumns = video
    ? { base: '1fr', md: '1fr 1fr' }
    : image
      ? { base: '1fr', md: '1fr auto' }
      : '1fr';

  return (
    <StyledSegmentContainer
      fontColor={titleColor}
      colorPalette={backgroundColor}
      bg={
        !backgroundColor || backgroundColor.name === 'white'
          ? 'white'
          : color(backgroundColor.name, 'subtle')
      }
    >
      <Grid
        templateColumns={templateColumns}
        gap={8}
        alignItems="center"
        justifyItems={hasTwoColumns ? undefined : 'center'}
        py={12}
      >
        <GridItem maxW={hasTwoColumns ? undefined : 'container.md'}>
          <PageHeadContent
            title={title}
            description={description}
            CTAs={CTAs}
            centered={hasTwoColumns}
            titleColor={titleColor}
            descriptionColor={descriptionColor}
          />
        </GridItem>
        {video ? (
          <GridItem>
            <VideoPlayer />
          </GridItem>
        ) : null}
        {image ? (
          <GridItem>
            <Image
              src={image.url}
              alt={image.alternativeText}
              maxW="full"
              w={image.width}
              objectFit="contain"
            />
          </GridItem>
        ) : null}
      </Grid>
    </StyledSegmentContainer>
  );
}
