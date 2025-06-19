import SegmentContainer from './SegmentContainer';
import SplitHero from './SplitHero';

interface SplitHeroSegmentProps {
  title?: string;
  description?: string;
  image?: any;
  text?: string;
  imagePosition?: string;
}

export default function SplitHeroSegment({
  title,
  image,
  text,
  imagePosition,
}: SplitHeroSegmentProps) {
  return (
    <SegmentContainer>
      <SplitHero
        title={title}
        image={image}
        text={text}
        imagePosition={imagePosition}
      />
    </SegmentContainer>
  );
}
