import { chakra, Flex, Stack } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import HighlightCard from './HighlightCard';
import SegmentContainer from './SegmentContainer';

interface HighlightCardSetProps {
  title: string;
  description?: string;
  cardSize?: string;
  Cards: Array<any>;
  CTAs?: any[];
  backgroundColor?: any;
  themeColor?: any;
}

const StyledSegmentContainer = chakra(SegmentContainer);

export default function HighlightCardSet({
  title,
  description,
  Cards,
  CTAs,
  cardSize = 'medium',
  backgroundColor,
  themeColor,
}: HighlightCardSetProps) {
  const componentBackgroundColor =
    themeColor?.name === 'white' ? themeColor : { name: 'white' };
  return (
    <StyledSegmentContainer
      title={title}
      description={description}
      CTAs={CTAs}
      bg={
        !backgroundColor || backgroundColor.name === 'white'
          ? 'white'
          : color(backgroundColor.name, 'subtle')
      }
    >
      <Stack gap={cardSize === 'large' ? 10 : 8} align="center">
        <Flex wrap="wrap" justify="center" gap={cardSize === 'large' ? 12 : 8}>
          {Cards.map((Highlight) => (
            <HighlightCard
              key={Highlight.id}
              {...Highlight}
              cardSize={cardSize}
              backgroundColor={componentBackgroundColor}
            />
          ))}
        </Flex>
      </Stack>
    </StyledSegmentContainer>
  );
}
