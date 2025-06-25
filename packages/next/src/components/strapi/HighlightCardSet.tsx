import { Flex, Stack } from '@openagenda/uikit';
import HighlightCard from './HighlightCard';
import SegmentContainer from './SegmentContainer';

interface HighlightCardSetProps {
  title: string;
  description?: string;
  Cards: Array<any>;
  CTAs?: any[];
}

export default function HighlightCardSet({
  title,
  description,
  Cards,
  CTAs,
}: HighlightCardSetProps) {
  return (
    <SegmentContainer title={title} description={description} CTAs={CTAs}>
      <Stack gap={8} align="center">
        <Flex wrap="wrap" justify="center" gap={8}>
          {Cards.map((Highlight) => (
            <HighlightCard key={Highlight.id} {...Highlight} />
          ))}
        </Flex>
      </Stack>
    </SegmentContainer>
  );
}
