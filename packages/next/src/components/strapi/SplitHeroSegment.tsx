import { chakra } from '@openagenda/uikit';
import { color } from 'utils/strapi';
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

const StyledSegmentContainer = chakra(SegmentContainer);

export default function SplitHeroSegment({
  title,
  image,
  text,
  imagePosition,
  CTAs,
  backgroundColor,
}: SplitHeroSegmentProps) {
  return (
    <StyledSegmentContainer
      colorPalette={backgroundColor}
      bg={
        !backgroundColor || backgroundColor.name === 'white'
          ? 'white'
          : color(backgroundColor.name, 'subtle')
      }
    >
      <SplitHero
        title={title}
        image={image}
        text={text}
        imagePosition={imagePosition}
        CTAs={CTAs}
      />
    </StyledSegmentContainer>
  );
}
