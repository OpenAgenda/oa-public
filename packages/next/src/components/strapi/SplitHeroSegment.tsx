import SegmentContainer from './SegmentContainer';
import SplitHero from './SplitHero';

export default function SplitHeroSegment(props) {
  return (
    <SegmentContainer>
      <SplitHero {...props} />
    </SegmentContainer>
  );
}
