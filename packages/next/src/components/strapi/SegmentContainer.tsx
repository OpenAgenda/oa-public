import { Container, chakra, H2 } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import type { Color } from './types';

interface SegmentContainerProps {
  children: React.ReactNode;
  backgroundColor?: Color;
  fontColor?: Color;
  title?: string;
}

export default function SegmentContainer({
  children,
  backgroundColor,
  fontColor,
  title,
}: SegmentContainerProps) {
  return (
    <chakra.div
      backgroundColor={backgroundColor ? color(backgroundColor) : undefined}
    >
      <Container
        maxW="7xl"
        color={fontColor ? color(fontColor) : undefined}
        py="24"
      >
        {title && (
          <H2 mb={4} fontWeight="bold">
            {title}
          </H2>
        )}
        {children}
      </Container>
    </chakra.div>
  );
}
