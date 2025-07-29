import SegmentContainer from './SegmentContainer';
import SplitHero from './SplitHero';

interface SplitHeroSegmentProps {
  title?: string;
  description?: string;
  image?: any;
  text?: string;
  imagePosition?: string;
  CTAs?: any;
  backgroundColor?: any;
  colorVariant?: string;
}

export default function SplitHeroSegment({
  title,
  image,
  text,
  imagePosition,
  CTAs,
  backgroundColor,
  colorVariant,
}: SplitHeroSegmentProps) {
  return (
    <SegmentContainer
      backgroundColor={backgroundColor}
      colorVariant={colorVariant}
    >
      <SplitHero
        title={title}
        image={image}
        text={text}
        imagePosition={imagePosition}
        CTAs={CTAs}
      />
    </SegmentContainer>
  );
}
