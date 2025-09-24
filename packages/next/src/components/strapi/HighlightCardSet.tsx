import { Flex, Stack } from '@openagenda/uikit';
import HighlightCard from './HighlightCard';
import SegmentContainer from './SegmentContainer';
import type { Color } from './types';

interface HighlightCardSetProps {
  title: string;
  description?: string;
  cardSize?: string;
  Cards: Array<any>;
  CTAs?: any[];
  background?: any;
  fontColor?: Color;
  descriptionColor?: Color;
}

export default function HighlightCardSet({
  title,
  description,
  Cards,
  CTAs,
  cardSize = 'medium',
  background,
  fontColor,
  descriptionColor,
}: HighlightCardSetProps) {
  return (
    <SegmentContainer
      title={title}
      description={description}
      CTAs={CTAs}
      background={background}
      fontColor={fontColor}
      descriptionColor={descriptionColor}
    >
      <Stack gap={cardSize === 'large' ? 10 : 8} align="center">
        <Flex wrap="wrap" justify="center" gap={cardSize === 'large' ? 12 : 8}>
          {Cards.map((Highlight) => (
            <HighlightCard
              key={Highlight.id}
              {...Highlight}
              cardSize={cardSize}
              fontColor={fontColor}
            />
          ))}
        </Flex>
      </Stack>
    </SegmentContainer>
  );
}
