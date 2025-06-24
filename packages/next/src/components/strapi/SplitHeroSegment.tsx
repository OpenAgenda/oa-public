import SegmentContainer from './SegmentContainer';
import SplitHero from './SplitHero';

interface SplitHeroSegmentProps {
  title?: string;
  description?: string;
  image?: any;
  text?: string;
  imagePosition?: string;
  CTAButton?: any;
}

export default function SplitHeroSegment({
  title,
  image,
  text,
  imagePosition,
  CTAButton,
}: SplitHeroSegmentProps) {
  return (
    <SegmentContainer>
      <SplitHero
        title={title}
        image={image}
        text={text}
        imagePosition={imagePosition}
        CTAButton={CTAButton}
      />
    </SegmentContainer>
  );
}
