import { Flex, Stack } from '@openagenda/uikit';
import HighlightCard from './HighlightCard';
import SegmentContainer from './SegmentContainer';

interface HighlightCardSetProps {
  title: string;
  description?: string;
  cardSize?: string;
  Cards: Array<any>;
  CTAs?: any[];
  backgroundColor?: any;
  componentsBackgroundColor?: any;
  colorVariant?: string;
}

export default function HighlightCardSet({
  title,
  description,
  Cards,
  CTAs,
  cardSize = 'medium',
  backgroundColor,
  componentsBackgroundColor,
  colorVariant,
}: HighlightCardSetProps) {
  return (
    <SegmentContainer
      title={title}
      description={description}
      CTAs={CTAs}
      backgroundColor={backgroundColor}
      colorVariant={colorVariant}
    >
      <Stack gap={cardSize === 'large' ? 10 : 8} align="center">
        <Flex wrap="wrap" justify="center" gap={cardSize === 'large' ? 12 : 8}>
          {Cards.map((Highlight) => (
            <HighlightCard
              key={Highlight.id}
              {...Highlight}
              cardSize={cardSize}
              backgroundColor={componentsBackgroundColor}
            />
          ))}
        </Flex>
      </Stack>
    </SegmentContainer>
  );
}
