import { Box, Grid, GridItem, Stack, Heading, Text } from '@openagenda/uikit';
import CTAButton from './CTAButton';
import IllustrationComponent from './Illustration';
import SegmentContainer from './SegmentContainer';

const PageHeadContent = ({
  title,
  description,
  CTA,
  Illustration,
  fontColor,
}: Pick<
  PageHeadProps,
  'title' | 'description' | 'CTA' | 'Illustration' | 'fontColor'
>) => (
  <Stack
    spacing={6}
    align={Illustration ? undefined : 'center'}
    textAlign={Illustration ? undefined : 'center'}
  >
    <Heading as="h1" size="2xl" color={fontColor}>
      {title}
    </Heading>
    <Text fontSize="xl" color={fontColor || 'gray.600'}>
      {description}
    </Text>
    {CTA ? (
      <Box pt={4}>
        <CTAButton {...CTA} />
      </Box>
    ) : null}
  </Stack>
);

interface PageHeadProps {
  backgroundColor?: any;
  fontColor?: any;
  title: string;
  description: string;
  CTA?: {
    label: string;
    link: string;
  };
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
  Illustration,
  backgroundColor,
  fontColor,
}: PageHeadProps) {
  return (
    <SegmentContainer backgroundColor={backgroundColor} fontColor={fontColor}>
      <Grid
        templateColumns={Illustration ? { base: '1fr', md: '1fr auto' } : '1fr'}
        gap={8}
        alignItems="center"
        justifyItems={Illustration ? undefined : 'center'}
        py={12}
      >
        <GridItem maxW={Illustration ? undefined : 'container.md'}>
          <PageHeadContent
            title={title}
            description={description}
            CTA={CTA}
            Illustration={Illustration}
            fontColor={fontColor}
          />
        </GridItem>
        {Illustration ? (
          <GridItem>
            <IllustrationComponent {...Illustration} />
          </GridItem>
        ) : null}
      </Grid>
    </SegmentContainer>
  );
}
