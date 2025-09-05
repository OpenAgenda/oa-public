import SegmentContainer from './SegmentContainer';
import SplitHero from './SplitHero';

interface SplitHeroSegmentProps {
  title?: string;
  description?: string;
  image?: any;
  text?: string;
  imagePosition?: string;
  CTAs?: any;
  background?: any;
  fontColor?: any;
}

export default function SplitHeroSegment({
  title,
  image,
  text,
  imagePosition,
  CTAs,
  background,
  fontColor,
}: SplitHeroSegmentProps) {
  return (
    <SegmentContainer background={background} fontColor={fontColor}>
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
