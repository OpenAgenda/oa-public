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
}

export default function SplitHeroSegment({
  title,
  image,
  text,
  imagePosition,
  CTAs,
  backgroundColor,
}: SplitHeroSegmentProps) {
  return (
    <SegmentContainer backgroundColor={backgroundColor}>
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
