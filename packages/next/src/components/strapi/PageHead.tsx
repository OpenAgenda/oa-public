import {
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
  fontColor,
  fontSize,
}: { centered?: boolean } & Pick<
  PageHeadProps,
  'title' | 'description' | 'CTAs' | 'fontColor' | 'fontSize'
>) => (
  <Stack
    gap={0}
    align={centered ? undefined : 'center'}
    textAlign={centered ? undefined : 'center'}
  >
    <Heading
      as="h1"
      size={(fontSize?.name || '5xl') as HeadingProps['size']}
      color={[color(fontColor), 'solid'].join('.')}
      fontWeight={600}
    >
      {title}
    </Heading>
    <StrapiMarkdown
      color={[color(fontColor) || 'gray.600', 'solid'].join('.')}
      mt={7}
    >
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
  };
}

export default function PageHead({
  title,
  description,
  CTAs,
  video,
  image,
  fontColor,
  background,
}: PageHeadProps) {
  const hasTwoColumns = Boolean(image || video);

  const templateColumns = video
    ? { base: '1fr', md: '1fr 1fr' }
    : image
      ? { base: '1fr', md: '1fr auto' }
      : '1fr';

  return (
    <SegmentContainer fontColor={fontColor} background={background}>
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
            fontColor={fontColor}
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
    </SegmentContainer>
  );
}
