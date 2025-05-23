import { Heading, HeadingProps, Text } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import SegmentContainer from './SegmentContainer';
import Carousel from './Carousel';

interface Color {
  name: string;
  swatch?: string;
}

interface CarouselSetProps {
  title?: string;
  description?: string;
  Components: Array<any>;
  colorPalette?: Color;
  backgroundColor?: string;
  gradient?: boolean;
  fontColor?: string;
  carouselBgColor?: Color;
  titleColor?: Color;
  descriptionColor?: Color;
  variant?: string;
  width?: { name: string };
  borderRadius?: string;
  fontSize?: { name: string };
}

export default function CarouselSet({
  title = null,
  description,
  Components,
  colorPalette,
  backgroundColor,
  gradient,
  fontColor,
  carouselBgColor,
  titleColor,
  descriptionColor,
  variant,
  width,
  borderRadius,
  fontSize,
}: CarouselSetProps) {
  return (
    <SegmentContainer backgroundColor={backgroundColor} fontColor={fontColor}>
      {title ? (
        <Heading
          as="h2"
          size={(fontSize?.name || 'xl') as HeadingProps['size']}
          textAlign="center"
          color={color(titleColor)}
        >
          {title}
        </Heading>
      ) : null}
      {description && (
        <Text
          fontSize="lg"
          textAlign="center"
          mt={4}
          mb={2}
          color={color(descriptionColor)}
        >
          description
        </Text>
      )}
      <Carousel
        Components={Components}
        backgroundColor={carouselBgColor}
        gradient={gradient}
        colorPalette={colorPalette}
        variant={variant}
        width={width || { name: 'full' }}
        borderRadius={borderRadius || '2xl'}
      />
    </SegmentContainer>
  );
}
