import {
  Box,
  Grid,
  GridItem,
  Stack,
  Heading,
  Text,
  HeadingProps,
} from '@openagenda/uikit';
import { color } from 'utils/strapi';
import CTAButton from './CTAButton';
import IllustrationComponent from './Illustration';
import SegmentContainer from './SegmentContainer';
import VideoPlayer from './VideoPlayer';

const PageHeadContent = ({
  title,
  description,
  CTA,
  centered,
  titleColor,
  descriptionColor,
  fontSize,
}: { centered?: boolean } & Pick<
  PageHeadProps,
  | 'title'
  | 'description'
  | 'CTA'
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
    <Text fontSize="lg" color={color(descriptionColor) || 'gray.600'} mt={7}>
      {description}
    </Text>
    {CTA ? (
      <Box>
        <CTAButton {...CTA} />
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
  CTA?: {
    label: string;
    link: string;
  };
  video?: string;
  Illustration?: {
    image: {
      url: string;
      alternativeText?: string;
    };
  };
}

export default function PageHead({
  title,
  description,
  CTA,
  video,
  Illustration,
  backgroundColor,
  titleColor,
  descriptionColor,
}: PageHeadProps) {
  const hasTwoColumns = Boolean(Illustration || video);

  const templateColumns = video
    ? { base: '1fr', md: '1fr 1fr' }
    : Illustration
      ? { base: '1fr', md: '1fr auto' }
      : '1fr';

  return (
    <SegmentContainer
      backgroundColor={backgroundColor}
      fontColor={color(titleColor)}
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
            CTA={CTA}
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
        {Illustration ? (
          <GridItem>
            <IllustrationComponent {...Illustration} />
          </GridItem>
        ) : null}
      </Grid>
    </SegmentContainer>
  );
}
