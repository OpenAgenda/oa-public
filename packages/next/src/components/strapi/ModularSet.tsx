import { Heading, Grid, GridItem, Text } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import Modular from './Modular';
import SegmentContainer from './SegmentContainer';
import CTAButton from './CTAButton';
import Carousel from './Carousel';

interface Color {
  name: string;
  swatch?: string;
}

interface ModularSetProps {
  title: string;
  description?: string;
  Components: Array<any>;
  CTA?: any;
  backgroundColor?: string;
  fontColor?: string;
  alignHeight?: boolean;
  useCarousel?: boolean;
  carouselBgColor?: Color;
}

export default function ModularSet({
  title,
  description,
  Components,
  CTA,
  backgroundColor,
  fontColor,
  alignHeight,
  useCarousel,
  carouselBgColor,
}: ModularSetProps) {
  return (
    <SegmentContainer backgroundColor={backgroundColor} fontColor={fontColor}>
      <Heading as="h2" size="xl" textAlign="center">
        {title}
      </Heading>
      {description && (
        <Text textAlign="center" mt={4} mb={2}>
          {description}
        </Text>
      )}
      {useCarousel ? (
        <Carousel backgroundColor={color(carouselBgColor)}>
          {Components.map((Component) => (
            <Modular
              {...Component}
              key={Component.id}
              alignHeight={alignHeight}
              useCarousel={useCarousel}
            />
          ))}
        </Carousel>
      ) : (
        <Grid display="flex" gap={8} p={8} alignItems="stretch">
          {Components.map((Component) => (
            <GridItem
              key={Component.id}
              w="full"
              justifyItems="center"
              flex={Component.grow || 1}
            >
              <Modular
                {...Component}
                alignHeight={alignHeight}
                useCarousel={useCarousel}
              />
            </GridItem>
          ))}
        </Grid>
      )}
      {CTA ? (
        <Grid templateColumns="1fr" justifyItems="center" w="full">
          <CTAButton {...CTA} />
        </Grid>
      ) : null}
    </SegmentContainer>
  );
}
