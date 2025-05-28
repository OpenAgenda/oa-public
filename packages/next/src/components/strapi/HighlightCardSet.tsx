import { Flex, Stack, Heading } from '@openagenda/uikit';
import HighlightCard from './HighlightCard';
import SegmentContainer from './SegmentContainer';

interface HighlightCardSetProps {
  title: string;
  description?: string;
  Cards: Array<any>;
}

export default function HighlightCardSet({
  title,
  description,
  Cards,
}: HighlightCardSetProps) {
  return (
    <SegmentContainer title={title}>
      <Stack gap={8} align="center">
        {description && (
          <Heading size="md" textAlign="center" color="gray.600">
            {description}
          </Heading>
        )}
        <Flex wrap="wrap" justify="center" gap={8}>
          {Cards.map((Highlight) => (
            <HighlightCard key={Highlight.id} {...Highlight} />
          ))}
        </Flex>
      </Stack>
    </SegmentContainer>
  );
}
