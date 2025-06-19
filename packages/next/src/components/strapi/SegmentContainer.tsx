import { Container, chakra, H2, Heading } from '@openagenda/uikit';
import { color } from 'utils/strapi';
import type { Color } from './types';

interface SegmentContainerProps {
  children: React.ReactNode;
  backgroundColor?: Color;
  fontColor?: Color;
  title?: string;
  description?: string;
}

export default function SegmentContainer({
  children,
  backgroundColor,
  fontColor,
  title,
  description,
}: SegmentContainerProps) {
  return (
    <chakra.div
      backgroundColor={
        backgroundColor ? `${backgroundColor?.name}.solid` : null
      }
    >
      <Container
        maxW="7xl"
        color={fontColor ? color(fontColor) : undefined}
        py="24"
      >
        {title && (
          <H2 mb={description ? 4 : 16} fontWeight="bold" textAlign="center">
            {title}
          </H2>
        )}
        {description && (
          <Heading size="md" textAlign="center" color="gray.600" mb={16}>
            {description}
          </Heading>
        )}
        {children}
      </Container>
    </chakra.div>
  );
}
