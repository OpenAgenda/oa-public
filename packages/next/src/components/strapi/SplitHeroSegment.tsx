import SegmentContainer from './SegmentContainer';
import SplitHero from './SplitHero';

export default function SplitHeroSegment({ title, image, text, direction }) {
  return (
    <SegmentContainer>
      <SplitHero
        title={title}
        image={image}
        text={text}
        direction={direction}
      />
    </SegmentContainer>
  );
}
