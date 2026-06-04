import { Box } from '@openagenda/uikit';
import SegmentContainer from './SegmentContainer';
import StrapiMarkdown from './StrapiMarkdown';
import type { Color } from './types';

interface RichTextBlockProps {
  content?: string;
  background?: any;
  fontColor?: Color;
  additionalTopPadding?: any;
}

// Full-page rich text block (privacy policy, news articles, …). The section
// background spans the full width while the text stays within a centered,
// readable column, left-aligned. Basic formatting (bold, italic, lists,
// links) and text/background color come from the markdown content and the
// fontColor/background relations resolved by SegmentContainer.
export default function RichTextBlock({
  content,
  background,
  fontColor,
  additionalTopPadding,
}: RichTextBlockProps) {
  if (!content) {
    return null;
  }

  return (
    <SegmentContainer
      background={background}
      fontColor={fontColor}
      additionalTopPadding={additionalTopPadding}
    >
      <Box maxW="4xl" mx="auto" w="full">
        <StrapiMarkdown flex={null} textAlign="left">
          {content}
        </StrapiMarkdown>
      </Box>
    </SegmentContainer>
  );
}
