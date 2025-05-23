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

const PageHeadContent = ({
  title,
  description,
  CTA,
  Illustration,
  titleColor,
  descriptionColor,
  fontSize,
}: Pick<
  PageHeadProps,
  | 'title'
  | 'description'
  | 'CTA'
  | 'Illustration'
  | 'titleColor'
  | 'descriptionColor'
  | 'fontSize'
>) => (
  <Stack
    gap={0}
    align={Illustration ? undefined : 'center'}
    textAlign={Illustration ? undefined : 'center'}
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

interface Color {
  name: string;
  swatch?: string;
}

interface PageHeadProps {
  backgroundColor?: any;
  titleColor?: Color;
  descriptionColor?: Color;
  title: string;
  description: string;
  fontSize?: { name: string };
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
  titleColor,
  descriptionColor,
}: PageHeadProps) {
  return (
    <SegmentContainer
      backgroundColor={backgroundColor}
      fontColor={color(titleColor)}
    >
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
            titleColor={titleColor}
            descriptionColor={descriptionColor}
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
