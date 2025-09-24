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
  coverImage?: boolean;
}

export default function SplitHeroSegment({
  title,
  image,
  text,
  imagePosition,
  CTAs,
  background,
  coverImage,
  fontColor,
}: SplitHeroSegmentProps) {
  return (
    <SegmentContainer
      background={background}
      fontColor={fontColor}
      fullWidth={!!coverImage}
    >
      <SplitHero
        coverImage={coverImage}
        background={background}
        title={title}
        image={image}
        text={text}
        imagePosition={imagePosition}
        CTAs={CTAs}
      />
    </SegmentContainer>
  );
}
