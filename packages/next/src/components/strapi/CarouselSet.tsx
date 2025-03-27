import { Heading, Grid, Text } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import SegmentContainer from './SegmentContainer';
import CTAButton from './CTAButton';
import Carousel from './Carousel';

interface Color {
  name: string;
  swatch?: string;
}

interface CarouselSetProps {
  title?: string;
  description?: string;
  Components: Array<any>;
  CTA?: any;
  colorScheme?: Color;
  backgroundColor?: string;
  gradient?: boolean;
  fontColor?: string;
  carouselBgColor?: Color;
  titleColor?: Color;
  descriptionColor?: Color;
  variant?: string;
  width?: { name: string };
}

export default function CarouselSet({
  title = null,
  description,
  Components,
  CTA,
  colorScheme,
  backgroundColor,
  gradient,
  fontColor,
  carouselBgColor,
  titleColor,
  descriptionColor,
  variant,
  width = { name: 'full' },
}: CarouselSetProps) {
  return (
    <SegmentContainer backgroundColor={backgroundColor} fontColor={fontColor}>
      {title ? (
        <Heading as="h2" size="xl" textAlign="center" color={color(titleColor)}>
          {title}
        </Heading>
      ) : null}
      {description && (
        <Text textAlign="center" mt={4} mb={2} color={color(descriptionColor)}>
          {description}
        </Text>
      )}
      <Carousel
        Components={Components}
        backgroundColor={carouselBgColor}
        gradient={gradient}
        colorScheme={colorScheme}
        variant={variant}
        width={width}
      />
      {CTA ? (
        <Grid templateColumns="1fr" justifyItems="center" w="full">
          <CTAButton {...CTA} />
        </Grid>
      ) : null}
    </SegmentContainer>
  );
}
