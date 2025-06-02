import { Text } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import SegmentContainer from './SegmentContainer';
import Carousel from './Carousel';
import type { Color } from './types';

interface CarouselSetProps {
  title?: string;
  description?: string;
  Components: Array<any>;
  colorPalette?: Color;
  backgroundColor?: Color;
  gradient?: boolean;
  fontColor?: Color;
  carouselBgColor?: Color;
  _titleColor?: Color;
  descriptionColor?: Color;
  variant?: string;
  width?: { name: string };
  borderRadius?: string;
  _fontSize?: { name: string };
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
  _titleColor,
  descriptionColor,
  variant,
  width,
  borderRadius,
  _fontSize,
}: CarouselSetProps) {
  return (
    <SegmentContainer
      backgroundColor={backgroundColor}
      fontColor={fontColor}
      title={title}
    >
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
