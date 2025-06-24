import SegmentContainer from './SegmentContainer';
import SplitHero from './SplitHero';

interface SplitHeroSegmentProps {
  title?: string;
  description?: string;
  image?: any;
  text?: string;
  imagePosition?: string;
  CTAs?: any;
}

export default function SplitHeroSegment({
  title,
  image,
  text,
  imagePosition,
  CTAs,
}: SplitHeroSegmentProps) {
  return (
    <SegmentContainer>
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
